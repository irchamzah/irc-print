// app/hub/admin/users/page.js SUDAH DIUPDATE
"use client";
import { Suspense } from "react";
import { useState, useRef, useEffect } from "react";
import { useHubAuth } from "../../auth/hooks/useHubAuth";
import { AdminLayout } from "../components/AdminLayout";
import { useAdminUsers } from "../hooks/useAdminUsers";
import { UserFormModal } from "./components/UserFormModal";
import { DeleteConfirmModal } from "../components/DeleteConfirmModal";
import { StatsCards } from "./components/StatsCards";
import { FilterSection } from "./components/FilterSection";
import { SortSection } from "./components/SortSection";
import { UsersTable } from "./components/UsersTable";
import { Pagination } from "./components/Pagination";

// Komponen konten yang menggunakan useAdminUsers
function UsersContent() {
  const { isSuperAdmin } = useHubAuth();
  const {
    users,
    stats,
    loading,
    pagination,
    filters,
    applyFilters,
    resetFilters,
    changePage,
    changeLimit,
    changeSort,
    createUser,
    updateUser,
    deleteUser,
    formatDate,
    formatRupiah,
    formatPoints,
    getRoleBadge, // ✅ Tambah dari hook
    getAccessPrinterCount, // ✅ Tambah dari hook
  } = useAdminUsers();

  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [formError, setFormError] = useState(null);
  const [printers, setPrinters] = useState([]);
  const scrollRef = useRef(null);

  const saveScrollPosition = () => {
    if (scrollRef.current) {
      const position = scrollRef.current.scrollTop;
      sessionStorage.setItem("usersScrollPos", position);
    }
  };

  // Kembalikan posisi scroll setelah loading selesai
  useEffect(() => {
    const savedPosition = sessionStorage.getItem("usersScrollPos");
    if (savedPosition && scrollRef.current && !loading) {
      scrollRef.current.scrollTop = parseInt(savedPosition);
      sessionStorage.removeItem("usersScrollPos");
    }
  }, [loading]);

  // Fetch printers for partner access
  useEffect(() => {
    const fetchPrinters = async () => {
      try {
        const token = localStorage.getItem("hubToken");
        const response = await fetch(`/api/hub/admin/printers?limit=1000`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.success) {
          setPrinters(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching printers:", error);
      }
    };
    fetchPrinters();
  }, []);

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
    setSelectedUser(null);
    setFormError(null);
    setShowFormModal(true);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormError(null);
    setShowFormModal(true);
  };

  const handleDelete = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleSubmit = async (formData) => {
    setProcessing(true);
    setFormError(null);

    let result;
    if (selectedUser) {
      result = await updateUser(selectedUser.userId, formData);
    } else {
      result = await createUser(formData);
    }

    if (result.success) {
      setShowFormModal(false);
      setSelectedUser(null);
    } else {
      setFormError(result.error || "Terjadi kesalahan");
    }
    setProcessing(false);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    setProcessing(true);
    const result = await deleteUser(selectedUser.userId);
    if (result.success) {
      setShowDeleteModal(false);
      setSelectedUser(null);
    } else {
      alert("Gagal menghapus user: " + result.error);
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            👥 Manajemen User
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola semua user, partner, dan admin
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
            <UsersTable
              users={users}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onCreate={handleAddNew}
              formatDate={formatDate}
              formatRupiah={formatRupiah}
              formatPoints={formatPoints}
              getRoleBadge={getRoleBadge} // ✅ Tambah
              getAccessPrinterCount={getAccessPrinterCount} // ✅ Tambah
              pagination={pagination}
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

      {/* Modals */}
      <UserFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        onSubmit={handleSubmit}
        user={selectedUser}
        printers={printers}
        error={formError}
        processing={processing}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus User"
        message={`Apakah Anda yakin ingin menghapus user "${selectedUser?.name}"?`}
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
export default function AdminUsersPage() {
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
    <AdminLayout tabs={tabs} activeTab="users">
      <Suspense fallback={<LoadingFallback />}>
        <UsersContent />
      </Suspense>
    </AdminLayout>
  );
}
