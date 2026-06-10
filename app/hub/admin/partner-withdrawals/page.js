"use client";
import { Suspense, useRef, useEffect, useState } from "react";
import { useHubAuth } from "../../auth/hooks/useHubAuth";
import { AdminLayout } from "../components/AdminLayout";
import { useAdminPartnerWithdrawals } from "./hooks/useAdminPartnerWithdrawals";
import { StatsCards } from "./components/StatsCards";
import { FilterSection } from "./components/FilterSection";
import { WithdrawalsTable } from "./components/WithdrawalsTable";
import { Pagination } from "../paper-refills/components/Pagination";

const tabs = [
  { id: "users", label: "👥 Users", href: "/hub/admin/users" },
  { id: "printers", label: "🖨️ Printers", href: "/hub/admin/printers" },
  {
    id: "refills",
    label: "💰 Paper Refills",
    href: "/hub/admin/paper-refills",
  },
  {
    id: "printer-models",
    label: "📦 Printer Models",
    href: "/hub/admin/printer-models",
  },
  {
    id: "platform-settings",
    label: "⚙️ Platform Settings",
    href: "/hub/admin/platform-settings",
  },
  {
    id: "withdrawals",
    label: "🏦 Withdrawals",
    href: "/hub/admin/partner-withdrawals",
  },
  {
    id: "raspberry-devices",
    label: "💻 Raspberry Devices",
    href: "/hub/admin/raspberry-devices",
  },
];

function PartnerWithdrawalsContent() {
  const { isSuperAdmin } = useHubAuth();
  const {
    withdrawals,
    stats,
    loading,
    pagination,
    filters,
    applyFilters,
    resetFilters,
    changePage,
    changeLimit,
    processWithdrawal,
  } = useAdminPartnerWithdrawals();

  const [processingId, setProcessingId] = useState(null);
  const scrollContainerRef = useRef(null);

  const saveScrollPosition = () => {
    if (scrollContainerRef.current) {
      sessionStorage.setItem(
        "withdrawalsScrollPos",
        scrollContainerRef.current.scrollTop,
      );
    }
  };

  useEffect(() => {
    const savedPosition = sessionStorage.getItem("withdrawalsScrollPos");
    if (savedPosition && scrollContainerRef.current && !loading) {
      scrollContainerRef.current.scrollTop = parseInt(savedPosition);
      sessionStorage.removeItem("withdrawalsScrollPos");
    }
  }, [loading]);

  const handleProcessWithdrawal = async (
    withdrawalId,
    status,
    transferProof = null,
  ) => {
    setProcessingId(withdrawalId);
    const result = await processWithdrawal(withdrawalId, status, transferProof);
    setProcessingId(null);
    return result;
  };

  if (!isSuperAdmin()) return null;

  return (
    <div
      ref={scrollContainerRef}
      className="overflow-y-auto"
      style={{ maxHeight: "calc(100vh - 200px)" }}
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          🏦 Manajemen Penarikan Partner
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Kelola semua permintaan penarikan dana dari partner
        </p>
      </div>

      <StatsCards stats={stats} loading={loading} />
      <FilterSection
        filters={filters}
        onApply={applyFilters}
        onReset={resetFilters}
        isLoading={loading}
      />

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Memuat data...</p>
          </div>
        ) : (
          <>
            <WithdrawalsTable
              withdrawals={withdrawals}
              onProcess={handleProcessWithdrawal}
              processingId={processingId}
              formatDate={(date) => new Date(date).toLocaleDateString("id-ID")}
              formatRupiah={(amount) =>
                new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  minimumFractionDigits: 0,
                }).format(amount || 0)
              }
            />
            {pagination.totalPages > 0 && (
              <Pagination
                pagination={pagination}
                onPageChange={changePage}
                onLimitChange={changeLimit}
              />
            )}
          </>
        )}
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

export default function AdminPartnerWithdrawalsPage() {
  return (
    <AdminLayout tabs={tabs} activeTab="withdrawals">
      <Suspense fallback={<LoadingFallback />}>
        <PartnerWithdrawalsContent />
      </Suspense>
    </AdminLayout>
  );
}
