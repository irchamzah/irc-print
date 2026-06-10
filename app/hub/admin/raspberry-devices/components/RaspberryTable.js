// /app/hub/admin/raspberry-devices/components/RaspberryTable.js
"use client";
import { useState } from "react";

const StatusBadge = ({ status }) => {
  const styles = {
    active: "bg-green-100 text-green-700",
    inactive: "bg-red-100 text-red-700",
    maintenance: "bg-yellow-100 text-yellow-700",
  };
  const labels = {
    active: "Active",
    inactive: "Inactive",
    maintenance: "Maintenance",
  };
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.inactive}`}
    >
      {labels[status] || status}
    </span>
  );
};

const LastHeartbeatBadge = ({ lastHeartbeat }) => {
  if (!lastHeartbeat)
    return <span className="text-gray-400 text-sm">Never</span>;

  const now = new Date();
  const last = new Date(lastHeartbeat);
  const diffMinutes = Math.floor((now - last) / 60000);

  if (diffMinutes < 1)
    return <span className="text-green-600 text-sm">Baru saja</span>;
  if (diffMinutes < 5)
    return (
      <span className="text-green-600 text-sm">{diffMinutes} mnt lalu</span>
    );
  if (diffMinutes < 60)
    return (
      <span className="text-yellow-600 text-sm">{diffMinutes} mnt lalu</span>
    );

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24)
    return (
      <span className="text-orange-600 text-sm">{diffHours} jam lalu</span>
    );

  return (
    <span className="text-red-600 text-sm">
      {Math.floor(diffHours / 24)} hari lalu
    </span>
  );
};

export function RaspberryTable({
  devices,
  onEdit,
  onAssign,
  onDelete,
  onCreate,
  formatDate,
  pagination,
  onPageChange,
  onLimitChange,
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredDevices = devices.filter(
    (device) =>
      device.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.ipAddress?.includes(searchTerm),
  );

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              💻 Daftar Raspberry Devices
            </h2>
            {pagination.total > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                Menampilkan {(pagination.page - 1) * pagination.limit + 1} -{" "}
                {Math.min(
                  pagination.page * pagination.limit,
                  pagination.total,
                )}{" "}
                dari {pagination.total} device
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 min-w-0">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari device..."
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
                <span>Tambah Device</span>
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
                Info Device
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                IP Address
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Printer Terhubung
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Heartbeat
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
            {filteredDevices.map((device) => (
              <tr key={device._id} className="hover:bg-gray-50">
                <td className="px-4 sm:px-6 py-3">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {device.name}
                    </div>
                    <div className="text-xs text-gray-500 font-mono">
                      {device._id}
                    </div>
                    {device.version && (
                      <div className="text-xs text-gray-400 mt-1">
                        v{device.version}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 sm:px-6 py-3">
                  <StatusBadge status={device.status} />
                </td>
                <td className="px-4 sm:px-6 py-3">
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                    {device.ipAddress || "-"}
                  </code>
                </td>
                <td className="px-4 sm:px-6 py-3">
                  <div className="flex flex-wrap items-center gap-1">
                    {device.assignedPrinters &&
                    device.assignedPrinters.length > 0 ? (
                      <>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {device.assignedPrinters.length} printer
                        </span>
                        <button
                          onClick={() => onAssign(device)}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Kelola
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => onAssign(device)}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        Assign printer
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-4 sm:px-6 py-3">
                  <LastHeartbeatBadge lastHeartbeat={device.lastHeartbeat} />
                </td>
                <td className="px-4 sm:px-6 py-3 text-sm text-gray-600">
                  {formatDate(device.createdAt)}
                </td>
                <td className="px-4 sm:px-6 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onAssign(device)}
                      className="p-1 text-purple-600 hover:bg-purple-50 rounded"
                      title="Assign Printer"
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
                          d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => onEdit(device)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
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
                      onClick={() => onDelete(device)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
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

      {filteredDevices.length === 0 && (
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-gray-500">Tidak ada device ditemukan</p>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t bg-gray-50">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Tampilkan</span>
            <select
              value={pagination.limit}
              onChange={(e) => onLimitChange(parseInt(e.target.value))}
              className="px-2 py-1 border border-gray-300 rounded-lg text-sm bg-white"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-gray-600">data</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sebelumnya
            </button>
            <span className="text-sm text-gray-600">
              Halaman {pagination.page} dari {pagination.totalPages || 1}
            </span>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
