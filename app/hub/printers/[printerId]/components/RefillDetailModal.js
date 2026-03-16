// app/hub/[printerId]/components/RefillDetailModal.js
"use client";

export const RefillDetailModal = ({
  isOpen,
  refill,
  jobs,
  onClose,
  onMarkAsPaid,
  formatRupiah,
  formatDate,
  userRole,
}) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return (
          <span className="text-sm px-3 py-1 rounded-full bg-green-100 text-green-700">
            Aktif
          </span>
        );
      case "completed":
        return (
          <span className="text-sm px-3 py-1 rounded-full bg-blue-100 text-blue-700 ">
            Selesai
          </span>
        );
      case "paid":
        return (
          <span className="text-sm px-3 py-1 rounded-full bg-purple-100 text-purple-700 ">
            Dibayar
          </span>
        );
      default:
        return (
          <span className="text-sm px-3 py-1 rounded-full bg-gray-100 text-gray-700 ">
            {status}
          </span>
        );
    }
  };

  const handleViewProof = (refill) => {
    if (refill.transferProof) {
      const imageUrl = `${process.env.NEXT_PUBLIC_VPS_API_URL}${refill.transferProof.url}`;
      window.open(imageUrl, "_blank");
    }
  };

  if (!isOpen || !refill) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[80vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Detail Pengisian Kertas
            </h3>
            <p className="text-sm text-gray-500">
              {formatDate(refill.createdAt)}
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

        {/* Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[60vh]">
          {/* Info Refill */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500">Kertas Ditambah</p>
              <p className="text-lg font-bold text-gray-800">
                {refill.sheetsAdded}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500">Stok Awal</p>
              <p className="text-lg font-bold text-gray-800">
                {refill.paperCountBefore}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500">Stok Akhir</p>
              <p className="text-lg font-bold text-gray-800">
                {refill.paperCountAfter}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500">Share Profit</p>
              <p className="text-lg font-bold text-green-600">
                {refill.profitShare}%
              </p>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Total Pendapatan:</span>
              <span className="text-lg font-bold text-gray-800">
                {formatRupiah(refill.totalRevenue)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Profit Partner:</span>
              <span className="text-lg font-bold text-green-600">
                {formatRupiah(refill.partnerProfit)}
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-blue-200 flex justify-between items-center">
              <div>
                {getStatusBadge(refill.status)}
                {refill.status === "active" && (
                  <span className="text-xs text-green-600 animate-pulse">
                    ● Menerima profit
                  </span>
                )}
              </div>
              {refill.transferProof ? (
                <button
                  onClick={() => handleViewProof(refill)}
                  className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1"
                  title="Lihat Bukti"
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
                  Lihat
                </button>
              ) : refill.status === "paid" ? (
                <span className="text-xs text-gray-400">Tidak ada</span>
              ) : (
                <span className="text-xs text-gray-400">-</span>
              )}

              {/* Tombol Bayar untuk Admin */}
              {userRole === "super_admin" && refill.status !== "paid" && (
                <button
                  onClick={() => onMarkAsPaid(refill)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                >
                  Tandai Dibayar
                </button>
              )}
            </div>
          </div>

          {/* Related Jobs */}
          <h4 className="font-medium text-gray-800 mb-3">
            Print Jobs Terkait ({jobs?.length || 0})
          </h4>

          <div className="space-y-3">
            {jobs?.map((job) => (
              <div
                key={job.jobId}
                className="border border-gray-200 rounded-lg p-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-800">{job.fileName}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {job.phoneNumber || "No phone"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(job.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-800">
                      {formatRupiah(job.totalCost)}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Profit: {formatRupiah(job.partnerProfit || 0)}
                    </p>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  {job.totalPages} halaman
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
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
