export const TransactionItem = ({
  transaction,
  onContinue,
  onCancel,
  isLoading,
  cooldownTimers,
  isPrinterOffline = false,
  isPaperInsufficient = false, // ✅ TAMBAH INI
}) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case "settlement":
        return { class: "bg-green-100 text-green-700", text: "✅ Lunas" };
      case "expired":
        return { class: "bg-red-100 text-red-700", text: "❌ Kadaluarsa" };
      default:
        return {
          class: "bg-yellow-100 text-yellow-700",
          text: "⏳ Menunggu Bayar",
        };
    }
  };

  const statusBadge = getStatusBadge(transaction.status);

  return (
    <div className="bg-white rounded-lg border border-purple-100 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        {/* Transaction Info - Left Side */}
        <div className="flex-1 min-w-0">
          {/* Header dengan badges */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="font-mono text-xs bg-purple-100 text-purple-700 px-2 py-1.5 rounded-md border border-purple-200">
              {transaction.orderId}
            </span>
            <span
              className={`text-xs px-2.5 py-1.5 rounded-md border ${statusBadge.class}`}
            >
              {statusBadge.text}
            </span>
            <span className="text-xs text-purple-600 bg-purple-50 px-2.5 py-1.5 rounded-md border border-purple-200">
              📄 {transaction.fileData?.pages || 0} halaman
            </span>
          </div>

          {/* File Info */}
          <div className="space-y-2">
            <p className="text-sm sm:text-base font-semibold text-gray-800 truncate">
              {transaction.fileData?.name || "Unknown File"}
            </p>
            <p className="text-lg sm:text-xl font-bold text-purple-600">
              Rp {transaction.cost?.toLocaleString("id-ID")}
            </p>
          </div>

          {/* Timestamps */}
          <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-gray-500">
            <span>
              Dibuat:{" "}
              {new Date(transaction.createdAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
            {transaction.paidAt && <span className="hidden sm:inline">•</span>}
            {transaction.paidAt && (
              <span>
                Lunas:{" "}
                {new Date(transaction.paidAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons - Right Side */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-2 min-w-[140px]">
          {transaction.status === "settlement" ? (
            <SettlementButton
              transaction={transaction}
              onContinue={onContinue}
              isLoading={isLoading}
              cooldownTimers={cooldownTimers}
              isPrinterOffline={isPrinterOffline}
              isPaperInsufficient={isPaperInsufficient} // ✅ TAMBAH INI
            />
          ) : transaction.status === "pending" ? (
            <PendingButtons
              transaction={transaction}
              onContinue={onContinue}
              onCancel={onCancel}
              isLoading={isLoading}
              cooldownTimers={cooldownTimers}
              isPrinterOffline={isPrinterOffline}
              isPaperInsufficient={isPaperInsufficient} // ✅ TAMBAH INI
            />
          ) : (
            <CancelButton onCancel={onCancel} transaction={transaction} />
          )}
        </div>
      </div>
    </div>
  );
};

const SettlementButton = ({
  transaction,
  onContinue,
  isLoading,
  cooldownTimers,
  isPrinterOffline,
  isPaperInsufficient,
}) => {
  // ✅ FUNCTION BARU: Handle print dengan warning
  const handlePrintWithWarning = () => {
    const confirmationMessage =
      "🚨 PERINGATAN!!!\n\n" +
      "PRINTER AKAN MULAI MENCETAK SEKARANG!\n" +
      "HARAP KERTAS SEGERA DIAMBIL!\n\n" +
      "Apakah Anda yakin ingin melanjutkan print?";

    if (window.confirm(confirmationMessage)) {
      onContinue(transaction);
    }
  };

  return (
    <button
      onClick={handlePrintWithWarning} // ✅ GUNAKAN FUNCTION BARU
      disabled={
        isLoading ||
        cooldownTimers[transaction.orderId] ||
        isPrinterOffline ||
        isPaperInsufficient
      }
      className={`w-full sm:w-auto px-4 py-2.5 text-white text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
        isPrinterOffline || isPaperInsufficient
          ? "bg-gray-400 cursor-not-allowed opacity-75"
          : "bg-green-600 hover:bg-green-700 disabled:bg-green-300 shadow-sm hover:shadow-md"
      }`}
    >
      {cooldownTimers[transaction.orderId] ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>Loading...</span>
        </>
      ) : (
        <>
          <svg
            className="w-4 h-4 flex-shrink-0"
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
          <span className="whitespace-nowrap">
            {isPrinterOffline || isPaperInsufficient
              ? "Tidak Dapat Print"
              : "Print Sekarang"}
          </span>
        </>
      )}
    </button>
  );
};

const PendingButtons = ({
  transaction,
  onContinue,
  onCancel,
  isLoading,
  cooldownTimers,
  isPrinterOffline,
  isPaperInsufficient,
}) => {
  // ✅ FUNCTION BARU: Handle continue dengan warning
  const handleContinueWithWarning = () => {
    const confirmationMessage =
      "🚨 PERINGATAN!!!\n\n" +
      "SETELAH MEMBAYAR, PRINTER AKAN MULAI MENCETAK!\n" +
      "HARAP KERTAS SEGERA DIAMBIL!\n\n" +
      "Apakah Anda yakin ingin melanjutkan pembayaran?";

    if (window.confirm(confirmationMessage)) {
      onContinue(transaction);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
      {/* Continue Button */}
      <button
        onClick={handleContinueWithWarning} // ✅ GUNAKAN FUNCTION BARU
        disabled={
          isLoading ||
          cooldownTimers[transaction.orderId] ||
          isPrinterOffline ||
          isPaperInsufficient
        }
        type="button"
        className={`w-full sm:flex-1 px-4 py-2.5 text-white text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
          isPrinterOffline || isPaperInsufficient
            ? "bg-gray-400 cursor-not-allowed opacity-75"
            : "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 shadow-sm hover:shadow-md cursor-pointer"
        }`}
      >
        {cooldownTimers[transaction.orderId] ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Loading...</span>
          </>
        ) : (
          <>
            <svg
              className="w-4 h-4 flex-shrink-0"
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
            <span className="whitespace-nowrap">
              {isPrinterOffline
                ? "Printer Sedang Offline"
                : isPaperInsufficient
                ? "Kertas Tidak Cukup"
                : "Lanjutkan Bayar"}
            </span>
          </>
        )}
      </button>

      {/* Cancel Button */}
      <button
        onClick={() => onCancel(transaction)}
        disabled={isLoading}
        type="button"
        className="w-full sm:flex-1 px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:bg-red-300 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2 cursor-pointer"
      >
        <svg
          className="w-4 h-4 flex-shrink-0"
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
        <span className="whitespace-nowrap">Batalkan</span>
      </button>
    </div>
  );
};

// CancelButton tetap sama
const CancelButton = ({ onCancel, transaction }) => (
  <button
    onClick={() => onCancel(transaction)}
    className="w-full px-4 py-2.5 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
  >
    <svg
      className="w-4 h-4 flex-shrink-0"
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
    <span className="whitespace-nowrap">Hapus</span>
  </button>
);
