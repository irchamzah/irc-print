"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useHubAuth } from "../../auth/hooks/useHubAuth";
import { useAdminPrinters } from "../hooks/useAdminPrinters";
import { AdminLayout } from "../components/AdminLayout";
import { PrintersTable } from "../components/PrintersTable";
import { PrinterFormModal } from "../components/PrinterFormModal";
import { DeleteConfirmModal } from "../components/DeleteConfirmModal";
import LoadingAnimation from "@/app/components/LoadingAnimation";

export default function AdminPrintersPage() {
  const router = useRouter();
  const { user, isSuperAdmin } = useHubAuth();
  const {
    printers,
    loading,
    error,
    processing,
    createPrinter,
    updatePrinter,
    deletePrinter,
    refreshPrinters,
    formatDate,
  } = useAdminPrinters();

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPrinter, setSelectedPrinter] = useState(null);
  const [modalError, setModalError] = useState(null);

  // Redirect if not super admin
  useEffect(() => {
    if (user && !isSuperAdmin()) {
      router.push("/hub");
    }
  }, [user, isSuperAdmin, router]);

  const handleCreate = () => {
    setSelectedPrinter(null);
    setModalError(null);
    setShowModal(true);
  };

  const handleEdit = (printer) => {
    setSelectedPrinter(printer);
    setModalError(null);
    setShowModal(true);
  };

  const handleDelete = (printer) => {
    setSelectedPrinter(printer);
    setShowDeleteModal(true);
  };

  const handleSubmit = async (formData) => {
    setModalError(null);

    let result;
    if (selectedPrinter) {
      result = await updatePrinter(selectedPrinter.printerId, formData);
    } else {
      result = await createPrinter(formData);
    }

    if (result.success) {
      setShowModal(false);
    } else {
      setModalError(result.error || "Gagal menyimpan data");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPrinter) return;

    const result = await deletePrinter(selectedPrinter.printerId);

    if (result.success) {
      setShowDeleteModal(false);
    } else {
      alert("Gagal menghapus printer: " + (result.error || "Unknown error"));
    }
  };

  const tabs = [
    { id: "users", label: "👥 Users", href: "/hub/admin/users" },
    { id: "printers", label: "🖨️ Printers", href: "/hub/admin/printers" },
    {
      id: "refills",
      label: "💰 Paper Refills",
      href: "/hub/admin/paper-refills",
    },
  ];

  // Loading state
  if (loading) {
    return (
      <AdminLayout tabs={tabs} activeTab="printers">
        <LoadingAnimation />
      </AdminLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <AdminLayout tabs={tabs} activeTab="printers">
        <div className="bg-white rounded-xl border border-red-200 p-8 text-center">
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
            onClick={refreshPrinters}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Coba Lagi
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout tabs={tabs} activeTab="printers">
      <PrintersTable
        printers={printers}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreate={handleCreate}
        formatDate={formatDate}
      />

      <PrinterFormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        printer={selectedPrinter}
        error={modalError}
        processing={processing}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        itemName={selectedPrinter?.name}
        processing={processing}
      />
    </AdminLayout>
  );
}
