// app/printers/[printerId]/components/PendingTransactionsSection.js
import { TransactionItem } from "./TransactionItem";

// PendingTransactionsSection - UPDATED dengan paperMode
export const PendingTransactionsSection = ({
  userSession,
  pendingTransactions,
  loadingTransactions,
  refreshingTransactions,
  cooldownTimers,
  onRefresh,
  onContinue,
  onCancel,
  onDelete,
  isLoading,
  isPrinterOffline = false,
  isPaperInsufficient = false,
  paperMode = "limited", // ✅ Tambah: "limited" atau "unlimited"
}) => {
  // Hanya tampilkan jika user login dan ada transaksi atau sedang loading
  if (
    !userSession ||
    (pendingTransactions.length === 0 && !loadingTransactions)
  ) {
    return null;
  }

  // ✅ Logika untuk Unlimited Mode: Abaikan pengecekan kertas
  const isUnlimitedMode = paperMode === "unlimited";
  const showPaperWarning = !isUnlimitedMode && isPaperInsufficient;

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

      {/* Warning Printer Offline */}
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

      {/* ✅ Warning Kertas Tidak Cukup (hanya untuk limited mode) */}
      {showPaperWarning && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-orange-500 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <div>
              <p className="text-orange-800 text-sm font-medium">
                Kertas tidak cukup
              </p>
              <p className="text-orange-600 text-xs">
                Isi ulang kertas terlebih dahulu sebelum melanjutkan transaksi
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Info untuk Unlimited Mode */}
      {/* {isUnlimitedMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-blue-500 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <div>
              <p className="text-blue-800 text-sm font-medium">
                ♾️ Mode Unlimited
              </p>
              <p className="text-blue-600 text-xs">
                Printer ini tidak memerlukan isi ulang kertas. Stok selalu
                tersedia.
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
              onDelete={onDelete}
              isLoading={isLoading}
              cooldownTimers={cooldownTimers}
              isPrinterOffline={isPrinterOffline}
              isPaperInsufficient={showPaperWarning} // ✅ Sesuaikan dengan mode
              paperMode={paperMode} // ✅ Kirim paperMode ke TransactionItem
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

// EmptyTransactionsState (tidak berubah)
const EmptyTransactionsState = () => {
  return (
    <div className="text-center py-8">
      <div className="flex flex-col items-center justify-center">
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

        <h4 className="text-lg font-semibold text-gray-700 mb-2">
          Tidak ada transaksi tertunda
        </h4>
        <p className="text-gray-500 text-sm max-w-xs mx-auto">
          Semua transaksi Anda sudah selesai atau belum ada transaksi yang
          dibuat
        </p>

        <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-100">
          <p className="text-purple-700 text-xs">
            💡 Transaksi akan muncul di sini jika pembayaran belum selesai
          </p>
        </div>
      </div>
    </div>
  );
};
