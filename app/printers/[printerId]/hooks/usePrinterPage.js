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

      console.log(
        `🖨️ Printer Status: ${printer.status} | Offline: ${isOffline}`
      );
    }
  }, [printer]);

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

  // Combined handleFileUpload with isLoading
  const handleFileUpload = async (selectedFile) => {
    return fileManagement.handleFileUpload(
      selectedFile,
      paymentManagement.setIsLoading
    );
  };

  // Combined handleSubmit with refresh
  const handleSubmit = async (e) => {
    if (isPrinterOffline) {
      alert("❌ Printer sedang offline. Tidak dapat melakukan print saat ini.");
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

  const handleContinuePendingTransaction = async (transaction) => {
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
