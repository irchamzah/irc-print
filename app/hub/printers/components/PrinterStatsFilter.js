"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useHubAuth } from "../../auth/hooks/useHubAuth";
import CustomLink from "@/app/components/CustomLink";

export const PrinterStatsFilter = ({
  profitStats,
  filters,
  onFilterChange,
  onRefresh,
  onWithdraw,
}) => {
  const router = useRouter();
  const [localSearch, setLocalSearch] = useState(filters.search || "");
  const { isSuperAdmin } = useHubAuth();

  const isAdmin = isSuperAdmin();

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onFilterChange({ ...filters, search: localSearch });
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Profit Partner Tertunda */}
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-orange-600 mb-1">
                Profit Partner Tertunda
              </p>
              <p className="text-2xl font-bold text-orange-700">
                {formatRupiah(profitStats.totalPendingPayout)}
              </p>
              <p className="text-xs text-orange-500 mt-1">Belum dicairkan</p>
            </div>
            <div className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Profit Partner (Sudah Dicairkan) */}
        <CustomLink href="/hub/partner-withdrawals">
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-600 mb-1">
                  Total Profit Partner
                </p>
                <p className="text-2xl font-bold text-green-700">
                  {formatRupiah(profitStats.totalPaidProfit)}
                </p>
                <p className="text-xs text-green-500 mt-1">Sudah dicairkan</p>
              </div>
              <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-green-600"
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
              </div>
            </div>
          </div>
        </CustomLink>

        {/* Total Platform Profit */}
        {isAdmin && (
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-600 mb-1">
                  Total Platform Profit
                </p>
                <p className="text-2xl font-bold text-blue-700">
                  {formatRupiah(profitStats.totalPlatformProfit)}
                </p>
                <p className="text-xs text-blue-500 mt-1">
                  {profitStats.printerCount} Printer
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter Bar & Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Cari printer..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
              />
              <svg
                className="w-4 h-4 text-gray-400 absolute left-3 top-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </form>

          {/* Status Filter */}
          <select
            value={filters.status || ""}
            onChange={(e) =>
              onFilterChange({ ...filters, status: e.target.value })
            }
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm cursor-pointer"
          >
            <option value="">Semua Status</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="maintenance">Maintenance</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
          {!isAdmin && (
            <>
              {/* Withdrawal Button */}
              <button
                onClick={onWithdraw}
                disabled={profitStats.totalPendingPayout <= 0}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  profitStats.totalPendingPayout > 0
                    ? "bg-green-600 text-white hover:bg-green-700 cursor-pointer"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
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
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm0 0v-4"
                  />
                </svg>
                Buat Permintaan Penarikan
              </button>

              {/* ✅ Tombol Lihat Riwayat Penarikan */}
              <CustomLink
                href="/hub/partner-withdrawals"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
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
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                Lihat Riwayat Penarikan
              </CustomLink>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
