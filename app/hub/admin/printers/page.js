"use client";
import { useState, useRef, useEffect } from "react";
import { useHubAuth } from "../../auth/hooks/useHubAuth";
import { AdminLayout } from "../components/AdminLayout";
import { useAdminPrinters } from "../hooks/useAdminPrinters";
import { PrinterFormModal } from "./components/PrinterFormModal";
import { DeleteConfirmModal } from "../components/DeleteConfirmModal";
import { StatsCards } from "./components/StatsCards";
import { FilterSection } from "./components/FilterSection";
import { SortSection } from "./components/SortSection";
import { PrintersTable } from "./components/PrintersTable";
import { Pagination } from "./components/Pagination";

// Main Page
export default function AdminPrintersPage() {
  const { isSuperAdmin } = useHubAuth();
  const {
    printers,
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
    createPrinter,
    updatePrinter,
    deletePrinter,
    formatDate,
  } = useAdminPrinters();

  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPrinter, setSelectedPrinter] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [formError, setFormError] = useState(null);
  const scrollRef = useRef(null);

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
    if (scrollRef.current) {
      const position = scrollRef.current.scrollTop;
      sessionStorage.setItem("paperRefillsScrollPos", position);
    }
  };

  const handleApplyFilters = async (newFilters) => {
    saveScrollPosition();
    await applyFilters(newFilters);
  };

  const handleResetFilters = async () => {
    saveScrollPosition();
    await resetFilters();
  };

  const handleAddNew = () => {
    setSelectedPrinter(null);
    setFormError(null);
    setShowFormModal(true);
  };

  const handleEdit = (printer) => {
    setSelectedPrinter(printer);
    setFormError(null);
    setShowFormModal(true);
  };

  const handleDelete = (printer) => {
    setSelectedPrinter(printer);
    setShowDeleteModal(true);
  };

  const handleSubmit = async (formData) => {
    setProcessing(true);
    setFormError(null);

    let result;
    if (selectedPrinter) {
      result = await updatePrinter(selectedPrinter.printerId, formData);
    } else {
      result = await createPrinter(formData);
    }

    if (result.success) {
      setShowFormModal(false);
      setSelectedPrinter(null);
    } else {
      setFormError(result.error || "Terjadi kesalahan");
    }
    setProcessing(false);
  };

  const handleConfirmDelete = async () => {
    if (!selectedPrinter) return;
    setProcessing(true);
    const result = await deletePrinter(selectedPrinter.printerId);
    if (result.success) {
      setShowDeleteModal(false);
      setSelectedPrinter(null);
    } else {
      alert("Gagal menghapus printer: " + result.error);
    }
    setProcessing(false);
  };

  if (!isSuperAdmin()) return null;

  return (
    <AdminLayout tabs={tabs} activeTab="printers">
      <div
        ref={scrollRef}
        className="overflow-y-auto"
        style={{ maxHeight: "calc(100vh - 200px)" }}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              🖨️ Manajemen Printer
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Kelola semua printer yang terdaftar
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <StatsCards stats={stats} loading={loading} />

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
          onSortChange={changeSort}
        />

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Memuat data...</p>
            </div>
          ) : (
            <>
              <PrintersTable
                printers={printers}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onCreate={handleAddNew}
                formatDate={formatDate}
                pagination={pagination}
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

        {/* Modals */}
        <PrinterFormModal
          isOpen={showFormModal}
          onClose={() => setShowFormModal(false)}
          onSubmit={handleSubmit}
          printer={selectedPrinter}
          error={formError}
          processing={processing}
        />

        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleConfirmDelete}
          title="Hapus Printer"
          message={`Apakah Anda yakin ingin menghapus printer "${selectedPrinter?.name}"?`}
          processing={processing}
        />
      </div>
    </AdminLayout>
  );
}
