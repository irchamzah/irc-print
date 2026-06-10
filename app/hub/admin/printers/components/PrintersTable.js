// app/hub/admin/printers/components/PrintersTable.js
"use client";
import CustomLink from "@/app/components/CustomLink";
import { useState } from "react";
import { PrinterSyncModal } from "./PrinterSyncModal";

export const PrintersTable = ({
  printers,
  onEdit,
  onDelete,
  onCreate,
  formatDate,
  pagination,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPrinter, setSelectedPrinter] = useState(null);
  const [showSyncModal, setShowSyncModal] = useState(false);

  const filteredPrinters = printers.filter(
    (printer) =>
      (printer.printerName || printer.name)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      printer.printerId?.includes(searchTerm) ||
      printer.location?.city?.includes(searchTerm),
  );

  const getStatusBadge = (status) => {
    if (status === "online") {
      return (
        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
          Online
        </span>
      );
    }
    return (
      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
        Offline
      </span>
    );
  };

  const handleSync = (printer) => {
    setSelectedPrinter(printer);
    setShowSyncModal(true);
  };

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              🖨️ Daftar Printer
            </h2>
            {pagination.total > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                Menampilkan {(pagination.page - 1) * pagination.limit + 1} -{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                dari {pagination.total} printer
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 min-w-0">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari printer..."
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
                <span className="sm:inline">Tambah Printer</span>
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
                Nama Printer
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Raspberry Pi
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                USB ID
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sisa Kertas
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Jobs
              </th>
              <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredPrinters.map((printer) => (
              <tr key={printer.printerId} className="hover:bg-gray-50">
                <td className="px-4 sm:px-6 py-3">
                  <CustomLink
                    href={`/hub/printers/${printer.printerId}`}
                    className="text-sm font-medium text-blue-500 hover:underline"
                  >
                    {printer.printerName}
                  </CustomLink>
                </td>
                <td className="px-4 sm:px-6 py-3">
                  <div className="text-xs text-gray-500 font-mono">
                    {printer.printerId}
                  </div>
                </td>
                <td className="px-4 sm:px-6 py-3">
                  {printer.raspberryId ? (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                      {printer.raspberryId}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">Not assigned</span>
                  )}
                </td>
                <td className="px-4 sm:px-6 py-3">
                  {printer.usbDeviceId ? (
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                      {printer.usbDeviceId}
                    </code>
                  ) : (
                    <span className="text-xs text-gray-400">Unknown</span>
                  )}
                </td>
                <td className="px-4 sm:px-6 py-3">
                  {getStatusBadge(printer.status)}
                </td>
                <td className="px-4 sm:px-6 py-3 text-sm text-gray-600">
                  {printer.paperStatus?.paperCount || 0} lembar
                </td>
                <td className="px-4 sm:px-6 py-3 text-sm text-gray-600">
                  {printer.statistics?.totalJobs || 0}
                </td>
                <td className="px-4 sm:px-6 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {/* Tombol Sinkronisasi */}
                    <button
                      onClick={() => handleSync(printer)}
                      className="p-1 text-green-600 hover:bg-green-50 rounded"
                      title="Sinkronisasi dengan Raspberry Pi"
                      disabled={!printer.raspberryId}
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
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => onEdit(printer)}
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
                      onClick={() => onDelete(printer)}
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

      {filteredPrinters.length === 0 && (
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
          <p className="text-gray-500">Tidak ada printer ditemukan</p>
        </div>
      )}

      {/* Modal Sinkronisasi */}
      <PrinterSyncModal
        isOpen={showSyncModal}
        onClose={() => setShowSyncModal(false)}
        printer={selectedPrinter}
      />
    </div>
  );
};
