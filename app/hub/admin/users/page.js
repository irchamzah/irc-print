"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useHubAuth } from "../../auth/hooks/useHubAuth";
import { useAdminUsers } from "../hooks/useAdminUsers";
import { AdminLayout } from "../components/AdminLayout";
import { UsersTable } from "../components/UsersTable";
import { UserFormModal } from "../components/UserFormModal";
import { DeleteConfirmModal } from "../components/DeleteConfirmModal";
import LoadingAnimation from "@/app/components/LoadingAnimation";

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, isSuperAdmin } = useHubAuth();
  const {
    users,
    printers,
    loading,
    error,
    processing,
    createUser,
    updateUser,
    deleteUser,
    refreshUsers,
    formatDate,
  } = useAdminUsers();

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalError, setModalError] = useState(null);

  // Redirect if not super admin
  useEffect(() => {
    if (user && !isSuperAdmin()) {
      router.push("/hub");
    }
  }, [user, isSuperAdmin, router]);

  const handleCreate = () => {
    setSelectedUser(null);
    setModalError(null);
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setModalError(null);
    setShowModal(true);
  };

  const handleDelete = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleSubmit = async (formData) => {
    setModalError(null);

    let result;
    if (selectedUser) {
      result = await updateUser(selectedUser.userId, formData);
    } else {
      result = await createUser(formData);
    }

    if (result.success) {
      setShowModal(false);
    } else {
      setModalError(result.error || "Gagal menyimpan data");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;

    const result = await deleteUser(selectedUser.userId);

    if (result.success) {
      setShowDeleteModal(false);
    } else {
      alert("Gagal menghapus user: " + (result.error || "Unknown error"));
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
      <AdminLayout tabs={tabs} activeTab="users">
        <LoadingAnimation />
      </AdminLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <AdminLayout tabs={tabs} activeTab="users">
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
            onClick={refreshUsers}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Coba Lagi
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout tabs={tabs} activeTab="users">
      <UsersTable
        users={users}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreate={handleCreate}
        formatDate={formatDate}
      />

      <UserFormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        user={selectedUser}
        printers={printers}
        error={modalError}
        processing={processing}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        itemName={selectedUser?.name}
        processing={processing}
      />
    </AdminLayout>
  );
}
