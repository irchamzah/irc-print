import { TransactionItem } from "./TransactionItem";

export const PendingTransactionsSection = ({
  userSession,
  pendingTransactions,
  loadingTransactions,
  refreshingTransactions,
  cooldownTimers,
  onRefresh,
  onContinue,
  onCancel,
  isLoading,
  isPrinterOffline = false,
}) => {
  // Hanya tampilkan jika user login dan ada transaksi atau sedang loading
  if (
    !userSession ||
    (pendingTransactions.length === 0 && !loadingTransactions)
  ) {
    return null;
  }

  return (
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
          onClick={onRefresh}
          disabled={refreshingTransactions || cooldownTimers["refresh"]}
          type="button"
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

      {/* ✅ TAMBAH WARNING JIKA PRINTER OFFLINE */}
      {isPrinterOffline && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-red-500 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <div>
              <p className="text-red-800 text-sm font-medium">
                Printer sedang offline
              </p>
              <p className="text-red-600 text-xs">
                Transaksi tidak dapat dilanjutkan sampai printer kembali online
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loadingTransactions && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
        </div>
      )}

      {/* Transactions List */}
      {!loadingTransactions && pendingTransactions.length > 0 && (
        <div className="space-y-3">
          {pendingTransactions.map((transaction) => (
            <TransactionItem
              key={transaction.orderId}
              transaction={transaction}
              onContinue={onContinue}
              onCancel={onCancel}
              isLoading={isLoading}
              cooldownTimers={cooldownTimers}
              isPrinterOffline={isPrinterOffline}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loadingTransactions && pendingTransactions.length === 0 && (
        <EmptyTransactionsState />
      )}

      {/* Help Text */}
      <div className="mt-3 pt-3 border-t border-purple-200">
        <p className="text-xs text-purple-600">
          💡 Transaksi tertunda akan otomatis kadaluarsa setelah 1 jam
        </p>
      </div>
    </div>
  );
};

const EmptyTransactionsState = () => (
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
    <p className="text-purple-600 font-medium">Tidak ada transaksi tertunda</p>
    <p className="text-purple-500 text-sm mt-1">
      Semua transaksi sudah selesai atau dibatalkan
    </p>
  </div>
);
