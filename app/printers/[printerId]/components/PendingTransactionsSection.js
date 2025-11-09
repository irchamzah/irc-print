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
  isPaperInsufficient = false,
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

      {/* ✅ PERINGATAN GLOBAL UNTUK SEMUA TRANSACTION */}
      {/* {!isPrinterOffline && !isPaperInsufficient && (
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="text-red-700 text-sm font-bold">
                PERINGATAN: Printer akan langsung mencetak setelah pembayaran!
              </p>
              <p className="text-red-600 text-xs mt-1">
                Harap siap mengambil kertas dari printer
              </p>
            </div>
          </div>
        </div>
      )} */}

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
              isPaperInsufficient={isPaperInsufficient}
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
  <div className="text-center py-8">
    <div className="flex flex-col items-center justify-center">
      {/* Icon */}
      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-purple-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      {/* Text */}
      <h4 className="text-lg font-semibold text-gray-700 mb-2">
        Tidak ada transaksi tertunda
      </h4>
      <p className="text-gray-500 text-sm max-w-xs mx-auto">
        Semua transaksi Anda sudah selesai atau belum ada transaksi yang dibuat
      </p>

      {/* Additional Info */}
      <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-100">
        <p className="text-purple-700 text-xs">
          💡 Transaksi akan muncul di sini jika pembayaran belum selesai
        </p>
      </div>
    </div>
  </div>
);
