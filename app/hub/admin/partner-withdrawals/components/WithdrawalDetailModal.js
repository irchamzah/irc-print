"use client";
const NEXT_PUBLIC_VPS_API_URL = process.env.NEXT_PUBLIC_VPS_API_URL;

export const WithdrawalDetailModal = ({
  isOpen,
  onClose,
  withdrawal,
  formatDate,
  formatRupiah,
}) => {
  if (!isOpen || !withdrawal) return null;

  const getStatusBadge = (status) => {
    const statusMap = {
      requested: {
        label: "Diminta",
        className: "bg-yellow-100 text-yellow-700",
      },
      processed: { label: "Diproses", className: "bg-blue-100 text-blue-700" },
      transferred: {
        label: "Ditransfer",
        className: "bg-green-100 text-green-700",
      },
    };
    const s = statusMap[status] || {
      label: status,
      className: "bg-gray-100 text-gray-700",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${s.className}`}>
        {s.label}
      </span>
    );
  };

  const getTransferProofUrl = (transferProof) => {
    if (!transferProof) return null;
    // Jika sudah full URL, langsung return
    if (transferProof.url?.startsWith("http")) {
      return transferProof.url;
    }
    // Tambahkan base URL VPS
    return `${NEXT_PUBLIC_VPS_API_URL}${transferProof.url}`;
  };

  const transferProofUrl = getTransferProofUrl(withdrawal.transferProof);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Detail Penarikan
            </h3>
            <p className="text-sm text-gray-500 font-mono">
              {withdrawal.partnerWithdrawalId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-6 h-6"
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
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto max-h-[60vh] space-y-4">
          {/* Informasi Penarikan */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2">
              Informasi Penarikan
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-gray-500">Tanggal Diminta:</span>
              <span className="font-medium">
                {formatDate(withdrawal.requestedAt)}
              </span>
              <span className="text-gray-500">Status:</span>
              <div>{getStatusBadge(withdrawal.status)}</div>
              <span className="text-gray-500">Jumlah Refill:</span>
              <span className="font-medium">
                {withdrawal.paperRefillIds?.length || 0} refill
              </span>
              <span className="text-gray-500">Total Amount:</span>
              <span className="font-medium text-green-600">
                {formatRupiah(withdrawal.totalAmount)}
              </span>
              {withdrawal.processedAt && (
                <>
                  <span className="text-gray-500">Diproses Pada:</span>
                  <span className="font-medium">
                    {formatDate(withdrawal.processedAt)}
                  </span>
                </>
              )}
              {withdrawal.transferredAt && (
                <>
                  <span className="text-gray-500">Ditransfer Pada:</span>
                  <span className="font-medium">
                    {formatDate(withdrawal.transferredAt)}
                  </span>
                </>
              )}
              {withdrawal.processedBy && (
                <>
                  <span className="text-gray-500">Diproses Oleh:</span>
                  <span className="font-medium">{withdrawal.processedBy}</span>
                </>
              )}
            </div>
          </div>

          {/* Informasi Bank */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2">Informasi Bank</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-gray-500">Bank:</span>
              <span className="font-medium">
                {withdrawal.bankAccount?.bankName || "-"}
              </span>
              <span className="text-gray-500">No. Rekening:</span>
              <span className="font-medium">
                {withdrawal.bankAccount?.accountNumber || "-"}
              </span>
              <span className="text-gray-500">Atas Nama:</span>
              <span className="font-medium">
                {withdrawal.bankAccount?.accountName || "-"}
              </span>
            </div>
          </div>

          {/* Catatan */}
          {withdrawal.notes && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-2">Catatan</h4>
              <p className="text-sm text-gray-600">{withdrawal.notes}</p>
            </div>
          )}

          {/* ✅ Bukti Transfer dengan URL VPS */}
          {transferProofUrl && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-2">Bukti Transfer</h4>
              <button
                onClick={() => window.open(transferProofUrl, "_blank")}
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                Lihat Bukti Transfer
              </button>
              <div className="mt-2">
                <img
                  src={transferProofUrl}
                  alt="Bukti Transfer"
                  className="max-h-48 rounded-lg border border-gray-200 cursor-pointer"
                  onClick={() => window.open(transferProofUrl, "_blank")}
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
