"use client";
import { Suspense, useState } from "react";
import { useHubAuth } from "../auth/hooks/useHubAuth";
import { HubLayout } from "../components/HubLayout";
import { usePartnerWithdrawals } from "./hooks/usePartnerWithdrawals";
import { StatsCards } from "./components/StatsCards";
import { FilterSection } from "./components/FilterSection";
import { WithdrawalsTable } from "./components/WithdrawalsTable";
import CustomLink from "@/app/components/CustomLink";
import LoadingAnimation from "@/app/components/LoadingAnimation";

function PartnerWithdrawalsContent() {
  const { isAuthenticated } = useHubAuth();
  const {
    withdrawals,
    stats,
    loading,
    error,
    filters,
    applyFilters,
    resetFilters,
    refresh,
    formatRupiah,
    formatDate,
    getStatusBadge,
  } = usePartnerWithdrawals();

  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Silakan login terlebih dahulu</p>
          <CustomLink
            href="/hub/auth"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Login
          </CustomLink>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingAnimation />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl border border-red-200 p-6 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Gagal Memuat Data
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              🏦 Riwayat Penarikan
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Riwayat permintaan penarikan dana Anda
            </p>
          </div>
          <CustomLink
            href="/hub/printers"
            className="text-sm text-gray-600 hover:text-gray-900 border border-gray-300 px-3 py-1.5 rounded-lg"
          >
            ← Kembali
          </CustomLink>
        </div>

        <StatsCards
          stats={stats}
          loading={loading}
          formatRupiah={formatRupiah}
        />

        <FilterSection
          filters={filters}
          onApply={applyFilters}
          onReset={resetFilters}
          isLoading={loading}
        />

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              Daftar Penarikan
            </h2>
            {withdrawals.length > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                Total {withdrawals.length} transaksi
              </p>
            )}
          </div>

          <WithdrawalsTable
            withdrawals={withdrawals}
            formatDate={formatDate}
            formatRupiah={formatRupiah}
            getStatusBadge={getStatusBadge}
          />
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      <span className="ml-2 text-gray-500">Memuat...</span>
    </div>
  );
}

export default function PartnerWithdrawalsPage() {
  return (
    <HubLayout>
      <Suspense fallback={<LoadingFallback />}>
        <PartnerWithdrawalsContent />
      </Suspense>
    </HubLayout>
  );
}
