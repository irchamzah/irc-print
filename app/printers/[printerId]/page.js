"use client";
import { usePrinterPage } from "./hooks/usePrinterPage";
import { PrinterHeader } from "./components/PrinterHeader";
import { FileUploadSection } from "./components/FileUploadSection";
import { PointsSection } from "./components/PointsSection";
import { PendingTransactionsSection } from "./components/PendingTransactionsSection";
import { TotalCostSection } from "./components/TotalCostSection";
import { SubmitButton } from "./components/SubmitButton";
import { LoadingSpinner, FullPageLoader } from "./components/LoadingSpinner";
import dynamic from "next/dynamic";
import PaymentModal from "@/app/printers/[printerId]/components/PaymentModal";

const PageSelector = dynamic(
  () => import("@/app/printers/[printerId]/components/PageSelector"),
  {
    ssr: false,
    loading: () => (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    ),
  }
);

export default function PrinterPage() {
  const {
    // States
    printer,
    file,
    advancedSettings,
    totalPages,
    isLoading,
    showPaymentModal,
    paymentData,
    userPoints,
    checkingPoints,
    refreshingPoints,
    userSession,
    pendingTransactions,
    loadingTransactions,
    refreshingTransactions,
    cooldownTimers,
    isRefreshing,
    isPrinterOffline,

    // Setters
    setPhoneNumber,

    // Functions
    handleFileUpload,
    handleSettingsChange,
    handleSubmit,
    handlePaymentSuccess,
    handlePaymentCancelled,
    checkUserPoints,
    logoutUser,
    refreshUserPoints,
    refreshPendingTransactions,
    handleContinuePendingTransaction,
    handleCancelPendingTransaction,
    handlePhoneNumberChange,
  } = usePrinterPage();

  if (!printer) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <PrinterHeader printer={printer} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-4 sm:p-6 lg:p-8">
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              <FileUploadSection
                file={file}
                onFileUpload={handleFileUpload}
                isLoading={isLoading}
              />

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

              <PointsSection
                userSession={userSession}
                userPoints={userPoints}
                phoneNumber={userSession?.phone || ""}
                checkingPoints={checkingPoints}
                refreshingPoints={refreshingPoints}
                advancedSettings={advancedSettings}
                onCheckPoints={checkUserPoints}
                onRefreshPoints={refreshUserPoints}
                onLogout={logoutUser}
                onPhoneNumberChange={handlePhoneNumberChange}
              />

              <PendingTransactionsSection
                userSession={userSession}
                pendingTransactions={pendingTransactions}
                loadingTransactions={loadingTransactions}
                refreshingTransactions={refreshingTransactions}
                cooldownTimers={cooldownTimers}
                onRefresh={refreshPendingTransactions}
                onContinue={handleContinuePendingTransaction}
                onCancel={handleCancelPendingTransaction}
                isLoading={isLoading}
                isPrinterOffline={isPrinterOffline}
              />

              <TotalCostSection
                advancedSettings={advancedSettings}
                totalPages={totalPages}
              />

              <SubmitButton
                isLoading={isLoading}
                advancedSettings={advancedSettings}
                onSubmit={handleSubmit}
                isPrinterOffline={isPrinterOffline}
                userSession={userSession}
              />
            </form>
          </div>
        </div>
      </main>

      {isLoading && <FullPageLoader />}

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
