import { useState } from "react";

const VPS_API_URL = process.env.VPS_API_URL;

export const usePaymentManagement = (
  printerId,
  setAdvancedSettings,
  setTotalPages
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [currentJobId, setCurrentJobId] = useState(null);
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [refreshingTransactions, setRefreshingTransactions] = useState(false);
  const [cooldownTimers, setCooldownTimers] = useState({});

  const handleSubmit = async (
    e,
    file,
    advancedSettings,
    totalPages,
    userSession,
    refreshAllData
  ) => {
    e.preventDefault();

    if (!file) {
      alert("Silakan upload file terlebih dahulu!");
      return;
    }

    const finalCost = advancedSettings.cost || 0;

    if (finalCost <= 0) {
      alert(
        "Biaya print belum dihitung. Silakan tunggu sebentar atau periksa pengaturan."
      );
      return;
    }

    setIsLoading(true);

    try {
      const orderId = `print-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Convert file to base64
      const fileBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result.split(",")[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Create payment
      const paymentResponse = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: finalCost,
          orderId: orderId,
          phoneNumber: userSession?.phone || null,
        }),
      });

      const paymentResult = await paymentResponse.json();

      if (!paymentResult.success) {
        throw new Error(
          paymentResult.error || "Gagal membuat transaksi payment"
        );
      }

      // Save to database if user is logged in
      if (userSession) {
        const transactionData = {
          phoneNumber: userSession.phone,
          orderId: orderId,
          printerId: printerId,
          fileData: {
            name: file.name,
            size: file.size,
            pages: totalPages,
            type: file.type,
          },
          fileContent: fileBase64,
          settings: advancedSettings,
          cost: finalCost,
          paymentToken: paymentResult.token,
          status: "pending",
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        };

        await fetch("/api/transactions/pending", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(transactionData),
        });
      }

      // Show payment modal
      setPaymentData({
        token: paymentResult.token,
        redirectUrl: paymentResult.redirect_url,
        amount: finalCost,
        orderId: orderId,
      });

      setShowPaymentModal(true);
      setCurrentJobId(orderId);
    } catch (error) {
      console.error("❌ Payment error:", error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = async (
    currentJobId,
    advancedSettings,
    printerId,
    file,
    userSession,
    paymentData,
    refreshAllData
  ) => {
    try {
      setIsLoading(true);

      // Verify payment status
      const statusResponse = await fetch(
        `/api/payment/status?orderId=${currentJobId}`
      );

      if (!statusResponse.ok) {
        throw new Error(
          `Payment status check failed: ${statusResponse.status}`
        );
      }

      const statusResult = await statusResponse.json();

      // JANGAN THROW ERROR JIKA STATUS BUKAN SETTLEMENT - USER MUNGKIN HANYA CLOSE MODAL
      if (!statusResult.success || statusResult.status !== "settlement") {
        console.log("🔒 User closed payment modal or payment not completed:", {
          status: statusResult.status,
          orderId: currentJobId,
        });

        // Hanya tampilkan info, bukan error
        if (statusResult.status === "pending") {
          console.log("⏳ Payment still pending, user might complete later");
        } else if (statusResult.status === "expire") {
          console.log("❌ Payment expired naturally");
        } else {
          console.log("🔕 Payment modal closed by user");
        }

        setIsLoading(false);
        return; // Keluar tanpa error
      }

      console.log("✅ Payment verified, proceeding with print...");

      const totalPagesToPrint =
        (advancedSettings.colorPages.length + advancedSettings.bwPages.length) *
        advancedSettings.copies;
      const pointsToAdd = (advancedSettings.cost / 2000).toFixed(2);

      const printPayload = {
        orderId: currentJobId,
        printerId: printerId,
        copies: advancedSettings.copies,
        colorPages: JSON.stringify(advancedSettings.colorPages),
        bwPages: JSON.stringify(advancedSettings.bwPages),
        totalCost: advancedSettings.cost,
        totalPages: totalPagesToPrint,
        pointsToAdd: pointsToAdd,
        phoneNumber: userSession?.phone,
        isRestoredTransaction: paymentData?.isRestored || false,
      };

      let response;

      if (paymentData?.isRestored) {
        response = await fetch("/api/print", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(printPayload),
        });
      } else {
        const formData = new FormData();
        formData.append("pdf", file);
        Object.keys(printPayload).forEach((key) => {
          formData.append(key, printPayload[key]);
        });

        response = await fetch("/api/print", {
          method: "POST",
          body: formData,
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Print API error response:", errorText);
        throw new Error(
          `Print failed: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();

      if (result.success) {
        // Cleanup pending transaction
        if (userSession) {
          await fetch("/api/transactions/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: currentJobId,
              phoneNumber: userSession.phone,
            }),
          });
        }

        // Refresh all data
        if (userSession) {
          setTimeout(() => {
            refreshAllData();
          }, 3000);
        }

        alert(
          `✅ Payment berhasil! File sedang diproses untuk print.\n` +
            `📄 ${totalPagesToPrint} halaman akan dicetak.\n` +
            (userSession
              ? `🎉 +${pointsToAdd} point telah ditambahkan!\nPoint akan di-update otomatis...\n`
              : "") +
            `Job ID: ${result.jobId}\n\nHalaman akan direfresh...`
        );

        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        alert(`❌ Gagal mengirim file: ${result.error}`);
      }
    } catch (error) {
      console.error("❌ Error after payment:", error);

      // Hanya tampilkan alert untuk error yang benar-benar critical
      if (
        !error.message.includes("Payment belum sukses") &&
        !error.message.includes("pending") &&
        !error.message.includes("expire")
      ) {
        alert(`❌ Error setelah pembayaran: ${error.message}`);
      } else {
        console.log("🔕 Non-critical payment flow:", error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentCancelled = (refreshAllData) => {
    setShowPaymentModal(false);
    setPaymentData(null);
    // Refresh data ketika modal ditutup
    refreshAllData();
  };

  const fetchPendingTransactions = async (userSession) => {
    if (!userSession?.phone) return;

    setLoadingTransactions(true);
    try {
      const response = await fetch(
        `/api/transactions/pending?phoneNumber=${userSession.phone}`
      );
      const result = await response.json();

      if (result.success) {
        setPendingTransactions(result.pendingTransactions || []);
      } else {
        console.error("Failed to fetch pending transactions:", result.error);
      }
    } catch (error) {
      console.error("Error fetching pending transactions:", error);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const continuePendingTransaction = async (transaction, userSession) => {
    // ✅ Add userSession parameter
    if (cooldownTimers[transaction.orderId]) {
      console.log("⏳ Tombol dalam cooldown, tunggu sebentar...");
      return;
    }

    try {
      setCooldownTimers((prev) => ({ ...prev, [transaction.orderId]: true }));

      // Sync with Midtrans
      console.log(`🔍 Checking payment status for: ${transaction.orderId}`);

      const syncResponse = await fetch(
        `/api/payment/status?orderId=${transaction.orderId}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          signal: AbortSignal.timeout(10000),
        }
      );

      console.log("📡 [FRONTEND] Sync response status:", syncResponse.status);

      if (!syncResponse.ok) {
        const errorText = await syncResponse.text();
        console.error(
          `❌ Payment status check failed: ${syncResponse.status}`,
          errorText
        );
        await openPaymentModalWithoutSync(transaction, userSession); // ✅ Pass userSession
        return;
      }

      const syncResult = await syncResponse.json();

      if (syncResult.success) {
        const latestStatus = syncResult.status;
        const updatedTransaction = {
          ...transaction,
          midtransStatus: latestStatus,
          status:
            latestStatus === "settlement" ? "settlement" : transaction.status,
        };

        if (latestStatus === "settlement") {
          console.log("✅ Transaction already paid, proceeding to print...");

          await fetch(`${VPS_API_URL}/api/transactions/update-status`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: transaction.orderId,
              phoneNumber: userSession.phone,
              status: "settlement",
              midtransStatus: latestStatus,
            }),
          });

          setAdvancedSettings(updatedTransaction.settings);
          setTotalPages(updatedTransaction.fileData.pages);
          setCurrentJobId(updatedTransaction.orderId);
          await processSuccessfulPayment(updatedTransaction, userSession);

          setTimeout(() => {
            setCooldownTimers((prev) => ({
              ...prev,
              [transaction.orderId]: false,
            }));
          }, 3000);
          return;
        }

        if (!updatedTransaction.fileData?.hasFile) {
          alert(
            "❌ File tidak tersimpan untuk transaksi ini. Silakan buat transaksi baru."
          );
          setCooldownTimers((prev) => ({
            ...prev,
            [transaction.orderId]: false,
          }));
          return;
        }

        setAdvancedSettings(updatedTransaction.settings); // ✅ Now available
        setTotalPages(updatedTransaction.fileData.pages); // ✅ Now available
        setCurrentJobId(updatedTransaction.orderId);

        setPaymentData({
          token: updatedTransaction.paymentToken,
          redirectUrl: updatedTransaction.redirectUrl,
          amount: updatedTransaction.cost,
          orderId: updatedTransaction.orderId,
          isRestored: true,
        });

        setShowPaymentModal(true);

        setTimeout(() => {
          setCooldownTimers((prev) => ({
            ...prev,
            [transaction.orderId]: false,
          }));
        }, 3000);
      } else {
        throw new Error(syncResult.error || "Failed to sync with Midtrans");
      }
    } catch (error) {
      console.error("Error continuing transaction:", error);
      if (error.name === "TimeoutError" || error.name === "AbortError") {
        alert(
          "⏰ Timeout saat memeriksa status pembayaran. Membuka halaman pembayaran..."
        );
      } else {
        alert("❌ Gagal memulihkan transaksi: " + error.message);
      }
      await openPaymentModalWithoutSync(transaction, userSession); // ✅ Pass userSession
    }
  };

  const cancelPendingTransaction = async (transaction, userSession) => {
    // ✅ Tambahkan userSession parameter
    if (
      !window.confirm(
        `Apakah Anda yakin ingin membatalkan transaksi ${transaction.orderId}?`
      )
    ) {
      return;
    }

    try {
      const response = await fetch("/api/transactions/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: transaction.orderId,
          phoneNumber: userSession.phone, // ✅ Gunakan parameter
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log("✅ Transaction cancelled:", transaction.orderId);
        alert("❌ Transaksi berhasil dibatalkan");

        // ✅ Refresh transactions dengan memanggil fetchPendingTransactions
        if (userSession) {
          await fetchPendingTransactions(userSession);
        }
      } else {
        throw new Error(result.error || "Gagal membatalkan transaksi");
      }
    } catch (error) {
      console.error("Error cancelling transaction:", error);
      alert("❌ Gagal membatalkan transaksi: " + error.message);
    }
  };
  const processSuccessfulPayment = async (transaction, userSession) => {
    // ✅ Add userSession parameter
    try {
      setIsLoading(true);
      console.log(
        "🖨️ Processing successful payment for transaction:",
        transaction.orderId
      );

      const totalPagesToPrint =
        (transaction.settings.colorPages.length +
          transaction.settings.bwPages.length) *
        transaction.settings.copies;
      const pointsToAdd = (transaction.cost / 2000).toFixed(2);

      const printPayload = {
        orderId: transaction.orderId,
        printerId: printerId,
        copies: transaction.settings.copies,
        colorPages: JSON.stringify(transaction.settings.colorPages),
        bwPages: JSON.stringify(transaction.settings.bwPages),
        totalCost: transaction.cost,
        totalPages: totalPagesToPrint,
        pointsToAdd: pointsToAdd,
        phoneNumber: userSession?.phone,
        isRestoredTransaction: true,
      };

      const response = await fetch("/api/print", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(printPayload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Print API error response:", errorText);
        throw new Error(
          `Print failed: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();

      if (result.success) {
        if (userSession) {
          await fetch("/api/transactions/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: transaction.orderId,
              phoneNumber: userSession.phone, // ✅ Use parameter
            }),
          });
        }

        alert(
          `✅ Print job berhasil dikirim!\n` +
            `📄 ${totalPagesToPrint} halaman akan dicetak.\n` +
            (userSession
              ? `🎉 +${pointsToAdd} point telah ditambahkan!\n`
              : "") +
            `Job ID: ${result.jobId}\n\nHalaman akan direfresh...`
        );

        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        throw new Error(result.error || "Gagal mengirim print job");
      }
    } catch (error) {
      console.error("❌ Error processing successful payment:", error);
      alert(`❌ Gagal memproses print: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const openPaymentModalWithoutSync = async (transaction, userSession) => {
    // ✅ Add userSession parameter
    if (!transaction.fileData?.hasFile) {
      alert(
        "❌ File tidak tersimpan untuk transaksi ini. Silakan buat transaksi baru."
      );
      setCooldownTimers((prev) => ({
        ...prev,
        [transaction.orderId]: false,
      }));
      return;
    }

    setAdvancedSettings(transaction.settings); // ✅ Now available
    setTotalPages(transaction.fileData.pages); // ✅ Now available
    setCurrentJobId(transaction.orderId);

    setPaymentData({
      token: transaction.paymentToken,
      redirectUrl: transaction.redirectUrl,
      amount: transaction.cost,
      orderId: transaction.orderId,
      isRestored: true,
    });

    setShowPaymentModal(true);

    setTimeout(() => {
      setCooldownTimers((prev) => ({
        ...prev,
        [transaction.orderId]: false,
      }));
    }, 3000);
  };

  return {
    // States
    isLoading,
    showPaymentModal,
    paymentData,
    currentJobId,
    pendingTransactions,
    loadingTransactions,
    refreshingTransactions,
    cooldownTimers,

    // Setters
    setIsLoading,
    setShowPaymentModal,
    setPaymentData,
    setCurrentJobId,
    setPendingTransactions,
    setLoadingTransactions,
    setRefreshingTransactions,
    setCooldownTimers,

    // Functions
    handleSubmit,
    handlePaymentSuccess,
    handlePaymentCancelled,
    fetchPendingTransactions,
    continuePendingTransaction,
    cancelPendingTransaction,
    processSuccessfulPayment,
  };
};
