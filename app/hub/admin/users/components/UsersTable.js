// app/hub/admin/users/components/UsersTable.js SUDAH DIUPDATE
"use client";
import { useState } from "react";

// UsersTable - UPDATED dengan struktur baru
export const UsersTable = ({
  users,
  onEdit,
  onDelete,
  onCreate,
  formatDate,
  formatRupiah,
  formatPoints,
  getRoleBadge, // ✅ Tambah dari hook
  getAccessPrinterCount, // ✅ Tambah dari hook
  pagination,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm) ||
      user.role?.includes(searchTerm),
  );

  // ✅ Gunakan getRoleBadge dari props jika ada, fallback ke internal
  const renderRoleBadge = (user) => {
    if (getRoleBadge) {
      const badge = getRoleBadge(user.role);
      return (
        <span className={`px-2 py-1 rounded-full text-xs ${badge.class}`}>
          {badge.text}
        </span>
      );
    }

    // Fallback jika getRoleBadge tidak tersedia
    if (user.role === "super_admin") {
      return (
        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
          Super Admin
        </span>
      );
    }
    if (user.role === "admin") {
      return (
        <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs">
          Admin
        </span>
      );
    }
    if (user.role === "partner") {
      return (
        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
          Partner
        </span>
      );
    }
    if (user.role === "customer") {
      return (
        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
          Customer
        </span>
      );
    }
    return (
      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
        {user.role || "Customer"}
      </span>
    );
  };

  // ✅ Render akses printer (menggunakan accessPrinterIds)
  const renderAccessPrinters = (user) => {
    if (user.role === "partner" || user.role === "admin") {
      const count = getAccessPrinterCount
        ? getAccessPrinterCount(user)
        : user.accessPrinterIds?.length || 0;

      return (
        <div className="text-sm text-gray-600">
          {count} printer
          {count > 0 && (
            <span className="text-xs text-gray-400 ml-1">(terdaftar)</span>
          )}
        </div>
      );
    }
    return <div className="text-sm text-gray-400">-</div>;
  };

  // ✅ Render points dan total spent
  const renderPointsInfo = (user) => {
    if (user) {
      return (
        <div>
          <div className="text-sm font-medium text-green-600">
            {formatPoints
              ? formatPoints(user.points)
              : (user.points || 0).toFixed(2)}{" "}
            pts
          </div>
          <div className="text-xs text-gray-400">
            Total:{" "}
            {formatRupiah
              ? formatRupiah(user.totalSpent)
              : `Rp ${(user.totalSpent || 0).toLocaleString()}`}
          </div>
        </div>
      );
    }
    return <div className="text-sm text-gray-400">-</div>;
  };

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              👥 Daftar User
            </h2>
            {pagination.total > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                Menampilkan {(pagination.page - 1) * pagination.limit + 1} -{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                dari {pagination.total} user
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="flex-1 min-w-0">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari user..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
                <svg
                  className="w-4 h-4 text-gray-400 absolute left-3 top-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Tombol Tambah User */}
            <div className="flex-shrink-0">
              <button
                onClick={onCreate}
                className="w-full sm:w-auto px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium flex items-center justify-center gap-2"
              >
                <svg
                  className="w-4 h-4"
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
                <span className="sm:inline">Tambah User</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nama
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Akses Printer
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Points / Total
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dibuat
              </th>
              <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user.userId || user.phone} className="hover:bg-gray-50">
                <td className="px-4 sm:px-6 py-3">
                  <div className="text-sm font-medium text-gray-800">
                    {user.name || "—"}
                  </div>
                  {user.userId && (
                    <div className="text-xs text-gray-400 mt-0.5">
                      ID: {user.userId.slice(0, 12)}...
                    </div>
                  )}
                </td>
                <td className="px-4 sm:px-6 py-3 text-sm text-gray-600">
                  {user.phone}
                </td>
                <td className="px-4 sm:px-6 py-3">{renderRoleBadge(user)}</td>
                <td className="px-4 sm:px-6 py-3">
                  {renderAccessPrinters(user)}
                </td>
                <td className="px-4 sm:px-6 py-3">{renderPointsInfo(user)}</td>
                <td className="px-4 sm:px-6 py-3 text-sm text-gray-600">
                  {formatDate(user.createdAt)}
                </td>
                <td className="px-4 sm:px-6 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(user)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Edit"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(user)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Hapus"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <svg
            className="w-16 h-16 text-gray-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <p className="text-gray-500">Tidak ada user ditemukan</p>
        </div>
      )}
    </div>
  );
};
