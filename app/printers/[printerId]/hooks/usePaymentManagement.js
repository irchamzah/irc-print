// app/printers/%5BprinterId%5D/hooks/usePaymentManagement.js
import { useState } from "react";

const NEXT_PUBLIC_VPS_API_URL = process.env.NEXT_PUBLIC_VPS_API_URL;

// usePaymentManagement - UPDATED dengan struktur baru
export const usePaymentManagement = (
  printerId,
  setAdvancedSettings,
  setTotalPages,
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [currentPrintJobId, setCurrentPrintJobId] = useState(null); // ✅ Ganti currentJobId
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [refreshingTransactions, setRefreshingTransactions] = useState(false);
  const [cooldownTimers, setCooldownTimers] = useState({});

  // ============================================
  // handleSubmit - Create new print job and payment
  // ============================================
  const handleSubmit = async (
    e,
    file,
    advancedSettings,
    totalPages,
    userSession,
    refreshAllData,
  ) => {
    e.preventDefault();

    if (!file) {
      alert("Silakan upload file terlebih dahulu!");
      return;
    }

    const finalCost = advancedSettings.cost || 0;

    if (finalCost <= 0) {
      alert(
        "Biaya print belum dihitung. Silakan tunggu sebentar atau periksa pengaturan.",
      );
      return;
    }

    setIsLoading(true);

    try {
      const orderId = `print-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Upload file ke VPS terlebih dahulu (binary FormData, bukan base64 JSON)
      const uploadFormData = new FormData();
      uploadFormData.append("pdfFile", file);
      uploadFormData.append("orderId", orderId);

      const uploadResponse = await fetch("/api/transactions/upload-file", {
        method: "POST",
        body: uploadFormData,
      });
      const uploadResult = await uploadResponse.json();
      const uploadedFilePath = uploadResult.success ? uploadResult.filePath : null;

      if (!uploadResult.success) {
        console.warn("⚠️ File pre-upload failed, will continue without stored file:", uploadResult.error);
      }

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
          paymentResult.error || "Gagal membuat transaksi payment",
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
          filePath: uploadedFilePath,
          // fileContent dihapus — file sudah di-upload via FormData terpisah
          settings: {
            ...advancedSettings,
            printSettings: {
              ...advancedSettings.printSettings,
              quality: (
                advancedSettings.printSettings?.quality || "normal"
              ).toLowerCase(),
            },
          },
          cost: finalCost,
          paymentToken: paymentResult.token,
          redirectUrl: paymentResult.redirect_url,
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

      // ✅ PERBAIKAN: Gunakan setCurrentPrintJobId, bukan setCurrentJobId
      setCurrentPrintJobId(orderId);
    } catch (error) {
      console.error("❌ Payment error:", error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // handlePaymentSuccess - After payment success
  // ============================================
  const handlePaymentSuccess = async (
    currentPrintJobId,
    advancedSettings,
    printerId,
    file,
    userSession,
    paymentData,
    refreshAllData,
  ) => {
    try {
      setIsLoading(true);

      // ✅ CEK currentPrintJobId
      if (!currentPrintJobId) {
        console.error("❌ currentPrintJobId is undefined");
        alert("Error: Job ID tidak ditemukan. Silakan coba lagi.");
        setIsLoading(false);
        return;
      }

      // ✅ STEP 1: Sinkronkan status transaksi terlebih dahulu
      try {
        const syncResponse = await fetch(
          `/api/transactions/pending/sync?phoneNumber=${userSession?.phone}`,
        );

        if (syncResponse.ok) {
          const syncResult = await syncResponse.json();
        }
      } catch (syncError) {
        console.error("Sync error (non-critical):", syncError);
        // Continue anyway
      }

      // ✅ STEP 2: Cek status pembayaran ke Midtrans
      const statusResponse = await fetch(
        `/api/payment/status?orderId=${currentPrintJobId}`,
      );

      if (!statusResponse.ok) {
        throw new Error(
          `Payment status check failed: ${statusResponse.status}`,
        );
      }

      const statusResult = await statusResponse.json();

      if (!statusResult.success || statusResult.status !== "settlement") {
        setIsLoading(false);
        return;
      }

      // ✅ STEP 3: Kirim print job ke VPS
      const pointDivider = parseInt(
        localStorage.getItem("printerPointDivider"),
      );
      const totalPagesToPrint =
        (advancedSettings.colorPages.length + advancedSettings.bwPages.length) *
        advancedSettings.copies;

      const totalCost = advancedSettings.cost || 0;
      const pointsToAdd =
        totalCost > 0 ? (totalCost / pointDivider).toFixed(2) : "0";

      const printPayload = {
        orderId: currentPrintJobId,
        printerId: printerId,
        copies: advancedSettings.copies,
        colorPages: JSON.stringify(advancedSettings.colorPages),
        bwPages: JSON.stringify(advancedSettings.bwPages),
        totalCost: advancedSettings.cost,
        totalPages: totalPagesToPrint,
        pointsToAdd: pointsToAdd,
        pointDivider: pointDivider,
        phoneNumber: userSession?.phone,
        paperSize: advancedSettings.paperSize || "A4", // ✅ Tambah
        quality: advancedSettings.quality || "normal", // ✅ Tambah
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
          `Print failed: ${response.status} ${response.statusText}`,
        );
      }

      const result = await response.json();

      if (result.success) {
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
            `Job ID: ${result.printJobId || result.jobId}\n\nHalaman akan direfresh...`,
        );

        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        alert(`❌ Gagal mengirim file: ${result.error}`);
      }
    } catch (error) {
      console.error("❌ Error after payment:", error);
      alert(`❌ Error setelah pembayaran: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // handlePaymentCancelled
  // ============================================
  const handlePaymentCancelled = (refreshAllData) => {
    setShowPaymentModal(false);
    setPaymentData(null);
    refreshAllData();
  };

  // ============================================
  // fetchPendingTransactions
  // ============================================
  const fetchPendingTransactions = async (userSession) => {
    if (!userSession?.phone) return;

    setLoadingTransactions(true);
    try {
      const response = await fetch(
        `/api/transactions/pending?phoneNumber=${userSession.phone}`,
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

  // ============================================
  // continuePendingTransaction
  // ============================================
  const continuePendingTransaction = async (transaction, userSession) => {
    if (cooldownTimers[transaction.orderId]) {
      return;
    }

    try {
      setCooldownTimers((prev) => ({ ...prev, [transaction.orderId]: true }));

      const syncResponse = await fetch(
        `/api/payment/status?orderId=${transaction.orderId}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          signal: AbortSignal.timeout(10000),
        },
      );

      if (!syncResponse.ok) {
        const errorText = await syncResponse.text();
        // ✅ Tetap buka modal payment
        await openPaymentModalWithoutSync(transaction, userSession);
        return;
      }

      const syncResult = await syncResponse.json();

      // ✅ Handle case when transaction not found (belum dibuat)
      if (!syncResult.success && syncResult.message?.includes("not found")) {
        await openPaymentModalWithoutSync(transaction, userSession);
        return;
      }

      if (syncResult.success) {
        const latestStatus = syncResult.status;
        const currentStatus =
          transaction.transactionStatus || transaction.status;
        const updatedTransaction = {
          ...transaction,
          midtransStatus: latestStatus,
          transactionStatus:
            latestStatus === "settlement" ? "settlement" : currentStatus,
        };

        if (latestStatus === "settlement") {
          await fetch(`/api/transactions/update-status`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: transaction.orderId,
              phoneNumber: userSession.phone,
              status: "settlement",
              midtransStatus: latestStatus,
              paymentMethod: syncResult.paymentType,
            }),
          });

          if (transaction.settings) {
            setAdvancedSettings(transaction.settings);
          }

          const totalPagesFromSettings =
            transaction.settings?.totalPages ||
            transaction.settings?.selectedPages?.length ||
            transaction.fileData?.pages ||
            0;
          setTotalPages(totalPagesFromSettings);

          setCurrentPrintJobId(transaction.orderId);
          await processSuccessfulPayment(updatedTransaction, userSession);

          setTimeout(() => {
            setCooldownTimers((prev) => ({
              ...prev,
              [transaction.orderId]: false,
            }));
          }, 3000);
          return;
        }
      }

      // ✅ Cek keberadaan file
      const hasFile = !!transaction.filePath || !!transaction.fileData?.hasFile;

      if (!hasFile) {
        alert(
          "❌ File tidak tersimpan untuk transaksi ini. Silakan buat transaksi baru.",
        );
        setCooldownTimers((prev) => ({
          ...prev,
          [transaction.orderId]: false,
        }));
        return;
      }

      if (transaction.settings) {
        setAdvancedSettings(transaction.settings);
      }

      const totalPagesFromSettings =
        transaction.settings?.totalPages ||
        transaction.settings?.selectedPages?.length ||
        transaction.fileData?.pages ||
        0;
      setTotalPages(totalPagesFromSettings);
      setCurrentPrintJobId(transaction.orderId);

      setPaymentData({
        token:
          transaction.paymentToken ||
          transaction.midtransResponse?.paymentToken,
        redirectUrl:
          transaction.redirectUrl || transaction.midtransResponse?.redirectUrl,
        amount: transaction.amount || transaction.cost,
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
    } catch (error) {
      console.error("Error continuing transaction:", error);
      if (error.name === "TimeoutError" || error.name === "AbortError") {
        alert(
          "⏰ Timeout saat memeriksa status pembayaran. Membuka halaman pembayaran...",
        );
      } else {
        // ✅ Jangan tampilkan alert error untuk transaksi yang belum dibuat
        if (!error.message?.includes("not found")) {
          alert("❌ Gagal memulihkan transaksi: " + error.message);
        }
      }
      await openPaymentModalWithoutSync(transaction, userSession);
    }
  };

  // ============================================
  // cancelPendingTransaction
  // ============================================
  const cancelPendingTransaction = async (transaction, userSession) => {
    if (
      !window.confirm(
        `Apakah Anda yakin ingin membatalkan transaksi ${transaction.orderId}?`,
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
          phoneNumber: userSession.phone,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert("❌ Transaksi berhasil dibatalkan");
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

  // ============================================
  // processSuccessfulPayment
  // ============================================
  const processSuccessfulPayment = async (transaction, userSession) => {
    try {
      setIsLoading(true);

      // ✅ Gunakan transaction.orderId sebagai printJobId
      const printJobId = transaction.orderId;

      if (!printJobId) {
        console.error("❌ printJobId is undefined");
        alert("Error: Job ID tidak ditemukan");
        setIsLoading(false);
        return;
      }

      // ✅ Cek status pembayaran ke Midtrans
      const statusResponse = await fetch(
        `/api/payment/status?orderId=${printJobId}`,
      );

      if (!statusResponse.ok) {
        throw new Error(
          `Payment status check failed: ${statusResponse.status}`,
        );
      }

      const statusResult = await statusResponse.json();

      if (!statusResult.success || statusResult.status !== "settlement") {
        setIsLoading(false);
        alert("❌ Pembayaran belum sukses. Silakan coba lagi.");
        return;
      }

      // ✅ Ambil pointDivider dari localStorage
      const pointDivider =
        parseInt(localStorage.getItem("printerPointDivider")) || 4000;

      // ✅ Hitung total pages
      const totalPagesToPrint =
        (transaction.settings.colorPages.length +
          transaction.settings.bwPages.length) *
        transaction.settings.copies;

      // ✅ Hitung points
      const totalCost = transaction.cost || 0;
      const pointsToAdd =
        totalCost > 0 ? (totalCost / pointDivider).toFixed(2) : "0";

      // ✅ Ambil paperSize dan quality dari transaction.settings
      const paperSize =
        transaction.settings.paperSize ||
        transaction.settings.printSettings?.paperSize ||
        "A4";
      const quality =
        transaction.settings.quality ||
        transaction.settings.printSettings?.quality ||
        "normal";

      // ✅ Buat printPayload dengan data dari transaction
      const printPayload = {
        orderId: printJobId,
        printerId: printerId, // printerId dari closure usePaymentManagement
        copies: transaction.settings.copies || 1,
        colorPages: JSON.stringify(transaction.settings.colorPages || []),
        bwPages: JSON.stringify(transaction.settings.bwPages || []),
        totalCost: totalCost,
        totalPages: totalPagesToPrint,
        pointsToAdd: pointsToAdd,
        pointDivider: pointDivider,
        phoneNumber: userSession?.phone,
        paperSize: paperSize,
        quality: quality.toLowerCase(),
        isRestoredTransaction: true,
      };

      // ✅ Kirim ke VPS via proxy Next.js
      const response = await fetch("/api/print", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(printPayload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Print API error response:", errorText);
        throw new Error(
          `Print failed: ${response.status} ${response.statusText}`,
        );
      }

      const result = await response.json();

      if (result.success) {
        alert(
          `✅ Print job berhasil dikirim!\n` +
            `📄 ${totalPagesToPrint} halaman akan dicetak.\n` +
            (userSession
              ? `🎉 +${pointsToAdd} point telah ditambahkan!\n`
              : "") +
            `Job ID: ${result.printJobId || result.jobId}\n\nHalaman akan direfresh...`,
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

  // ============================================
  // openPaymentModalWithoutSync
  // ============================================
  const openPaymentModalWithoutSync = async (transaction, userSession) => {
    // ✅ Cek keberadaan file
    const hasFile = !!transaction.filePath || !!transaction.fileData?.hasFile;

    if (transaction.settings) {
      setAdvancedSettings(transaction.settings);
    }

    const totalPagesFromSettings =
      transaction.settings?.totalPages ||
      transaction.settings?.selectedPages?.length ||
      transaction.fileData?.pages ||
      0;
    setTotalPages(totalPagesFromSettings);
    setCurrentPrintJobId(transaction.orderId);

    setPaymentData({
      token:
        transaction.paymentToken || transaction.midtransResponse?.paymentToken,
      redirectUrl:
        transaction.redirectUrl || transaction.midtransResponse?.redirectUrl,
      amount: transaction.amount || transaction.cost,
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
    currentPrintJobId, // ✅ Ganti currentJobId → currentPrintJobId
    pendingTransactions,
    loadingTransactions,
    refreshingTransactions,
    cooldownTimers,

    // Setters
    setIsLoading,
    setShowPaymentModal,
    setPaymentData,
    setCurrentPrintJobId,
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
