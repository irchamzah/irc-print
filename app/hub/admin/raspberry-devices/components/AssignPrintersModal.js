// /app/hub/admin/raspberry-devices/components/AssignPrintersModal.js
"use client";
import { useState, useEffect } from "react";
import { useHubAuth } from "../../../auth/hooks/useHubAuth";

export function AssignPrintersModal({
  isOpen,
  onClose,
  onSubmit,
  device,
  processing,
}) {
  const { token } = useHubAuth();
  const [printers, setPrinters] = useState([]);
  const [selectedPrinters, setSelectedPrinters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchPrinters();
      if (device?.assignedPrinters) {
        setSelectedPrinters(device.assignedPrinters);
      }
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, device]);

  const fetchPrinters = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/hub/admin/printers?limit=100", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (result.success) {
        setPrinters(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching printers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePrinter = (printerId) => {
    setSelectedPrinters((prev) =>
      prev.includes(printerId)
        ? prev.filter((id) => id !== printerId)
        : [...prev, printerId],
    );
  };

  const handleSelectAll = () => {
    const filteredPrinters = printers.filter(
      (p) =>
        (p.printerName || p.name || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        p.printerId.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    const allIds = filteredPrinters.map((p) => p.printerId);
    setSelectedPrinters(allIds);
  };

  const handleClearAll = () => {
    setSelectedPrinters([]);
  };

  const handleSubmit = () => {
    onSubmit(selectedPrinters);
  };

  const filteredPrinters = printers.filter(
    (printer) =>
      (printer.printerName || printer.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      printer.printerId.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full mx-auto transform transition-all duration-300">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Assign Printers to {device?.name}
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Pilih printer yang akan dikelola oleh Raspberry Pi ini
            </p>

            <div className="mb-4">
              <input
                type="text"
                placeholder="Cari printer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-gray-500">
                {selectedPrinters.length} printer terpilih
              </div>
              <div className="space-x-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Pilih Semua
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Hapus Semua
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Memuat printer...</p>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
                {filteredPrinters.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Tidak ada printer ditemukan
                  </div>
                ) : (
                  filteredPrinters.map((printer) => (
                    <label
                      key={printer.printerId}
                      className="flex items-center p-3 hover:bg-gray-50 border-b border-gray-100 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPrinters.includes(printer.printerId)}
                        onChange={() => handleTogglePrinter(printer.printerId)}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <div className="ml-3 flex-1">
                        <div className="font-medium text-gray-900">
                          {printer.printerName || printer.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {printer.printerId}
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {printer.status === "active" ? "🟢" : "🔴"}
                      </div>
                    </label>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={processing}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {processing && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              Simpan Assignment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
