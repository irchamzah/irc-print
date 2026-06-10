"use client";

import { Pagination } from "./Pagination";

// PrintJobsTable - UPDATED dengan struktur baru
export const PrintJobsTable = ({
  jobs,
  refills,
  onViewRefill,
  formatRupiah,
  formatDate,
  formatShortDate,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  section,
  currentJobsPage,
  currentRefillsPage,
  startDate,
  endDate,
  loading,
}) => {
  if (jobs.length === 0 && !loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            🖨️ Riwayat Print Jobs
          </h2>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-500">Tidak ada print job pada periode ini</p>
        </div>
      </div>
    );
  }

  // Helper untuk mendapatkan total biaya (kompatibel dengan struktur lama dan baru)
  const getJobTotalCost = (job) => {
    return job.priceCalculation?.finalPrice || job.totalCost || 0;
  };

  // Helper untuk mendapatkan profit partner (keuntungan dari ownerPrices)
  const getPartnerProfit = (job) => {
    // Prioritas: dari priceCalculation.ownerPrice
    if (job.priceCalculation?.ownerPrice) {
      return job.priceCalculation.ownerPrice;
    }
    // Fallback: dari partnerProfit (struktur lama)
    if (job.partnerProfit) {
      return job.partnerProfit;
    }
    // Fallback terakhir: hitung dari totalCost dan refill (legacy)
    const refill = refills.find((r) => r.refillId === job.refillId);
    if (refill?.profitShare && job.totalCost) {
      return (job.totalCost * refill.profitShare) / 100;
    }
    return 0;
  };

  // Helper untuk mendapatkan nama file
  const getFileName = (job) => {
    return job.fileName || "Unknown File";
  };

  // Helper untuk mendapatkan nomor telepon
  const getPhoneNumber = (job) => {
    return job.customerPhone || job.phoneNumber || "-";
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-lg font-semibold text-gray-800">
            🖨️ Riwayat Print Jobs
          </h2>
          {totalItems > 0 && (
            <p className="text-sm text-gray-500">
              Total {totalItems} print jobs
            </p>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tanggal
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                File
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Halaman
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Profit Partner
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Refill
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {jobs.map((job) => {
              const refill = refills.find((r) => r.refillId === job.refillId);
              const partnerProfit = getPartnerProfit(job);
              const totalCost = getJobTotalCost(job);

              return (
                <tr key={job.jobId} className="hover:bg-gray-50">
                  <td className="px-4 sm:px-6 py-3 text-sm text-gray-600">
                    {formatDate(job.createdAt)}
                  </td>
                  <td className="px-4 sm:px-6 py-3">
                    <div className="text-sm font-medium text-gray-800">
                      {getFileName(job)}
                    </div>
                    <div className="text-xs text-gray-400">
                      {getPhoneNumber(job)}
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-3 text-sm text-gray-600">
                    {job.totalPages || 0} lbr
                  </td>
                  <td className="px-4 sm:px-6 py-3 text-sm font-medium text-gray-800">
                    {formatRupiah(totalCost)}
                  </td>
                  <td className="px-4 sm:px-6 py-3 text-sm font-medium text-green-600">
                    {formatRupiah(partnerProfit)}
                  </td>
                  <td className="px-4 sm:px-6 py-3">
                    {refill && (
                      <button
                        onClick={() => onViewRefill(refill)}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200"
                      >
                        {formatShortDate(refill.createdAt)}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Component */}
      {totalPages > 1 && (
        <div className="border-t border-gray-200">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            section={section}
            currentJobsPage={currentJobsPage}
            currentRefillsPage={currentRefillsPage}
            startDate={startDate}
            endDate={endDate}
            loading={loading}
          />
        </div>
      )}

      {jobs.length === 0 && !loading && (
        <div className="text-center py-12">
          <svg
            className="w-16 h-16 text-gray-300 mx-auto mb-4"
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
          <p className="text-gray-500">Belum ada print job pada periode ini</p>
        </div>
      )}
    </div>
  );
};
