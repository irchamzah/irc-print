// app/printers/[printerId]/hooks/usePrinterPage.js
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useUserManagement } from "./useUserManagement";
import { useFileManagement } from "./useFileManagement";
import { usePaymentManagement } from "./usePaymentManagement";
import { useRefreshData } from "./useRefreshData";

// usePrinterPage TERPAKAI
export const usePrinterPage = () => {
  const params = useParams();
  const printerId = params.printerId;

  const [printer, setPrinter] = useState(null);
  const [finalPrices, setFinalPrices] = useState(null); // ✅ Ganti prices → finalPrices
  const [isPrinterOffline, setIsPrinterOffline] = useState(false);
  const [isPaperInsufficient, setIsPaperInsufficient] = useState(false);
  const [availablePaper, setAvailablePaper] = useState(0);
  const [totalPagesNeeded, setTotalPagesNeeded] = useState(0);
  const [pointDivider, setPointDivider] = useState(0);
  const [enabledFeatures, setEnabledFeatures] = useState(null); // ✅ Tambah untuk fitur yang di-enable
  const [videoGuides, setVideoGuides] = useState({});
  const [showPaperSizeModal, setShowPaperSizeModal] = useState(false);

  // Initialize all custom hooks
  const userManagement = useUserManagement();
  const fileManagement = useFileManagement();
  const paymentManagement = usePaymentManagement(
    printerId,
    fileManagement.setAdvancedSettings,
    fileManagement.setTotalPages,
  );

  const refreshData = useRefreshData(
    userManagement.userSession,
    userManagement.setUserPoints,
    userManagement.setUserSession,
    paymentManagement.setPendingTransactions,
    userManagement.setRefreshingPoints,
    paymentManagement.setRefreshingTransactions,
    paymentManagement.setCooldownTimers,
  );

  useEffect(() => {
    fetchPrinterDetails();
    fetchVideoGuides();
  }, [printerId]);

  useEffect(() => {
    if (userManagement.userSession?.phone) {
      paymentManagement.fetchPendingTransactions(userManagement.userSession);
    } else {
      paymentManagement.setPendingTransactions([]);
    }
  }, [userManagement.userSession]);

  useEffect(() => {
    userManagement.loadUserSession();
  }, []);

  useEffect(() => {
    if (printer) {
      const isOffline = printer.status === "offline";
      setIsPrinterOffline(isOffline);
    }
  }, [printer]);

  useEffect(() => {
    checkPaperAvailability();
  }, [
    printer,
    fileManagement.advancedSettings,
    fileManagement.totalPages,
    paymentManagement.pendingTransactions,
  ]);

  // ============================================
  // fetchVideoGuides - Ambil video tutorial dari platform settings
  // ============================================
  const fetchVideoGuides = async () => {
    try {
      const res = await fetch("/api/public/platform-config");
      const data = await res.json();
      if (data.success && data.data?.videoGuides) {
        setVideoGuides(data.data.videoGuides);
      }
    } catch {
      // Silent fail — video guide hanya opsional
    }
  };

  // ============================================
  // fetchPrinterDetails - UPDATED dengan struktur baru
  // ============================================
  const fetchPrinterDetails = async () => {
    try {
      const response = await fetch(`/api/printers/${printerId}`);
      const result = await response.json();

      if (result.success) {
        const printerData = result.printer;
        setPrinter(printerData);
        setPointDivider(printerData.pointDivider || 4000);

        // ✅ UPDATE: Gunakan finalPrices dari response (sudah dihitung VPS)
        if (printerData.finalPrices) {
          setFinalPrices(printerData.finalPrices);
          localStorage.setItem(
            "printerFinalPrices",
            JSON.stringify(printerData.finalPrices),
          );
        }

        // ✅ UPDATE: Simpan enabledFeatures untuk validasi frontend
        if (printerData.enabledFeatures) {
          setEnabledFeatures(printerData.enabledFeatures);
        }

        localStorage.setItem(
          "printerPointDivider",
          printerData.pointDivider || 4000,
        );
      }
    } catch (error) {
      console.error("Error fetching printer:", error);
      setIsPrinterOffline(true);
    }
  };

  // ============================================
  // checkPaperAvailability - UPDATED
  // ============================================
  const checkPaperAvailability = () => {
    if (!printer) return;

    const availablePaperCount = printer.paperStatus?.paperCount || 0;
    setAvailablePaper(availablePaperCount);

    let totalNeeded = 0;

    // 1. Hitung dari current transaction (jika ada file)
    if (fileManagement.file && fileManagement.totalPages > 0) {
      const currentPages =
        (fileManagement.advancedSettings.colorPages.length +
          fileManagement.advancedSettings.bwPages.length) *
        fileManagement.advancedSettings.copies;
      totalNeeded += currentPages;
    }

    // 2. Hitung dari pending transactions yang belum settlement
    if (paymentManagement.pendingTransactions.length > 0) {
      const pendingPages = paymentManagement.pendingTransactions
        .filter(
          (tx) =>
            tx.transactionStatus === "pending" ||
            tx.transactionStatus === "settlement",
        )
        .reduce((total, tx) => {
          const txPages = tx.settings?.selectedPages?.length || 0;
          const txCopies = tx.settings?.copies || 1;
          return total + txPages * txCopies;
        }, 0);
      totalNeeded += pendingPages;
    }

    setTotalPagesNeeded(totalNeeded);

    const isInsufficient = totalNeeded > availablePaperCount;
    setIsPaperInsufficient(isInsufficient);
  };

  // ============================================
  // getPricePerSheet - Helper baru untuk ambil harga
  // ============================================
  const getPricePerSheet = (colorMode, paperSize) => {
    if (!finalPrices) return 0;
    return finalPrices[colorMode]?.[paperSize] || 0;
  };

  // ============================================
  // calculateTotalCost - Helper baru untuk hitung total
  // ============================================
  const calculateTotalCost = (colorPages, bwPages, paperSize, copies = 1) => {
    if (!finalPrices) return 0;

    const colorPrice = finalPrices.color?.[paperSize] || 0;
    const bwPrice = finalPrices.monochrome?.[paperSize] || 0;

    const total =
      (colorPages.length * colorPrice + bwPages.length * bwPrice) * copies;
    return total;
  };

  // ============================================
  // formatRupiah - Helper untuk format mata uang
  // ============================================
  const formatRupiah = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  // ============================================
  // handleFileUpload
  // ============================================
  const handleFileUpload = async (selectedFile) => {
    const success = await fileManagement.handleFileUpload(
      selectedFile,
      paymentManagement.setIsLoading,
    );
    if (success && printer?.paperMode === "unlimited") {
      setShowPaperSizeModal(true);
    }
    return success;
  };

  // ============================================
  // handleSubmit - UPDATED dengan validasi fitur
  // ============================================
  const handleSubmit = async (e) => {
    if (!userManagement.userSession?.phone) {
      alert(
        "❌ Harus Login terlebih dahulu. Masukkan nomor HP dan klik 'Login'.",
      );
      return;
    }

    if (isPrinterOffline) {
      alert("❌ Printer sedang offline. Tidak dapat melakukan print saat ini.");
      return;
    }

    // ✅ CEK PAPER MODE: Hanya validasi kertas jika mode LIMITED
    const isUnlimitedMode = printer?.paperMode === "unlimited";

    if (!isUnlimitedMode && isPaperInsufficient) {
      alert(
        `❌ Kertas tidak cukup! Butuh ${totalPagesNeeded} halaman, tersedia ${availablePaper} halaman.`,
      );
      return;
    }

    // ✅ VALIDASI: Cek apakah ukuran kertas didukung printer
    const selectedPaperSize = fileManagement.advancedSettings.paperSize || "A4";
    if (
      enabledFeatures &&
      !enabledFeatures.paperSizes?.includes(selectedPaperSize)
    ) {
      alert(
        `❌ Printer ini tidak mendukung ukuran kertas ${selectedPaperSize}. Ukuran yang didukung: ${enabledFeatures.paperSizes?.join(", ")}`,
      );
      return;
    }

    // ✅ VALIDASI: Cek apakah kualitas didukung
    const selectedQuality = (
      fileManagement.advancedSettings.quality || "normal"
    ).toLowerCase();
    if (
      enabledFeatures &&
      !enabledFeatures.qualities?.includes(selectedQuality)
    ) {
      alert(
        `❌ Printer ini tidak mendukung kualitas ${selectedQuality}. Kualitas yang didukung: ${enabledFeatures.qualities?.join(", ")}`,
      );
      return;
    }

    return paymentManagement.handleSubmit(
      e,
      fileManagement.file,
      fileManagement.advancedSettings,
      fileManagement.totalPages,
      userManagement.userSession,
      refreshData.refreshAllData,
    );
  };

  // ============================================
  // handlePaymentSuccess
  // ============================================
  const handlePaymentSuccess = async () => {
    // ✅ Gunakan paymentManagement.currentPrintJobId
    return paymentManagement.handlePaymentSuccess(
      paymentManagement.currentPrintJobId, // ✅ Ganti dari currentJobId
      fileManagement.advancedSettings,
      printerId,
      fileManagement.file,
      userManagement.userSession,
      paymentManagement.paymentData,
      refreshData.refreshAllData,
    );
  };

  // ============================================
  // handlePaymentCancelled
  // ============================================
  const handlePaymentCancelled = () => {
    return paymentManagement.handlePaymentCancelled(refreshData.refreshAllData);
  };

  // ============================================
  // handleContinuePendingTransaction - UPDATED
  // ============================================
  const handleContinuePendingTransaction = async (transaction) => {
    const isUnlimitedMode = printer?.paperMode === "unlimited";

    if (!isUnlimitedMode && isPaperInsufficient) {
      alert(
        `❌ Kertas tidak cukup! Butuh ${totalPagesNeeded} halaman, tersedia ${availablePaper} halaman.`,
      );
      return;
    }

    const txPaperSize = transaction.settings?.printSettings?.paperSize || "A4";
    if (enabledFeatures && !enabledFeatures.paperSizes?.includes(txPaperSize)) {
      alert(
        `❌ Printer ini tidak lagi mendukung ukuran kertas ${txPaperSize}. Silakan batalkan transaksi dan buat baru.`,
      );
      return;
    }

    return paymentManagement.continuePendingTransaction(
      transaction,
      userManagement.userSession,
    );
  };

  // ============================================
  // handleDeleteFailedTransaction
  // ============================================
  const handleDeleteFailedTransaction = (transaction) => {
    if (!window.confirm("Hapus transaksi yang gagal ini?")) return;
    paymentManagement.setPendingTransactions((prev) =>
      prev.filter((t) => t.orderId !== transaction.orderId),
    );
  };

  // ============================================
  // handleCancelPendingTransaction
  // ============================================
  const handleCancelPendingTransaction = async (transaction) => {
    const transactionStatus =
      transaction.transactionStatus || transaction.status;
    let confirmMessage = "";
    let isHighRisk = false;

    switch (transactionStatus) {
      case "paid":
        isHighRisk = true;
        confirmMessage =
          "🔴 PERINGATAN BERAT! 🔴\n\n" +
          "Transaksi ini sudah dibayar sebesar " +
          formatRupiah(transaction.amount || transaction.cost) +
          "\n\n" +
          "KONSEKUENSI PEMBATALAN:\n" +
          "• Uang TIDAK AKAN DIKEMBALIKAN\n" +
          "• File print akan dihapus\n" +
          "• Anda harus membuat transaksi baru untuk print ulang\n\n" +
          "Apakah Anda YAKIN ingin membatalkan transaksi ini?";
        break;

      case "pending":
        confirmMessage =
          "⚠️ Peringatan!\n\n" +
          "Transaksi ini belum dibayar.\n" +
          "Pembatalan akan menghapus file dan data transaksi.\n\n" +
          "Apakah Anda yakin ingin membatalkan?";
        break;

      default:
        confirmMessage =
          "Apakah Anda yakin ingin membatalkan transaksi ini?\n\n" +
          "Transaksi yang dibatalkan tidak dapat dipulihkan.";
        break;
    }

    if (!window.confirm(confirmMessage)) {
      return; // User membatalkan aksi
    }

    // Jika status paid, beri konfirmasi kedua untuk keamanan
    if (isHighRisk) {
      const secondConfirm = window.confirm(
        "KONFIRMASI AKHIR:\n\n" +
          "Anda TIDAK AKAN MENDAPATKAN PENGEMBALIAN DANA.\n\n" +
          "Tekan OK untuk membatalkan transaksi ini.",
      );
      if (!secondConfirm) {
        return;
      }
    }

    return paymentManagement.cancelPendingTransaction(
      transaction,
      userManagement.userSession,
    );
  };

  // isPaperSizeMismatch: untuk limited mode — PDF size ≠ activePaperSize
  const isPaperSizeMismatch =
    printer?.paperMode === "limited" &&
    !!printer?.paperStatus?.activePaperSize &&
    !!fileManagement.detectedPDFSize &&
    printer.paperStatus.activePaperSize !== fileManagement.detectedPDFSize;

  return {
    // Printer states
    printer,
    finalPrices,
    enabledFeatures,
    volumeDiscounts: printer?.volumeDiscounts || [],

    // Paper & printer status
    isPrinterOffline,
    isPaperInsufficient,
    availablePaper,
    totalPagesNeeded,
    pointDivider,

    // Paper size modal (unlimited mode)
    showPaperSizeModal,
    setShowPaperSizeModal,
    videoGuides,
    detectedPDFSize: fileManagement.detectedPDFSize,
    isPaperSizeMismatch,

    // ✅ Payment states (ambil manual dari paymentManagement)
    pendingTransactions: paymentManagement.pendingTransactions,
    loadingTransactions: paymentManagement.loadingTransactions,
    refreshingTransactions: paymentManagement.refreshingTransactions,
    cooldownTimers: paymentManagement.cooldownTimers,
    isLoading: paymentManagement.isLoading,
    showPaymentModal: paymentManagement.showPaymentModal,
    paymentData: paymentManagement.paymentData,
    currentPrintJobId: paymentManagement.currentPrintJobId,

    // User states (from useUserManagement)
    userSession: userManagement.userSession,
    userPoints: userManagement.userPoints,
    checkingPoints: userManagement.checkingPoints,
    refreshingPoints: userManagement.refreshingPoints,

    // File states (from useFileManagement)
    file: fileManagement.file,
    advancedSettings: fileManagement.advancedSettings,
    totalPages: fileManagement.totalPages,

    // Refresh state
    isRefreshing: refreshData.isRefreshing,

    // Helper functions
    getPricePerSheet,
    calculateTotalCost,

    // Setters
    setPrinter,

    // User functions
    checkUserPoints: userManagement.checkUserPoints,
    logoutUser: userManagement.logoutUser,
    refreshUserPoints: refreshData.refreshUserPoints,
    handlePhoneNumberChange: userManagement.handlePhoneNumberChange,

    // File functions
    handleFileUpload,
    handleSettingsChange: fileManagement.handleSettingsChange,

    // Payment functions
    handleSubmit,
    handlePaymentSuccess,
    handlePaymentCancelled,
    handleContinuePendingTransaction,
    handleCancelPendingTransaction,
    handleDeleteFailedTransaction,
    refreshPendingTransactions: refreshData.refreshPendingTransactions,

    // Refresh all
    refreshAllData: refreshData.refreshAllData,
  };
};
