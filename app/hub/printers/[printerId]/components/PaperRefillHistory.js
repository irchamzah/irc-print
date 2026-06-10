"use client";

import { Pagination } from "./Pagination";
import { useHubAuth } from "../../../auth/hooks/useHubAuth";

// PaperRefillHistory - UPDATED dengan struktur baru (tanpa upload proof)
export const PaperRefillHistory = ({
  refills,
  onViewRefill,
  formatRupiah,
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
  const { role } = useHubAuth();
  const isAdmin = role === "admin" || role === "super_admin";

  // Fungsi untuk mendapatkan badge role
  const getRoleBadge = (role) => {
    if (role === "super_admin") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Admin
        </span>
      );
    }
    if (role === "admin") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          Admin
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
        <svg
          className="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        Partner
      </span>
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return (
          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
            Aktif
          </span>
        );
      case "completed":
        return (
          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
            Selesai
          </span>
        );
      case "paid":
        return (
          <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
            Dibayar
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
            {status}
          </span>
        );
    }
  };

  const filterRefillsByDateRange = (refills) => {
    if (!startDate || !endDate) return refills;

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    return refills.filter((refill) => {
      const refillDate = new Date(refill.createdAt);
      return refillDate >= start && refillDate <= end;
    });
  };

  const visibleRefills = filterRefillsByDateRange(refills);

  if (visibleRefills.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            📦 Riwayat Pengisian Kertas
          </h2>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-500">
            Tidak ada pengisian kertas pada periode ini
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">
          📦 Riwayat Pengisian Kertas
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Klik untuk melihat detail print jobs per pengisian
        </p>
      </div>

      <div className="divide-y divide-gray-200">
        {visibleRefills.map((refill) => (
          <div
            key={refill.paperRefillId || refill.refillId}
            onClick={() => onViewRefill(refill)}
            className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            {/* Desktop Layout (sm:flex) */}
            <div className="hidden sm:flex sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    refill.status === "paid" ? "bg-green-100" : "bg-blue-100"
                  }`}
                >
                  <svg
                    className={`w-5 h-5 ${
                      refill.status === "paid"
                        ? "text-green-600"
                        : "text-blue-600"
                    }`}
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
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-gray-800">
                      {formatShortDate(refill.createdAt)}
                    </p>
                    {getRoleBadge(refill.filledByRole)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {refill.filledByName} • {refill.sheetsAdded} lembar •{" "}
                    {refill.printJobIds?.length || 0} print jobs
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 flex-shrink-0">
                <div className="text-right">
                  <p className="text-xs text-gray-500">Pendapatan</p>
                  <p className="text-sm font-medium text-gray-800">
                    {formatRupiah(refill.totalRevenue)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Profit Partner</p>
                  <p className="text-sm font-medium text-green-600">
                    {formatRupiah(refill.partnerProfit)}
                  </p>
                </div>
                {isAdmin && (
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Profit Platform</p>
                    <p className="text-sm font-medium text-blue-600">
                      {formatRupiah(refill.platformProfit)}
                    </p>
                  </div>
                )}
                <div className="w-20">
                  {getStatusBadge(refill.status)}
                  <br />
                  {refill.status === "active" && (
                    <span className="text-xs text-green-600 animate-pulse">
                      ● Menerima profit
                    </span>
                  )}
                </div>
                {/* ✅ HAPUS bagian transferProof - bukti transfer ditangani di withdrawal */}
              </div>
            </div>

            {/* Mobile Layout (sm:hidden) */}
            <div className="sm:hidden">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      refill.status === "paid" ? "bg-green-100" : "bg-blue-100"
                    }`}
                  >
                    <svg
                      className={`w-4 h-4 ${
                        refill.status === "paid"
                          ? "text-green-600"
                          : "text-blue-600"
                      }`}
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
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">
                      {formatShortDate(refill.createdAt)}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {getRoleBadge(refill.filledByRole)}
                    </div>
                  </div>
                </div>
                {getStatusBadge(refill.status)}
              </div>

              <div className="ml-10 space-y-2">
                <p className="text-xs text-gray-600">
                  {refill.filledByName} • {refill.sheetsAdded} lembar
                </p>

                <div className={`grid ${isAdmin ? "grid-cols-3" : "grid-cols-2"} gap-2 text-center text-xs`}>
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <p className="text-gray-500">Jobs</p>
                    <p className="font-medium text-gray-800">
                      {refill.printJobIds?.length || 0}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <p className="text-gray-500">Profit Partner</p>
                    <p className="font-medium text-green-600">
                      {formatRupiah(refill.partnerProfit)
                        .replace("Rp", "")
                        .trim()}
                    </p>
                  </div>
                  {isAdmin && (
                    <div className="bg-gray-50 p-2 rounded-lg">
                      <p className="text-gray-500">Profit Platform</p>
                      <p className="font-medium text-blue-600">
                        {formatRupiah(refill.platformProfit)
                          .replace("Rp", "")
                          .trim()}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center text-xs pt-1 border-t border-gray-100">
                  <span className="text-gray-500">Pendapatan</span>
                  <span className="font-medium text-gray-800">
                    {formatRupiah(refill.totalRevenue)}
                  </span>
                </div>

                {refill.status === "active" && (
                  <span className="text-xs text-green-600 animate-pulse block text-center">
                    ● Menerima profit
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

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
      </div>
    </div>
  );
};
