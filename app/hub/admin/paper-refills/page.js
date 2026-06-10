"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import { useHubAuth } from "../../auth/hooks/useHubAuth";
import { AdminLayout } from "../components/AdminLayout";
import { useAdminPaperRefills } from "../hooks/useAdminPaperRefills";
import { StatsCards } from "./components/StatsCards";
import { StatusStatsCards } from "./components/StatusStatsCards";
import { FilterSection } from "./components/FilterSection";
import { SortSection } from "./components/SortSection";
import { RefillsTable } from "./components/RefillsTable";
import { Pagination } from "./components/Pagination";

// Komponen yang menggunakan useSearchParams (dipisah)
function PaperRefillsContent() {
  const { isSuperAdmin } = useHubAuth();
  const {
    refills,
    stats,
    filterOptions,
    loading,
    pagination,
    filters,
    applyFilters,
    resetFilters,
    changePage,
    changeLimit,
    changeSort,
    markAsPaid,
    formatDate,
    formatRupiah,
    refresh,
  } = useAdminPaperRefills();

  const [processingId, setProcessingId] = useState(null);
  const scrollContainerRef = useRef(null);

  const saveScrollPosition = () => {
    if (scrollContainerRef.current) {
      const position = scrollContainerRef.current.scrollTop;
      sessionStorage.setItem("paperRefillsScrollPos", position);
    }
  };

  useEffect(() => {
    const savedPosition = sessionStorage.getItem("paperRefillsScrollPos");
    if (savedPosition && scrollContainerRef.current && !loading) {
      scrollContainerRef.current.scrollTop = parseInt(savedPosition);
      sessionStorage.removeItem("paperRefillsScrollPos");
    }
  }, [loading]);

  const handleChangePage = (newPage) => {
    saveScrollPosition();
    changePage(newPage);
  };

  const handleChangeLimit = (newLimit) => {
    saveScrollPosition();
    changeLimit(newLimit);
  };

  const handleApplyFilters = async (newFilters) => {
    saveScrollPosition();
    await applyFilters(newFilters);
  };

  const handleResetFilters = async () => {
    saveScrollPosition();
    await resetFilters();
  };

  const handleChangeSort = (sortBy, sortOrder) => {
    saveScrollPosition();
    changeSort(sortBy, sortOrder);
  };

  // ✅ Update: Gunakan paperRefillId
  const handleMarkAsPaid = async (refill) => {
    const paperRefillId = refill.paperRefillId || refill.refillId;

    if (refill.status !== "completed") {
      alert('❌ Hanya refill dengan status "Selesai" yang bisa ditandai');
      return;
    }

    if (refill.totalRevenue <= 0) {
      alert("❌ Tidak bisa menandai refill tanpa pendapatan");
      return;
    }

    if (
      !confirm(
        `Apakah Anda yakin ingin menandai refill ini sebagai "Dibayar"?\n\nProfit Partner: ${formatRupiah(refill.partnerProfit)}\nTotal Revenue: ${formatRupiah(refill.totalRevenue)}`,
      )
    ) {
      return;
    }

    setProcessingId(paperRefillId);

    // ✅ Panggil markAsPaid tanpa formData (tanpa upload proof)
    const result = await markAsPaid(paperRefillId);

    if (result.success) {
      alert("✅ Refill berhasil ditandai sebagai Dibayar");
      await refresh();
    } else {
      alert("❌ Gagal: " + (result.error || "Terjadi kesalahan"));
    }
    setProcessingId(null);
  };

  if (!isSuperAdmin()) return null;

  return (
    <div
      ref={scrollContainerRef}
      className="overflow-y-auto"
      style={{ maxHeight: "calc(100vh - 200px)" }}
    >
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          💰 Manajemen Refill Kertas
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Kelola semua transaksi pengisian ulang kertas printer
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} loading={loading} />
      <StatusStatsCards stats={stats} loading={loading} />

      {/* Filter Section */}
      <FilterSection
        filters={filters}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        options={filterOptions}
        isLoading={loading}
      />

      {/* Sort Section */}
      <SortSection
        currentSort={{ sortBy: filters.sortBy, sortOrder: filters.sortOrder }}
        onSortChange={handleChangeSort}
      />

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Daftar Refill Kertas
          </h2>
          {pagination.total > 0 && (
            <p className="text-xs text-gray-400 mt-1">
              Menampilkan {(pagination.page - 1) * pagination.limit + 1} -{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              dari {pagination.total} transaksi
            </p>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Memuat data...</p>
          </div>
        ) : (
          <>
            <RefillsTable
              refills={refills}
              onMarkAsPaid={handleMarkAsPaid}
              processingId={processingId}
              formatDate={formatDate}
              formatRupiah={formatRupiah}
            />
            {pagination.totalPages > 0 && (
              <Pagination
                pagination={pagination}
                onPageChange={handleChangePage}
                onLimitChange={handleChangeLimit}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

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

// Loading fallback
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      <span className="ml-2 text-gray-500">Memuat...</span>
    </div>
  );
}

// Halaman utama dengan Suspense boundary
export default function AdminPaperRefillsPage() {
  return (
    <AdminLayout tabs={tabs} activeTab="refills">
      <Suspense fallback={<LoadingFallback />}>
        <PaperRefillsContent />
      </Suspense>
    </AdminLayout>
  );
}
