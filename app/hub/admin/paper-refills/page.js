"use client";
import { useState, useRef, useEffect } from "react";
import { useHubAuth } from "../../auth/hooks/useHubAuth";
import { AdminLayout } from "../components/AdminLayout";
import { useAdminPaperRefills } from "../hooks/useAdminPaperRefills";
import { ProofUploadModal } from "./components/ProofUploadModal";
import { StatsCards } from "./components/StatsCards";
import { StatusStatsCards } from "./components/StatusStatsCards";
import { FilterSection } from "./components/FilterSection";
import { SortSection } from "./components/SortSection";
import { RefillsTable } from "./components/RefillsTable";
import { Pagination } from "./components/Pagination";

export default function AdminPaperRefillsPage() {
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
  const [showProofModal, setShowProofModal] = useState(false);
  const [selectedRefill, setSelectedRefill] = useState(null);

  const scrollContainerRef = useRef(null);

  const tabs = [
    { id: "users", label: "👥 Users", href: "/hub/admin/users" },
    { id: "printers", label: "🖨️ Printers", href: "/hub/admin/printers" },
    {
      id: "refills",
      label: "💰 Paper Refills",
      href: "/hub/admin/paper-refills",
    },
  ];

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

  const handleMarkAsPaid = (refill) => {
    if (refill.status !== "completed") {
      alert('❌ Hanya refill dengan status "Selesai" yang bisa dibayar');
      return;
    }
    setSelectedRefill(refill);
    setShowProofModal(true);
  };

  const handleConfirmPayment = async (formData) => {
    if (!selectedRefill) return;
    setProcessingId(selectedRefill.refillId);
    const result = await markAsPaid(selectedRefill.refillId, formData);
    if (result.success) {
      alert("✅ Pembayaran berhasil");
      setShowProofModal(false);
      await refresh();
    } else {
      alert("❌ Gagal: " + result.error);
    }
    setProcessingId(null);
  };

  const handleViewProof = (refill) => {
    if (refill.transferProof) {
      window.open(
        `${process.env.NEXT_PUBLIC_VPS_API_URL}${refill.transferProof.url}`,
        "_blank",
      );
    }
  };

  if (!isSuperAdmin()) return null;

  return (
    <AdminLayout tabs={tabs} activeTab="refills">
      {/* ✅ Container dengan ref untuk scroll */}
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
                onViewProof={handleViewProof}
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

        {/* Modal Upload Bukti */}
        <ProofUploadModal
          isOpen={showProofModal}
          onClose={() => setShowProofModal(false)}
          onConfirm={handleConfirmPayment}
          refill={selectedRefill}
          processing={processingId === selectedRefill?.refillId}
          formatRupiah={formatRupiah}
        />
      </div>
    </AdminLayout>
  );
}
