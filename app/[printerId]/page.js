"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { getPDFPageCount, validatePDFFile } from "../../utils/pdfUtils";
import PaymentModal from "@/components/PaymentModal";

const VPS_API_URL = process.env.VPS_API_URL;

const PageSelector = dynamic(() => import("../../components/PageSelector"), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  ),
});

export default function PrinterPage() {
  const params = useParams();
  const printerId = params.printerId;

  const [printer, setPrinter] = useState(null);
  const [file, setFile] = useState(null);
  const [advancedSettings, setAdvancedSettings] = useState({
    colorPages: [],
    bwPages: [],
    copies: 1,
    printSettings: {
      paperSize: "A4",
      orientation: "PORTRAIT",
      quality: "NORMAL",
      margins: "NORMAL",
      duplex: false,
    },
    cost: 0,
  });
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [currentJobId, setCurrentJobId] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [userPoints, setUserPoints] = useState(null);
  const [checkingPoints, setCheckingPoints] = useState(false);
  const [refreshingPoints, setRefreshingPoints] = useState(false);
  const [userSession, setUserSession] = useState(null);
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [refreshingTransactions, setRefreshingTransactions] = useState(false);
  const [cooldownTimers, setCooldownTimers] = useState({});

  useEffect(() => {
    fetchPrinterDetails();
  }, [printerId]);

  // Fetch pending transactions ketika user login
  useEffect(() => {
    if (userSession?.phone) {
      console.log("DATA USER SESSION", userSession);
      fetchPendingTransactions();
    } else {
      setPendingTransactions([]); // Clear jika logout
    }
  }, [userSession]);

  // Function untuk fetch pending transactions
  const fetchPendingTransactions = async () => {
    if (!userSession?.phone) return;

    setLoadingTransactions(true);
    try {
      const response = await fetch(
        `/api/transactions/pending?phoneNumber=${userSession.phone}`
      );
      const result = await response.json();

      if (result.success) {
        setPendingTransactions(result.pendingTransactions || []);
        console.log(
          `📦 Loaded ${result.pendingTransactions.length} pending transactions`
        );
      } else {
        console.error("Failed to fetch pending transactions:", result.error);
      }
    } catch (error) {
      console.error("Error fetching pending transactions:", error);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const refreshPendingTransactions = async () => {
    if (!userSession?.phone) return;

    // Cek cooldown untuk refresh
    if (cooldownTimers["refresh"]) {
      console.log("⏳ Refresh dalam cooldown, tunggu sebentar...");
      return;
    }

    setRefreshingTransactions(true);

    // Set cooldown untuk refresh (3 detik)
    setCooldownTimers((prev) => ({
      ...prev,
      ["refresh"]: true,
    }));

    try {
      console.log("🔄 Refreshing pending transactions with Midtrans sync...");

      // Gunakan endpoint sync yang baru
      const response = await fetch(
        `/api/transactions/pending/sync?phoneNumber=${userSession.phone}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setPendingTransactions(result.pendingTransactions || []);

        // Tampilkan notifikasi jika ada perubahan status
        if (
          result.updatedTransactions &&
          result.updatedTransactions.length > 0
        ) {
          console.log(
            `🔄 ${result.updatedTransactions.length} transactions updated from Midtrans`
          );

          // Tampilkan alert untuk transaksi yang berhasil dibayar
          const settledTransactions = result.updatedTransactions.filter(
            (tx) => tx.newStatus === "settlement"
          );

          if (settledTransactions.length > 0) {
            alert(
              `✅ ${settledTransactions.length} transaksi berhasil dibayar dan siap diprint!`
            );

            // Auto process settlement transactions
            for (const settledTx of settledTransactions) {
              try {
                // Cari transaction data lengkap
                const transaction = result.pendingTransactions.find(
                  (tx) => tx.orderId === settledTx.orderId
                );

                if (transaction && transaction.status === "settlement") {
                  console.log(
                    `🔄 Auto-processing settled transaction: ${transaction.orderId}`
                  );

                  // Set state untuk processing
                  setAdvancedSettings(transaction.settings);
                  setTotalPages(transaction.fileData.pages);
                  setCurrentJobId(transaction.orderId);

                  // Process print
                  await processSuccessfulPayment(transaction);
                }
              } catch (error) {
                console.error(
                  `❌ Error auto-processing ${settledTx.orderId}:`,
                  error
                );
              }
            }
          }
        }

        console.log(
          `🔄 Refreshed ${
            result.pendingTransactions?.length || 0
          } pending transactions`
        );
      } else {
        console.error("Failed to refresh pending transactions:", result.error);
      }
    } catch (error) {
      console.error("Error refreshing pending transactions:", error);
    } finally {
      setRefreshingTransactions(false);

      // Reset cooldown setelah 3 detik
      setTimeout(() => {
        setCooldownTimers((prev) => ({
          ...prev,
          ["refresh"]: false,
        }));
      }, 3000);
    }
  };

  const continuePendingTransaction = async (transaction) => {
    if (cooldownTimers[transaction.orderId]) {
      console.log("⏳ Tombol dalam cooldown, tunggu sebentar...");
      return;
    }

    try {
      console.log("🔄 Continuing pending transaction:", transaction.orderId);

      // Set cooldown untuk tombol ini (5 detik)
      setCooldownTimers((prev) => ({
        ...prev,
        [transaction.orderId]: true,
      }));

      // SYNC KE MIDTRANS TERLEBIH DAHULU
      console.log("🔍 Syncing with Midtrans for latest status...");
      const syncResponse = await fetch(
        `/api/payment/status?orderId=${transaction.orderId}`
      );

      if (syncResponse.ok) {
        const syncResult = await syncResponse.json();

        if (syncResult.success) {
          const latestStatus = syncResult.status;
          console.log(
            `📊 Latest Midtrans status for ${transaction.orderId}: ${latestStatus}`
          );

          // Update transaction dengan status terbaru
          const updatedTransaction = {
            ...transaction,
            midtransStatus: latestStatus,
            status:
              latestStatus === "settlement" ? "settlement" : transaction.status,
          };

          // Jika status sudah settlement, langsung proses print
          if (latestStatus === "settlement") {
            console.log("✅ Transaction already paid, proceeding to print...");

            // Update status di VPS
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

            // Set state dari transaction data
            setAdvancedSettings(updatedTransaction.settings);
            setTotalPages(updatedTransaction.fileData.pages);
            setCurrentJobId(updatedTransaction.orderId);

            // Langsung proses print tanpa payment modal
            await processSuccessfulPayment(updatedTransaction);

            // Reset cooldown setelah selesai
            setTimeout(() => {
              setCooldownTimers((prev) => ({
                ...prev,
                [transaction.orderId]: false,
              }));
            }, 3000);
            return;
          }

          // Untuk transaksi pending, buka payment modal seperti biasa
          if (!updatedTransaction.fileData?.hasFile) {
            alert(
              "❌ File tidak tersimpan untuk transaksi ini. Silakan buat transaksi baru."
            );
            // Reset cooldown
            setCooldownTimers((prev) => ({
              ...prev,
              [transaction.orderId]: false,
            }));
            return;
          }

          setAdvancedSettings(updatedTransaction.settings);
          setTotalPages(updatedTransaction.fileData.pages);
          setCurrentJobId(updatedTransaction.orderId);

          setPaymentData({
            token: updatedTransaction.paymentToken,
            redirectUrl: updatedTransaction.redirectUrl,
            amount: updatedTransaction.cost,
            orderId: updatedTransaction.orderId,
            isRestored: true,
          });

          setShowPaymentModal(true);
          console.log("✅ Transaction restored for continuation");

          // Reset cooldown setelah modal terbuka
          setTimeout(() => {
            setCooldownTimers((prev) => ({
              ...prev,
              [transaction.orderId]: false,
            }));
          }, 3000);
        } else {
          throw new Error(syncResult.error || "Failed to sync with Midtrans");
        }
      } else {
        throw new Error("Failed to check payment status");
      }
    } catch (error) {
      console.error("Error continuing transaction:", error);
      alert("❌ Gagal memulihkan transaksi: " + error.message);

      // Reset cooldown jika error
      setCooldownTimers((prev) => ({
        ...prev,
        [transaction.orderId]: false,
      }));
    }
  };

  // Function untuk memproses print setelah payment sukses (untuk restored transactions)
  const processSuccessfulPayment = async (transaction) => {
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

      // Siapkan payload untuk print
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
        isRestoredTransaction: true, // Tandai sebagai restored transaction
      };

      console.log("📤 Sending restored transaction to print API...");

      // Kirim sebagai JSON ke endpoint print
      const response = await fetch("/api/print", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(printPayload),
      });

      // Handle response
      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Print API error response:", errorText);
        throw new Error(
          `Print failed: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();

      if (result.success) {
        // Hapus transaksi dari pending setelah success
        if (userSession) {
          await fetch("/api/transactions/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: transaction.orderId,
              phoneNumber: userSession.phone,
            }),
          });
        }

        // Refresh user points
        if (userSession) {
          setTimeout(() => {
            refreshUserPoints();
          }, 3000);
        }

        alert(
          `✅ Print job berhasil dikirim!\n` +
            `📄 ${totalPagesToPrint} halaman akan dicetak.\n` +
            (userSession
              ? `🎉 +${pointsToAdd} point telah ditambahkan!\n`
              : "") +
            `Job ID: ${result.jobId}\n\nHalaman akan direfresh...`
        );

        // Refresh transactions list
        await refreshPendingTransactions();

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

  // Function untuk batalkan transaksi dari list
  const cancelPendingTransaction = async (transaction) => {
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: transaction.orderId,
          phoneNumber: userSession.phone,
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log("✅ Transaction cancelled:", transaction.orderId);
        alert("❌ Transaksi berhasil dibatalkan");

        // Refresh list
        await refreshPendingTransactions();
      } else {
        throw new Error(result.error || "Gagal membatalkan transaksi");
      }
    } catch (error) {
      console.error("Error cancelling transaction:", error);
      alert("❌ Gagal membatalkan transaksi: " + error.message);
    }
  };

  // FUNCTION UNTUK RESTORE PENDING TRANSACTION
  const restorePendingTransaction = async (transaction) => {
    try {
      console.log("🔄 Restoring pending transaction:", transaction.orderId);

      // Set state dari transaction data
      setAdvancedSettings(transaction.settings);
      setTotalPages(transaction.fileData.pages);
      setCurrentJobId(transaction.orderId);

      // Cek status payment di Midtrans
      const statusResponse = await fetch(
        `/api/payment/status?orderId=${transaction.orderId}`
      );
      const statusResult = await statusResponse.json();

      if (statusResult.success) {
        if (statusResult.status === "settlement") {
          // Payment sudah sukses, lanjutkan ke print
          alert("✅ Payment sudah berhasil! Melanjutkan proses print...");
          await processSuccessfulPayment(transaction);
        } else {
          // Payment masih pending, buka modal lagi
          setPaymentData({
            token: transaction.paymentToken,
            redirectUrl: transaction.redirect_url,
            amount: transaction.cost,
            orderId: transaction.orderId,
          });
          setShowPaymentModal(true);
          alert("🔄 Melanjutkan transaksi yang tertunda...");
        }
      }
    } catch (error) {
      console.error("Error restoring transaction:", error);
      alert("❌ Gagal memulihkan transaksi sebelumnya");
    }
  };

  const fetchPrinterDetails = async () => {
    try {
      const response = await fetch(`/api/printers/${printerId}`);
      const result = await response.json();

      if (result.success) {
        setPrinter(result.printer);
      }
    } catch (error) {
      console.error("Error fetching printer:", error);
    }
  };

  const refreshUserPoints = async () => {
    if (!userSession) {
      alert("Silakan login terlebih dahulu");
      return;
    }

    setRefreshingPoints(true);
    try {
      const response = await fetch(`/api/users/${userSession.phone}/points`);
      console.log("📡 [FRONTEND] Refresh points response:", response);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.user) {
        const newPoints = result.points || 0;
        setUserPoints(newPoints);
        setUserSession((prev) => ({
          ...prev,
          points: newPoints,
        }));

        const updatedSession = {
          ...userSession,
          points: newPoints,
          timestamp: Date.now(),
        };
        localStorage.setItem("userSession", JSON.stringify(updatedSession));

        alert(
          `✅ Point berhasil di-refresh! Point terbaru: ${newPoints.toFixed(
            2
          )} poin`
        );
      } else {
        alert("❌ User tidak ditemukan. Silakan login ulang.");
        logoutUser();
      }
    } catch (error) {
      console.error("❌ Error refreshing points:", error);
      alert("❌ Gagal refresh poin: " + error.message);
    } finally {
      setRefreshingPoints(false);
    }
  };

  const handleFileUpload = async (selectedFile) => {
    const validation = validatePDFFile(selectedFile);
    if (!validation.isValid) {
      alert(validation.error);
      return false;
    }

    setIsLoading(true);
    try {
      const pageCount = await getPDFPageCount(selectedFile);
      setTotalPages(pageCount);
      setFile(selectedFile);

      const defaultColorPages = [1];
      const defaultBwPages = Array.from(
        { length: pageCount - 1 },
        (_, i) => i + 2
      );

      const initialSettings = {
        colorPages: defaultColorPages,
        bwPages: defaultBwPages,
        copies: 1,
        printSettings: {
          paperSize: "A4",
          orientation: "PORTRAIT",
          quality: "NORMAL",
          margins: "NORMAL",
          duplex: false,
        },
        cost: 0,
      };

      setAdvancedSettings(initialSettings);

      return true;
    } catch (error) {
      console.error("Error reading PDF:", error);
      alert("Gagal membaca file PDF. Silakan coba file lain.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingsChange = (newSettings) => {
    setAdvancedSettings(newSettings);
  };

  const handleSubmit = async (e) => {
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

      // BACA FILE SEBAGAI BASE64 UNTUK DISIMPAN
      const fileBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          // Remove data:application/pdf;base64, prefix
          const base64 = reader.result.split(",")[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // 1. Buat payment di Midtrans
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

      // 2. SIMPAN KE DATABASE VPS DENGAN FILE CONTENT (jika user login)
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
          expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 jam
        };

        const saveResponse = await fetch("/api/transactions/pending", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(transactionData),
        });

        const saveResult = await saveResponse.json();

        if (!saveResult.success) {
          console.warn(
            "⚠️ Gagal menyimpan transaksi ke database, tetapi lanjutkan..."
          );
        } else {
          console.log("✅ Transaksi pending tersimpan di database");
          console.log(`📁 File saved: ${saveResult.fileSaved ? "Yes" : "No"}`);
        }
      }

      // 3. Tampilkan modal payment
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

  const handlePaymentSuccess = async () => {
    try {
      setIsLoading(true);

      // ✅ VERIFIKASI: Cek status payment sebelum lanjut
      console.log("🔍 Verifying payment for order:", currentJobId);

      const statusResponse = await fetch(
        `/api/payment/status?orderId=${currentJobId}`
      );

      // DEBUG: Better error handling
      if (!statusResponse.ok) {
        throw new Error(
          `Payment status check failed: ${statusResponse.status}`
        );
      }

      const statusResult = await statusResponse.json();

      if (!statusResult.success || statusResult.status !== "settlement") {
        throw new Error(
          `Payment belum sukses. Status: ${statusResult.status || "unknown"}`
        );
      }

      console.log("✅ Payment verified, proceeding with print...");

      const totalPagesToPrint =
        (advancedSettings.colorPages.length + advancedSettings.bwPages.length) *
        advancedSettings.copies;
      const pointsToAdd = (advancedSettings.cost / 2000).toFixed(2);

      // ✅ PERUBAHAN: SELALU GUNAKAN ENDPOINT /api/print
      const endpoint = "/api/print";

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
        isRestoredTransaction: paymentData?.isRestored || false, // ✅ TAMBAH FLAG INI
      };

      let response;

      if (paymentData?.isRestored) {
        // ✅ Untuk restored transaction, kirim sebagai JSON ke endpoint yang sama
        console.log("🔄 Sending RESTORED transaction as JSON");
        response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(printPayload),
        });
      } else {
        // ✅ Untuk normal transaction, kirim sebagai FormData
        console.log("📄 Sending NORMAL transaction as FormData");
        const formData = new FormData();
        formData.append("pdf", file);
        Object.keys(printPayload).forEach((key) => {
          formData.append(key, printPayload[key]);
        });

        response = await fetch(endpoint, {
          method: "POST",
          body: formData,
        });
      }

      // ✅ Better response handling
      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Print API error response:", errorText);
        throw new Error(
          `Print failed: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();

      if (result.success) {
        // ✅ CLEANUP: Hapus transaksi dari pending setelah success
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

        if (userSession) {
          setTimeout(() => {
            refreshUserPoints();
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
      alert(`❌ Error setelah pembayaran: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  const handlePaymentCancelled = () => {
    setShowPaymentModal(false);
    setPaymentData(null);
    // alert("❌ Pembayaran dibatalkan. Silakan coba lagi.");
  };

  const checkUserPoints = async () => {
    if (!phoneNumber.trim()) {
      alert("Silakan masukkan nomor HP terlebih dahulu");
      return;
    }

    const cleanPhone = phoneNumber.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      alert("Nomor HP harus minimal 10 digit");
      return;
    }

    setCheckingPoints(true);
    try {
      const response = await fetch(`/api/users/${cleanPhone}/points`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        if (result.user) {
          setUserPoints(result.points);
          setUserSession({
            phone: cleanPhone,
            points: result.points,
            name: result.user.name || `User ${cleanPhone}`,
          });

          localStorage.setItem(
            "userSession",
            JSON.stringify({
              phone: cleanPhone,
              points: result.points,
              name: result.user.name || `User ${cleanPhone}`,
              timestamp: Date.now(),
            })
          );

          alert(
            `✅ Point berhasil dicek! Anda memiliki ${result.points.toFixed(
              2
            )} point.`
          );
        } else if (result.user === null) {
          await createNewUserDirect(cleanPhone);
        }
      } else {
        throw new Error(result.error || "Gagal memeriksa poin");
      }
    } catch (error) {
      console.error("❌ Error checking points:", error);
      await createNewUserDirect(cleanPhone, true);
    } finally {
      setCheckingPoints(false);
    }
  };

  const createNewUserDirect = async (phone, isFallback = false) => {
    try {
      const createResponse = await fetch(`/api/users/points`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: phone,
          points: 0,
          amount: 0,
          orderId: `init-${Date.now()}`,
          fileName: "user-initialization.pdf",
        }),
      });

      if (createResponse.ok) {
        const createResult = await createResponse.json();

        setUserPoints(0);
        setUserSession({
          phone: phone,
          points: 0,
          name: `User ${phone}`,
        });

        localStorage.setItem(
          "userSession",
          JSON.stringify({
            phone: phone,
            points: 0,
            name: `User ${phone}`,
            timestamp: Date.now(),
          })
        );

        if (isFallback) {
          alert("✅ Nomor HP berhasil didaftarkan! Mulai dengan 0 point.");
        } else {
          alert("✅ Akun baru berhasil dibuat! Anda mendapatkan 0 point awal.");
        }
      } else {
        throw new Error("Gagal membuat user baru");
      }
    } catch (error) {
      console.error("❌ Error creating user:", error);

      setUserPoints(0);
      setUserSession({
        phone: phone,
        points: 0,
        name: `User ${phone}`,
      });

      localStorage.setItem(
        "userSession",
        JSON.stringify({
          phone: phone,
          points: 0,
          name: `User ${phone}`,
          timestamp: Date.now(),
        })
      );

      alert("⚠️ Sistem point sedang maintenance. Lanjut dengan 0 point.");
    }
  };

  const logoutUser = () => {
    setUserSession(null);
    setUserPoints(null);
    setPhoneNumber("");
    localStorage.removeItem("userSession");
  };

  useEffect(() => {
    const savedSession = localStorage.getItem("userSession");
    if (savedSession) {
      const session = JSON.parse(savedSession);
      if (Date.now() - session.timestamp < 24 * 60 * 60 * 1000) {
        setUserSession(session);
        setUserPoints(session.points);
        setPhoneNumber(session.phone);
      } else {
        localStorage.removeItem("userSession");
      }
    }
  }, []);

  if (!printer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat printer...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">
                {printer.name}
              </h1>
              <p className="text-gray-600 text-sm sm:text-base mt-1 truncate">
                {printer.location?.address}
              </p>
            </div>
            <div className="flex flex-col sm:items-end gap-2">
              <div
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                  printer.status === "online"
                    ? "bg-green-100 text-green-800"
                    : printer.status === "offline"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {printer.status === "online"
                  ? "🟢 Online"
                  : printer.status === "offline"
                  ? "🔴 Offline"
                  : "🟡 Maintenance"}
              </div>
              <p className="text-gray-600 text-xs sm:text-sm">
                {printer.paperStatus?.paperCount || 0} kertas tersedia
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-4 sm:p-6 lg:p-8">
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              {/* File Upload Section */}
              <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-blue-600 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  Upload File
                </h2>

                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 sm:h-40 border-2 border-dashed border-blue-300 rounded-xl cursor-pointer bg-white hover:bg-blue-50 transition-all duration-200">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-10 w-10 sm:h-12 sm:w-12 text-blue-500 mb-2 sm:mb-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="text-sm sm:text-base text-gray-600 mb-1">
                        <span className="font-semibold">Klik untuk upload</span>
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        PDF saja (Maks. 10MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf"
                      onChange={async (e) => {
                        const selectedFile = e.target.files[0];
                        if (selectedFile) {
                          if (selectedFile.type === "application/pdf") {
                            const success = await handleFileUpload(
                              selectedFile
                            );
                            if (!success) {
                              e.target.value = "";
                            }
                          } else {
                            alert("Hanya file PDF yang diperbolehkan!");
                            e.target.value = "";
                          }
                        }
                      }}
                      required
                    />
                  </label>
                </div>

                {file && (
                  <div className="mt-3 flex items-center justify-center sm:justify-start">
                    <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-green-600 mr-2 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-green-700 text-sm truncate max-w-[200px] sm:max-w-none">
                        {file.name}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {file && totalPages > 0 && (
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 sm:p-6">
                  <PageSelector
                    totalPages={totalPages}
                    initialSettings={advancedSettings}
                    onSettingsChange={handleSettingsChange}
                    file={file}
                  />
                </div>
              )}

              {/* Section Point Reward */}
              <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4 sm:p-6 lg:p-6">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-5 flex items-center">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-yellow-600 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                  Point Reward
                </h3>

                {!userSession ? (
                  <div className="space-y-4 sm:space-y-5">
                    <div>
                      <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2 sm:mb-3">
                        Nomor HP untuk Cek Poin
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="Contoh: 085117038583"
                          className="flex-1 p-3 sm:p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white text-gray-700 text-sm sm:text-base"
                        />
                        <button
                          type="button"
                          onClick={checkUserPoints}
                          disabled={checkingPoints}
                          className="px-4 sm:px-6 py-3 sm:py-4 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:bg-yellow-400 transition-colors font-medium cursor-pointer text-sm sm:text-base flex items-center justify-center min-w-[120px] sm:min-w-[140px]"
                        >
                          {checkingPoints ? (
                            <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                          ) : (
                            "Check Point"
                          )}
                        </button>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 mt-2 sm:mt-3">
                        Masukkan nomor HP untuk melihat dan mendapatkan poin
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 sm:space-y-5">
                    {/* User Info Header */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
                      <div className="flex-1">
                        <p className="text-sm sm:text-base text-gray-600 mb-1">
                          Nomor HP terdaftar:
                        </p>
                        <p className="font-semibold text-gray-800 text-base sm:text-lg break-all">
                          {userSession.phone}
                        </p>
                      </div>
                      <div className="flex gap-2 sm:gap-3 self-start sm:self-center">
                        <button
                          onClick={refreshUserPoints}
                          disabled={refreshingPoints}
                          className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:bg-blue-50 transition-colors cursor-pointer flex items-center gap-1 sm:gap-2"
                          title="Refresh point terbaru"
                        >
                          {refreshingPoints ? (
                            <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-blue-700"></div>
                          ) : (
                            <svg
                              className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                              />
                            </svg>
                          )}
                          <span className=" sm:inline">Refresh</span>
                        </button>
                        <button
                          onClick={logoutUser}
                          className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors cursor-pointer flex items-center gap-1 sm:gap-2"
                        >
                          <svg
                            className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                          <span className=" sm:inline">Logout</span>
                        </button>
                      </div>
                    </div>

                    {/* Points Display Card */}
                    <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 border-2 border-yellow-200 shadow-sm">
                      <div className="text-center">
                        <p className="text-sm sm:text-base text-gray-600 mb-2">
                          Total Point Anda
                        </p>
                        <p className="text-2xl sm:text-4xl lg:text-5xl font-bold text-yellow-600 mb-4 sm:mb-6">
                          {typeof userPoints === "number"
                            ? userPoints.toFixed(2)
                            : "0.00"}{" "}
                          <span className="text-lg sm:text-xl lg:text-2xl text-yellow-500">
                            Point
                          </span>
                        </p>

                        {/* TOMBOL TUKAR POINT */}
                        <button
                          onClick={() =>
                            window.open(
                              "https://irc-store-one.vercel.app/product",
                              "_blank"
                            )
                          }
                          className="w-full max-w-xs mx-auto px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 font-medium text-sm sm:text-base cursor-pointer flex items-center justify-center gap-2 sm:gap-3 shadow-lg"
                        >
                          ⭐ Tukar Point
                        </button>

                        <p className="text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4">
                          Terakhir update: {new Date().toLocaleTimeString()}
                        </p>
                      </div>
                    </div>

                    {/* Points Earned Preview */}
                    {advancedSettings.cost > 0 && userSession && (
                      <div className="bg-green-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-green-200">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4">
                          <span className="text-sm sm:text-base text-gray-700 text-center sm:text-left">
                            Point yang akan didapat:
                          </span>
                          <span className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600 text-center sm:text-right">
                            +{(advancedSettings.cost / 2000).toFixed(2)} poin
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Section Pending Transactions - Hanya tampil jika user login dan ada pending transactions */}
              {userSession &&
                (pendingTransactions.length > 0 || loadingTransactions) && (
                  <div className="bg-purple-50 rounded-xl border border-purple-200 p-4 sm:p-6 lg:p-6">
                    <div className="flex items-center justify-between mb-4 sm:mb-5">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center">
                        <svg
                          className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-purple-600 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Transaksi Tertunda
                      </h3>

                      <button
                        onClick={refreshPendingTransactions}
                        disabled={
                          refreshingTransactions || cooldownTimers["refresh"]
                        }
                        className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 disabled:bg-purple-50 transition-colors cursor-pointer flex items-center gap-1 sm:gap-2"
                        title="Refresh daftar transaksi"
                      >
                        {refreshingTransactions || cooldownTimers["refresh"] ? (
                          <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-purple-700"></div>
                        ) : (
                          <svg
                            className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                        )}
                        <span className="hidden sm:inline">
                          {refreshingTransactions || cooldownTimers["refresh"]
                            ? "Loading..."
                            : "Refresh"}
                        </span>
                      </button>
                    </div>

                    {/* Loading State */}
                    {loadingTransactions && (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                      </div>
                    )}

                    {/* Transactions List */}
                    {!loadingTransactions && pendingTransactions.length > 0 && (
                      <div className="space-y-3">
                        {/* // Di dalam map transactions, tambahkan badge status */}
                        {pendingTransactions.map((transaction, index) => (
                          <div
                            key={transaction.orderId}
                            className="bg-white rounded-lg border border-purple-100 p-3 sm:p-4 shadow-sm"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                              {/* Transaction Info */}
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-mono text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                    {transaction.orderId}
                                  </span>
                                  <span
                                    className={`text-xs px-2 py-1 rounded ${
                                      transaction.status === "settlement"
                                        ? "bg-green-100 text-green-700"
                                        : transaction.status === "expired"
                                        ? "bg-red-100 text-red-700"
                                        : "bg-yellow-100 text-yellow-700"
                                    }`}
                                  >
                                    {transaction.status === "settlement"
                                      ? "✅ Lunas"
                                      : transaction.status === "expired"
                                      ? "❌ Kadaluarsa"
                                      : "⏳ Menunggu Bayar"}
                                  </span>
                                  <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
                                    {transaction.fileData?.pages || 0} halaman
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700 font-medium truncate">
                                  {transaction.fileData?.name || "Unknown File"}
                                </p>
                                <p className="text-lg font-bold text-purple-600">
                                  Rp {transaction.cost?.toLocaleString("id-ID")}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Dibuat:{" "}
                                  {new Date(
                                    transaction.createdAt
                                  ).toLocaleDateString("id-ID")}
                                  {transaction.paidAt && (
                                    <>
                                      {" "}
                                      • Lunas:{" "}
                                      {new Date(
                                        transaction.paidAt
                                      ).toLocaleDateString("id-ID")}
                                    </>
                                  )}
                                </p>
                              </div>

                              {/* Action Buttons - Sesuaikan berdasarkan status */}
                              <div className="flex gap-2 sm:flex-col sm:gap-1">
                                {transaction.status === "settlement" ? (
                                  <button
                                    onClick={() =>
                                      continuePendingTransaction(transaction)
                                    }
                                    disabled={
                                      isLoading ||
                                      cooldownTimers[transaction.orderId]
                                    }
                                    className="px-3 py-2 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 disabled:bg-green-300 transition-colors cursor-pointer flex items-center gap-1"
                                  >
                                    {cooldownTimers[transaction.orderId] ? (
                                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                    ) : (
                                      <svg
                                        className="w-3 h-3"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M5 13l4 4L19 7"
                                        />
                                      </svg>
                                    )}
                                    {cooldownTimers[transaction.orderId]
                                      ? "Loading..."
                                      : "Print Sekarang"}
                                  </button>
                                ) : transaction.status === "pending" ? (
                                  <>
                                    <button
                                      onClick={() =>
                                        continuePendingTransaction(transaction)
                                      }
                                      disabled={
                                        isLoading ||
                                        cooldownTimers[transaction.orderId]
                                      }
                                      className="px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors cursor-pointer flex items-center gap-1"
                                    >
                                      {cooldownTimers[transaction.orderId] ? (
                                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                      ) : (
                                        <svg
                                          className="w-3 h-3"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                                          />
                                        </svg>
                                      )}
                                      {cooldownTimers[transaction.orderId]
                                        ? "Loading..."
                                        : "Lanjutkan Bayar"}
                                    </button>
                                    <button
                                      onClick={() =>
                                        cancelPendingTransaction(transaction)
                                      }
                                      disabled={isLoading}
                                      className="px-3 py-2 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 disabled:bg-red-300 transition-colors cursor-pointer flex items-center gap-1"
                                    >
                                      <svg
                                        className="w-3 h-3"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M6 18L18 6M6 6l12 12"
                                        />
                                      </svg>
                                      Batalkan
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={() =>
                                      cancelPendingTransaction(transaction)
                                    }
                                    className="px-3 py-2 bg-gray-600 text-white text-xs font-medium rounded-lg hover:bg-gray-700 transition-colors cursor-pointer flex items-center gap-1"
                                  >
                                    <svg
                                      className="w-3 h-3"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                      />
                                    </svg>
                                    Hapus
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Empty State */}
                    {!loadingTransactions &&
                      pendingTransactions.length === 0 && (
                        <div className="text-center py-6">
                          <svg
                            className="w-12 h-12 text-purple-300 mx-auto mb-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <p className="text-purple-600 font-medium">
                            Tidak ada transaksi tertunda
                          </p>
                          <p className="text-purple-500 text-sm mt-1">
                            Semua transaksi sudah selesai atau dibatalkan
                          </p>
                        </div>
                      )}

                    {/* Help Text */}
                    <div className="mt-3 pt-3 border-t border-purple-200">
                      <p className="text-xs text-purple-600">
                        💡 Transaksi tertunda akan otomatis kadaluarsa setelah 1
                        jam
                      </p>
                    </div>
                  </div>
                )}

              {advancedSettings.cost > 0 && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 p-4 sm:p-6 lg:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 lg:gap-6">
                    {/* Left Section - Text Info */}
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 mb-1 sm:mb-2">
                        Total Biaya
                      </h3>
                      <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
                        {totalPages} halaman × {advancedSettings.copies} rangkap
                      </p>
                    </div>

                    {/* Right Section - Price */}
                    <div className="text-center sm:text-right">
                      <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-600 mb-1">
                        Rp {advancedSettings.cost.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {advancedSettings.cost > 0 && (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed text-lg"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Memproses...
                    </div>
                  ) : (
                    "💳 Bayar dan Print"
                  )}
                </button>
              )}
            </form>
          </div>
        </div>
      </main>

      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-sm w-full">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mr-4"></div>
              <div>
                <p className="font-semibold text-gray-800">Memproses...</p>
                <p className="text-gray-600 text-sm mt-1">
                  Harap tunggu sebentar
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={handlePaymentCancelled}
        onSuccess={handlePaymentSuccess}
        paymentData={paymentData}
        isLoading={isLoading}
        userSession={userSession}
        isRestoredTransaction={paymentData?.isRestored || false}
      />
    </div>
  );
}
