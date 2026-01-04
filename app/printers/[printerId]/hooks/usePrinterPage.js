// app/printers/[printerId]/hooks/usePrinterPage.js
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useUserManagement } from "./useUserManagement";
import { useFileManagement } from "./useFileManagement";
import { usePaymentManagement } from "./usePaymentManagement";
import { useRefreshData } from "./useRefreshData";

export const usePrinterPage = () => {
  const params = useParams();
  const printerId = params.printerId;
  const [printer, setPrinter] = useState(null);
  const [isPrinterOffline, setIsPrinterOffline] = useState(false);
  const [isPaperInsufficient, setIsPaperInsufficient] = useState(false);
  const [availablePaper, setAvailablePaper] = useState(0);
  const [totalPagesNeeded, setTotalPagesNeeded] = useState(0);

  // Initialize all custom hooks
  const userManagement = useUserManagement();
  const fileManagement = useFileManagement();
  const paymentManagement = usePaymentManagement(
    printerId,
    fileManagement.setAdvancedSettings,
    fileManagement.setTotalPages
  );

  const refreshData = useRefreshData(
    userManagement.userSession,
    userManagement.setUserPoints,
    userManagement.setUserSession,
    paymentManagement.setPendingTransactions,
    userManagement.setRefreshingPoints,
    paymentManagement.setRefreshingTransactions,
    paymentManagement.setCooldownTimers
  );

  // Effects
  useEffect(() => {
    fetchPrinterDetails();
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

  // ✅ EFFECT BARU: Check printer status berdasarkan data printer
  useEffect(() => {
    if (printer) {
      // Cek status langsung dari data printer
      const isOffline = printer.status === "offline";
      setIsPrinterOffline(isOffline);
    }
  }, [printer]);

  // ✅ EFFECT BARU: Validasi kertas setiap kali ada perubahan
  useEffect(() => {
    checkPaperAvailability();
  }, [
    printer,
    fileManagement.advancedSettings,
    fileManagement.totalPages,
    paymentManagement.pendingTransactions,
  ]);

  // Functions
  const fetchPrinterDetails = async () => {
    try {
      const response = await fetch(`/api/printers/${printerId}`);
      const result = await response.json();

      if (result.success) {
        setPrinter(result.printer);
      }
    } catch (error) {
      console.error("Error fetching printer:", error);
      // Jika error fetch, anggap offline untuk safety
      setIsPrinterOffline(true);
    }
  };

  // ✅ FUNCTION BARU: Validasi ketersediaan kertas
  const checkPaperAvailability = () => {
    if (!printer) return;

    const availablePaperCount = printer.paperStatus?.paperCount || 0;
    setAvailablePaper(availablePaperCount);

    // Hitung total halaman yang akan diprint
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
        .filter((tx) => tx.status === "pending" || tx.status === "settlement")
        .reduce((total, tx) => {
          const txPages =
            (tx.settings?.colorPages?.length || 0) +
            (tx.settings?.bwPages?.length || 0);
          const txCopies = tx.settings?.copies || 1;
          return total + txPages * txCopies;
        }, 0);
      totalNeeded += pendingPages;
    }

    setTotalPagesNeeded(totalNeeded);

    // Cek apakah kertas cukup
    const isInsufficient = totalNeeded > availablePaperCount;
    setIsPaperInsufficient(isInsufficient);
  };

  // Combined handleFileUpload with isLoading
  const handleFileUpload = async (selectedFile) => {
    return fileManagement.handleFileUpload(
      selectedFile,
      paymentManagement.setIsLoading
    );
  };

  // Combined handleSubmit with refresh - TAMBAH VALIDASI KERTAS
  const handleSubmit = async (e) => {
    // ✅ TAMBAH VALIDASI USER SESSION
    if (!userManagement.userSession?.phone) {
      alert(
        "❌ Harus Login terlebih dahulu. Masukkan nomor HP dan klik 'Login'."
      );
      return;
    }

    if (isPrinterOffline) {
      alert("❌ Printer sedang offline. Tidak dapat melakukan print saat ini.");
      return;
    }

    // ✅ TAMBAH VALIDASI KERTAS
    if (isPaperInsufficient) {
      alert(
        `❌ Kertas tidak cukup! Butuh ${totalPagesNeeded} halaman, tersedia ${availablePaper} halaman.`
      );
      return;
    }

    return paymentManagement.handleSubmit(
      e,
      fileManagement.file,
      fileManagement.advancedSettings,
      fileManagement.totalPages,
      userManagement.userSession,
      refreshData.refreshAllData
    );
  };

  // Combined handlePaymentSuccess with refresh
  const handlePaymentSuccess = async () => {
    return paymentManagement.handlePaymentSuccess(
      paymentManagement.currentJobId,
      fileManagement.advancedSettings,
      printerId,
      fileManagement.file,
      userManagement.userSession,
      paymentManagement.paymentData,
      refreshData.refreshAllData
    );
  };

  // Combined handlePaymentCancelled with refresh
  const handlePaymentCancelled = () => {
    return paymentManagement.handlePaymentCancelled(refreshData.refreshAllData);
  };

  // TAMBAH VALIDASI KERTAS di continuePendingTransaction
  const handleContinuePendingTransaction = async (transaction) => {
    // ✅ TAMBAH VALIDASI KERTAS
    if (isPaperInsufficient) {
      alert(
        `❌ Kertas tidak cukup! Butuh ${totalPagesNeeded} halaman, tersedia ${availablePaper} halaman.`
      );
      return;
    }

    return paymentManagement.continuePendingTransaction(
      transaction,
      userManagement.userSession
    );
  };

  // ✅ TAMBAHKAN: Wrapper untuk cancelPendingTransaction
  const handleCancelPendingTransaction = async (transaction) => {
    return paymentManagement.cancelPendingTransaction(
      transaction,
      userManagement.userSession
    );
  };

  return {
    // States from all hooks
    printer,
    isPrinterOffline,
    isPaperInsufficient, // ✅ TAMBAH INI
    availablePaper, // ✅ TAMBAH INI
    totalPagesNeeded, // ✅ TAMBAH INI
    ...userManagement,
    ...fileManagement,
    ...paymentManagement,
    isRefreshing: refreshData.isRefreshing,

    // Setters
    setPrinter,

    // Functions
    fetchPrinterDetails,
    handleFileUpload,
    handleSubmit,
    handlePaymentSuccess,
    handlePaymentCancelled,
    handleContinuePendingTransaction,
    handleCancelPendingTransaction,
    refreshAllData: refreshData.refreshAllData,
    refreshUserPoints: refreshData.refreshUserPoints,
    refreshPendingTransactions: refreshData.refreshPendingTransactions,
  };
};
