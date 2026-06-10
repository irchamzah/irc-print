"use client";
import { Suspense, useState } from "react";
import { useHubAuth } from "../../auth/hooks/useHubAuth";
import { AdminLayout } from "../components/AdminLayout";
import { useAdminPrinterModels } from "./hooks/useAdminPrinterModels";
import { PrinterModelsTable } from "./components/PrinterModelsTable";
import { PrinterModelFormModal } from "./components/PrinterModelFormModal";
import { StatsCards } from "./components/StatsCards";
import { FilterSection } from "./components/FilterSection";
import { DeleteConfirmModal } from "../components/DeleteConfirmModal";
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

function PrinterModelsContent() {
  const { isSuperAdmin } = useHubAuth();
  const {
    printerModels,
    loading,
    pagination,
    filters,
    applyFilters,
    resetFilters,
    changePage,
    changeLimit,
    createPrinterModel,
    updatePrinterModel,
    deletePrinterModel,
  } = useAdminPrinterModels();

  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [formError, setFormError] = useState(null);

  if (!isSuperAdmin()) return null;

  const handleAddNew = () => {
    setSelectedModel(null);
    setFormError(null);
    setShowFormModal(true);
  };

  const handleEdit = (model) => {
    setSelectedModel(model);
    setFormError(null);
    setShowFormModal(true);
  };

  const handleDelete = (model) => {
    setSelectedModel(model);
    setShowDeleteModal(true);
  };

  const handleSubmit = async (formData) => {
    setProcessing(true);
    setFormError(null);

    let result;
    if (selectedModel) {
      result = await updatePrinterModel(
        selectedModel.printerModelId || selectedModel._id,
        formData,
      );
    } else {
      result = await createPrinterModel(formData);
    }

    if (result.success) {
      setShowFormModal(false);
      setSelectedModel(null);
    } else {
      setFormError(result.error || "Terjadi kesalahan");
    }
    setProcessing(false);
  };

  const handleConfirmDelete = async () => {
    if (!selectedModel) return;
    setProcessing(true);
    const result = await deletePrinterModel(
      selectedModel.printerModelId || selectedModel._id,
    );
    if (result.success) {
      setShowDeleteModal(false);
      setSelectedModel(null);
    } else {
      alert("Gagal menghapus: " + result.error);
    }
    setProcessing(false);
  };

  return (
    <div
      className="overflow-y-auto"
      style={{ maxHeight: "calc(100vh - 200px)" }}
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            📦 Manajemen Model Printer
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola template model printer yang tersedia
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Tambah Model
        </button>
      </div>

      <StatsCards
        stats={{
          total: pagination.total,
          active: printerModels.filter((m) => m.isActive).length,
        }}
        loading={loading}
      />

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
            <PrinterModelsTable
              printerModels={printerModels}
              onEdit={handleEdit}
              onDelete={handleDelete}
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

      <PrinterModelFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        onSubmit={handleSubmit}
        model={selectedModel}
        error={formError}
        processing={processing}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus Model Printer"
        message={`Apakah Anda yakin ingin menghapus model "${selectedModel?.displayName || selectedModel?.model}"?`}
        processing={processing}
      />
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

export default function AdminPrinterModelsPage() {
  return (
    <AdminLayout tabs={tabs} activeTab="printer-models">
      <Suspense fallback={<LoadingFallback />}>
        <PrinterModelsContent />
      </Suspense>
    </AdminLayout>
  );
}
