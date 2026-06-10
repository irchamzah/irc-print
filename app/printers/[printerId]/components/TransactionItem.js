// app/printers/%5BprinterId%5D/components/TransactionItem.js
export const TransactionItem = ({
  transaction,
  onContinue,
  onCancel,
  onDelete,
  isLoading,
  cooldownTimers,
  isPrinterOffline = false,
  isPaperInsufficient = false,
  paperMode = "limited", // ✅ Tambah: "limited" atau "unlimited"
}) => {
  // ✅ Gunakan transactionStatus (bukan status) untuk menentukan badge
  const getStatusBadge = (transactionStatus) => {
    switch (transactionStatus) {
      case "printed":
        return { class: "bg-gray-100 text-gray-600", text: "✅ Selesai" };
      case "paid":
        return {
          class: "bg-blue-100 text-blue-700",
          text: "💳 Menunggu Print",
        };
      case "settlement":
        return { class: "bg-green-100 text-green-700", text: "✅ Lunas" };
      case "expired":
        return { class: "bg-red-100 text-red-700", text: "❌ Kadaluarsa" };
      case "failed":
        return { class: "bg-red-100 text-red-800", text: "❌ Gagal" };
      case "pending":
        return {
          class: "bg-yellow-100 text-yellow-700",
          text: "⏳ Menunggu Bayar",
        };
      default:
        return {
          class: "bg-gray-100 text-gray-700",
          text: transactionStatus || "Unknown",
        };
    }
  };

  // ✅ Gunakan transactionStatus, fallback ke status jika tidak ada
  const currentStatus =
    transaction.transactionStatus || transaction.status || "pending";
  const statusBadge = getStatusBadge(currentStatus);

  // ✅ Hitung jumlah halaman dari settings atau fileData
  const totalPages =
    transaction.settings?.totalPages ||
    transaction.settings?.selectedPages?.length ||
    transaction.fileData?.pages ||
    transaction.totalPages ||
    0;

  // ✅ Ambil nama file dari berbagai kemungkinan field
  const fileName =
    transaction.fileName || transaction.fileData?.name || "Unknown File";

  // ✅ Ambil jumlah biaya dari amount atau cost
  const amount = transaction.amount || transaction.cost || 0;

  // ✅ Logika untuk Unlimited Mode: Abaikan pengecekan kertas
  const isUnlimitedMode = paperMode === "unlimited";
  const showPaperWarning = !isUnlimitedMode && isPaperInsufficient;
  const isButtonDisabled =
    isLoading || isPrinterOffline || (!isUnlimitedMode && isPaperInsufficient);

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
              📄 {totalPages} halaman
            </span>
          </div>

          {/* File Info */}
          <div className="space-y-2">
            <p className="text-sm sm:text-base font-semibold text-gray-800 truncate">
              {fileName}
            </p>
            <p className="text-lg sm:text-xl font-bold text-purple-600">
              Rp {transaction.settings.cost.toLocaleString("id-ID")}
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
          {currentStatus === "printed" ? (
            <div className="text-center text-gray-500 text-sm py-2">
              ✅ Selesai
            </div>
          ) : currentStatus === "failed" ? (
            <DeleteButton
              onDelete={onDelete}
              transaction={transaction}
              isLoading={isLoading}
            />
          ) : currentStatus === "settlement" ? (
            <SettlementButton
              transaction={transaction}
              onContinue={onContinue}
              isLoading={isLoading}
              cooldownTimers={cooldownTimers}
              isPrinterOffline={isPrinterOffline}
              isPaperInsufficient={showPaperWarning}
              isUnlimitedMode={isUnlimitedMode}
            />
          ) : currentStatus === "pending" || currentStatus === "paid" ? (
            <PendingButtons
              transaction={transaction}
              onContinue={onContinue}
              onCancel={onCancel}
              isLoading={isLoading}
              cooldownTimers={cooldownTimers}
              isPrinterOffline={isPrinterOffline}
              isPaperInsufficient={showPaperWarning}
              isUnlimitedMode={isUnlimitedMode}
              currentStatus={currentStatus}
            />
          ) : (
            <CancelButton
              onCancel={onCancel}
              transaction={transaction}
              currentStatus={currentStatus}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// SettlementButton - UPDATED dengan paperMode
const SettlementButton = ({
  transaction,
  onContinue,
  isLoading,
  cooldownTimers,
  isPrinterOffline,
  isPaperInsufficient,
  isUnlimitedMode = false,
}) => {
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

  const orderId = transaction.orderId;

  // ✅ Untuk unlimited mode, abaikan pengecekan kertas
  const isDisabled =
    isLoading ||
    cooldownTimers[orderId] ||
    isPrinterOffline ||
    (!isUnlimitedMode && isPaperInsufficient);

  const getButtonText = () => {
    if (isPrinterOffline) return "Tidak Dapat Print";
    if (!isUnlimitedMode && isPaperInsufficient) return "Kertas Tidak Cukup";
    return "Print Sekarang";
  };

  return (
    <button
      onClick={handlePrintWithWarning}
      disabled={isDisabled}
      className={`w-full sm:w-auto px-4 py-2.5 text-white text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
        isPrinterOffline || (!isUnlimitedMode && isPaperInsufficient)
          ? "bg-gray-400 cursor-not-allowed opacity-75"
          : "bg-green-600 hover:bg-green-700 disabled:bg-green-300 shadow-sm hover:shadow-md"
      }`}
    >
      {cooldownTimers[orderId] ? (
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
          <span className="whitespace-nowrap">{getButtonText()}</span>
        </>
      )}
    </button>
  );
};

// PendingButtons - UPDATED dengan paperMode
const PendingButtons = ({
  transaction,
  onContinue,
  onCancel,
  isLoading,
  cooldownTimers,
  isPrinterOffline,
  isPaperInsufficient,
  isUnlimitedMode = false,
  currentStatus,
}) => {
  const handleContinueWithWarning = () => {
    // ✅ Sesuaikan pesan peringatan berdasarkan status
    let confirmationMessage = "";

    if (currentStatus === "paid") {
      confirmationMessage =
        "🚨 PERINGATAN!!!\n\n" +
        "PRINTER AKAN MULAI MENCETAK SEKARANG!\n" +
        "HARAP KERTAS SEGERA DIAMBIL!\n\n" +
        "Apakah Anda yakin ingin melanjutkan print?";
    } else {
      confirmationMessage =
        "🚨 PERINGATAN!!!\n\n" +
        "SETELAH MEMBAYAR, PRINTER AKAN MULAI MENCETAK!\n" +
        "HARAP KERTAS SEGERA DIAMBIL!\n\n" +
        "Apakah Anda yakin ingin melanjutkan pembayaran?";
    }

    if (window.confirm(confirmationMessage)) {
      onContinue(transaction);
    }
  };

  const orderId = transaction.orderId;

  // ✅ Untuk unlimited mode, abaikan pengecekan kertas
  const isDisabled =
    isLoading ||
    cooldownTimers[orderId] ||
    isPrinterOffline ||
    (!isUnlimitedMode && isPaperInsufficient);

  // ✅ Tentukan teks tombol berdasarkan status
  const getButtonText = () => {
    if (isPrinterOffline) return "Printer Sedang Offline";
    if (!isUnlimitedMode && isPaperInsufficient) return "Kertas Tidak Cukup";

    // ✅ Jika status paid, tampilkan "Mulai Print"
    if (currentStatus === "paid") return "🖨️ Mulai Print";

    // Default untuk status pending
    return "💳 Lanjutkan Bayar";
  };

  // ✅ Tentukan warna tombol berdasarkan status
  const getButtonClass = () => {
    if (isPrinterOffline || (!isUnlimitedMode && isPaperInsufficient)) {
      return "bg-gray-400 cursor-not-allowed opacity-75";
    }
    // Jika status paid, gunakan warna hijau
    if (currentStatus === "paid") {
      return "bg-green-600 hover:bg-green-700 disabled:bg-green-300 shadow-sm hover:shadow-md cursor-pointer";
    }
    // Default untuk pending
    return "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 shadow-sm hover:shadow-md cursor-pointer";
  };

  return (
    <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
      {/* Continue Button */}
      <button
        onClick={handleContinueWithWarning}
        disabled={isDisabled}
        type="button"
        className={`w-full sm:flex-1 px-4 py-2.5 text-white text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${getButtonClass()}`}
      >
        {cooldownTimers[orderId] ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Loading...</span>
          </>
        ) : (
          <>
            {currentStatus === "paid" ? (
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
            ) : (
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
            )}
            <span className="whitespace-nowrap">{getButtonText()}</span>
          </>
        )}
      </button>

      {/* Cancel Button */}
      <CancelButton
        onCancel={onCancel}
        transaction={transaction}
        currentStatus={currentStatus}
        isLoading={isLoading}
      />
    </div>
  );
};

// DeleteButton — untuk status "failed"
const DeleteButton = ({ onDelete, transaction, isLoading }) => (
  <button
    onClick={() => onDelete && onDelete(transaction)}
    disabled={isLoading}
    type="button"
    className="w-full sm:flex-1 px-4 py-2.5 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-red-600 hover:bg-red-700"
  >
    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
    <span className="whitespace-nowrap">Hapus</span>
  </button>
);

// CancelButton (tidak berubah)
const CancelButton = ({ onCancel, transaction, currentStatus, isLoading }) => {
  // ✅ Tentukan teks tombol cancel berdasarkan status
  const getCancelText = () => {
    if (currentStatus === "paid") return "Batalkan (Dana Hangus)";
    return "Batalkan";
  };

  // ✅ Tentukan warna tombol cancel berdasarkan status
  const getCancelClass = () => {
    if (currentStatus === "paid") {
      return "bg-red-700 hover:bg-red-800";
    }
    return "bg-red-600 hover:bg-red-700";
  };

  return (
    <button
      onClick={() => onCancel(transaction)}
      disabled={isLoading}
      type="button"
      className={`w-full sm:flex-1 px-4 py-2.5 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${getCancelClass()}`}
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
      <span className="whitespace-nowrap">{getCancelText()}</span>
    </button>
  );
};
