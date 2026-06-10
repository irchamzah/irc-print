// /app/hub/admin/raspberry-devices/page.js
"use client";
import { Suspense } from "react";
import { useState, useRef, useEffect } from "react";
import { useHubAuth } from "../../auth/hooks/useHubAuth";
import { AdminLayout } from "../components/AdminLayout";
import { useRaspberryDevices } from "./hooks/useRaspberryDevices";
import { RaspberryFormModal } from "./components/RaspberryFormModal";
import { AssignPrintersModal } from "./components/AssignPrintersModal";
import { DeleteConfirmModal } from "../components/DeleteConfirmModal";
import { StatsCards } from "./components/StatsCards";
import { FilterSection } from "./components/FilterSection";
import { RaspberryTable } from "./components/RaspberryTable";

// Komponen konten yang menggunakan useRaspberryDevices
function RaspberryDevicesContent() {
  const { isSuperAdmin } = useHubAuth();
  const {
    devices,
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
    createDevice,
    updateDevice,
    deleteDevice,
    assignPrinters,
    formatDate,
  } = useRaspberryDevices();

  const [showFormModal, setShowFormModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [formError, setFormError] = useState(null);
  const scrollRef = useRef(null);

  const saveScrollPosition = () => {
    if (scrollRef.current) {
      const position = scrollRef.current.scrollTop;
      sessionStorage.setItem("raspberryDevicesScrollPos", position);
    }
  };

  useEffect(() => {
    const savedPosition = sessionStorage.getItem("raspberryDevicesScrollPos");
    if (savedPosition && scrollRef.current && !loading) {
      scrollRef.current.scrollTop = parseInt(savedPosition);
      sessionStorage.removeItem("raspberryDevicesScrollPos");
    }
  }, [loading]);

  const handleApplyFilters = async (newFilters) => {
    saveScrollPosition();
    await applyFilters(newFilters);
  };

  const handleResetFilters = async () => {
    saveScrollPosition();
    await resetFilters();
  };

  const handleChangePage = (newPage) => {
    saveScrollPosition();
    changePage(newPage);
  };

  const handleChangeLimit = (newLimit) => {
    saveScrollPosition();
    changeLimit(newLimit);
  };

  const handleAddNew = () => {
    setSelectedDevice(null);
    setFormError(null);
    setShowFormModal(true);
  };

  const handleEdit = (device) => {
    setSelectedDevice(device);
    setFormError(null);
    setShowFormModal(true);
  };

  const handleAssignPrinters = (device) => {
    setSelectedDevice(device);
    setShowAssignModal(true);
  };

  const handleDelete = (device) => {
    setSelectedDevice(device);
    setShowDeleteModal(true);
  };

  const handleSubmit = async (formData) => {
    setProcessing(true);
    setFormError(null);

    let result;
    if (selectedDevice) {
      result = await updateDevice(selectedDevice._id, formData);
    } else {
      result = await createDevice(formData);
    }

    if (result.success) {
      setShowFormModal(false);
      setSelectedDevice(null);
    } else {
      setFormError(result.error || "Terjadi kesalahan");
    }
    setProcessing(false);
  };

  const handleAssignSubmit = async (printerIds) => {
    setProcessing(true);
    const result = await assignPrinters(selectedDevice._id, printerIds);
    if (result.success) {
      setShowAssignModal(false);
      setSelectedDevice(null);
    } else {
      alert("Gagal assign printer: " + result.error);
    }
    setProcessing(false);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDevice) return;
    setProcessing(true);
    const result = await deleteDevice(selectedDevice._id);
    if (result.success) {
      setShowDeleteModal(false);
      setSelectedDevice(null);
    } else {
      alert("Gagal menghapus device: " + result.error);
    }
    setProcessing(false);
  };

  if (!isSuperAdmin()) return null;

  return (
    <div
      ref={scrollRef}
      className="overflow-y-auto"
      style={{ maxHeight: "calc(100vh - 200px)" }}
    >
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          💻 Manajemen Raspberry Devices
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Kelola semua perangkat Raspberry Pi yang terdaftar
        </p>
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

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Memuat data...</p>
          </div>
        ) : (
          <>
            <RaspberryTable
              devices={devices}
              onEdit={handleEdit}
              onAssign={handleAssignPrinters}
              onDelete={handleDelete}
              onCreate={handleAddNew}
              formatDate={formatDate}
              pagination={pagination}
              onPageChange={handleChangePage}
              onLimitChange={handleChangeLimit}
            />
          </>
        )}
      </div>

      {/* Modals */}
      <RaspberryFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        onSubmit={handleSubmit}
        device={selectedDevice}
        error={formError}
        processing={processing}
      />

      <AssignPrintersModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        onSubmit={handleAssignSubmit}
        device={selectedDevice}
        processing={processing}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus Raspberry Device"
        message={`Apakah Anda yakin ingin menghapus device "${selectedDevice?.name}"?`}
        processing={processing}
      />
    </div>
  );
}

// Loading fallback
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      <span className="ml-2 text-gray-500">Memuat data...</span>
    </div>
  );
}

// Halaman utama dengan Suspense boundary
export default function AdminRaspberryDevicesPage() {
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

  return (
    <AdminLayout tabs={tabs} activeTab="raspberry-devices">
      <Suspense fallback={<LoadingFallback />}>
        <RaspberryDevicesContent />
      </Suspense>
    </AdminLayout>
  );
}
