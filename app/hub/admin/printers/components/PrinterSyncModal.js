// app/hub/admin/printers/components/PrinterSyncModal.js
"use client";
import { useState, useEffect } from "react";
import { useHubAuth } from "../../../auth/hooks/useHubAuth";

export const PrinterSyncModal = ({ isOpen, onClose, printer }) => {
  const { token } = useHubAuth();
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [usbDevices, setUsbDevices] = useState([]);
  const [cupsPrinters, setCupsPrinters] = useState([]);
  const [selectedUsbDevice, setSelectedUsbDevice] = useState(null);
  const [selectedCupsPrinter, setSelectedCupsPrinter] = useState(null);
  const [syncResult, setSyncResult] = useState(null);
  const [error, setError] = useState(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen && printer) {
      setUsbDevices([]);
      setCupsPrinters([]);
      setSelectedUsbDevice(null);
      setSelectedCupsPrinter(null);
      setSyncResult(null);
      setError(null);
      fetchUSBDevices();
    }
  }, [isOpen, printer]);

  const fetchUSBDevices = async () => {
    if (!printer?.raspberryId) return;

    setLoading(true);
    setError(null);

    try {
      // Request scan USB dari Raspberry Pi
      const response = await fetch(
        `/api/hub/admin/raspberry-devices/${printer.raspberryId}/scan-usb`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const result = await response.json();

      console.log("Scan USB response:", result);

      if (result.success) {
        // Tunggu hasil scan (polling)
        await pollForUSBScanResult(printer.raspberryId);
      } else {
        setError(result.error || "Gagal meminta scan USB");
      }
    } catch (error) {
      console.error("Error requesting USB scan:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const pollForUSBScanResult = async (raspberryId, maxAttempts = 30) => {
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Tunggu 2 detik

      try {
        const response = await fetch(
          `/api/hub/admin/raspberry-devices/${raspberryId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        console.log(`Polling attempt ${i + 1}:`, data);

        if (data.success && (data.data.usbDevices || data.data.cupsPrinters)) {
          setUsbDevices(data.data.usbDevices || []);
          setCupsPrinters(data.data.cupsPrinters || []);

          // Auto-select jika ada USB device yang match dengan printer
          if (printer.usbDeviceId && data.data.usbDevices) {
            const matched = data.data.usbDevices.find(
              (d) => d.usbId === printer.usbDeviceId,
            );
            if (matched) setSelectedUsbDevice(matched);
          }

          // Jika printer sudah memiliki cupsPrinterName (dari DB), coba auto-select di daftar CUPS
          if (printer.cupsPrinterName && data.data.cupsPrinters) {
            const matchedCup = data.data.cupsPrinters.find((c) =>
              (c.cupsName || c.name || "")
                .toLowerCase()
                .includes((printer.cupsPrinterName || "").toLowerCase()),
            );
            if (matchedCup) setSelectedCupsPrinter(matchedCup);
          }

          console.log(
            "USB devices / CUPS printers found:",
            data.data.usbDevices,
            data.data.cupsPrinters,
          );
          return;
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }
    setError("Timeout waiting for USB scan result");
  };

  const handleSync = async () => {
    // Prefer selected CUPS printer; fall back to selected USB device
    if (!selectedCupsPrinter && !selectedUsbDevice) {
      setError("Pilih printer CUPS atau USB terlebih dahulu");
      return;
    }

    setSyncing(true);
    setError(null);

    try {
      // Update printer dengan USB device info
      const response = await fetch(
        `/api/hub/admin/printers/${printer.printerId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            usbDeviceId: selectedUsbDevice?.usbId || printer.usbDeviceId,
            cupsPrinterName:
              selectedCupsPrinter?.cupsName ||
              selectedCupsPrinter?.name ||
              selectedUsbDevice?.description ||
              printer.cupsPrinterName,
            connectionType: "usb",
            printerStatus: "active",
            lastSyncAt: new Date().toISOString(),
          }),
        },
      );

      const result = await response.json();

      if (result.success) {
        const syncData = {
          usbDeviceId: selectedUsbDevice?.usbId || printer.usbDeviceId,
          cupsPrinterName:
            selectedCupsPrinter?.cupsName ||
            selectedCupsPrinter?.name ||
            selectedUsbDevice?.description ||
            printer.cupsPrinterName,
        };

        setSyncResult({
          success: true,
          message: "Printer berhasil disinkronisasi!",
          data: syncData,
        });

        // Close modal after 2 seconds
        setTimeout(() => {
          onClose();
          window.location.reload(); // Refresh untuk update data
        }, 2000);
      } else {
        setError(result.error || "Gagal menyinkronisasi printer");
      }
    } catch (error) {
      console.error("Sync error:", error);
      setError(error.message);
    } finally {
      setSyncing(false);
    }
  };

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
        <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full mx-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                🔄 Sinkronisasi Printer
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Printer Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                📋 Informasi Printer
              </h3>
              <div className="space-y-1">
                <p className="text-sm">
                  <span className="text-gray-500">Nama:</span>{" "}
                  <span className="font-medium">{printer?.printerName || printer?.name}</span>
                </p>
                <p className="text-sm">
                  <span className="text-gray-500">ID:</span>{" "}
                  <code className="text-xs bg-gray-200 px-1 rounded">
                    {printer?.printerId}
                  </code>
                </p>
                <p className="text-sm">
                  <span className="text-gray-500">Raspberry Pi:</span>{" "}
                  <span className="font-mono text-xs bg-purple-100 px-2 py-0.5 rounded">
                    {printer?.raspberryId || "Not assigned"}
                  </span>
                </p>
                {printer?.usbDeviceId && (
                  <p className="text-sm">
                    <span className="text-gray-500">USB ID Saat Ini:</span>{" "}
                    <code className="text-xs bg-gray-200 px-1 rounded">
                      {printer?.usbDeviceId}
                    </code>
                  </p>
                )}
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-500">
                  Memindai USB devices di Raspberry Pi...
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Ini mungkin memakan waktu beberapa detik
                </p>
              </div>
            )}

            {/* CUPS Printers List (preferred) */}
            {!loading && cupsPrinters.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  🖨️ Printers in CUPS (di Raspberry Pi)
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {cupsPrinters.map((c, index) => (
                    <label
                      key={index}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                        (selectedCupsPrinter?.cupsName ||
                          selectedCupsPrinter?.name) === (c.cupsName || c.name)
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="cupsPrinter"
                        checked={
                          (selectedCupsPrinter?.cupsName ||
                            selectedCupsPrinter?.name) ===
                          (c.cupsName || c.name)
                        }
                        onChange={() => setSelectedCupsPrinter(c)}
                        className="w-4 h-4 text-purple-600"
                      />
                      <div className="ml-3 flex-1">
                        <div className="font-medium text-gray-900">
                          {c.cupsName || c.name}
                        </div>
                        <div className="text-xs text-gray-500 font-mono mt-1">
                          Accepting: {c.accepting ? "yes" : "no"}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Fallback: USB Devices List */}
            {!loading && cupsPrinters.length === 0 && usbDevices.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  🔌 USB Devices Terdeteksi
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {usbDevices.map((device, index) => (
                    <label
                      key={index}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                        selectedUsbDevice?.usbId === device.usbId
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="usbDevice"
                        checked={selectedUsbDevice?.usbId === device.usbId}
                        onChange={() => setSelectedUsbDevice(device)}
                        className="w-4 h-4 text-purple-600"
                      />
                      <div className="ml-3 flex-1">
                        <div className="font-medium text-gray-900">
                          {device.description}
                        </div>
                        <div className="text-xs text-gray-500 font-mono mt-1">
                          USB ID: {device.usbId} | Vendor: {device.vendorId} |
                          Product: {device.productId}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Terdeteksi:{" "}
                          {new Date(device.detectedAt).toLocaleString()}
                        </div>
                      </div>
                      {printer?.usbDeviceId === device.usbId && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          Current
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* No USB Devices */}
            {!loading && usbDevices.length === 0 && !error && (
              <div className="text-center py-8 bg-yellow-50 rounded-lg mb-6">
                <svg
                  className="w-12 h-12 text-yellow-500 mx-auto mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <p className="text-gray-700">
                  Tidak ada printer USB terdeteksi
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Pastikan printer terhubung ke Raspberry Pi dan driver sudah
                  terinstall
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Sync Result */}
            {syncResult && (
              <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-600 text-sm">{syncResult.message}</p>
                {syncResult.data && (
                  <div className="mt-2 text-xs text-green-500">
                    <p>USB ID: {syncResult.data.usbDeviceId}</p>
                    <p>CUPS Printer Name: {syncResult.data.cupsPrinterName}</p>
                  </div>
                )}
              </div>
            )}

            {/* Required Info Summary */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-blue-800 mb-2">
                📦 Data yang Akan Disinkronisasi
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">USB Device ID:</span>
                  <span className="font-mono text-blue-900">
                    {selectedUsbDevice?.usbId || "Belum dipilih"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Printer Name (CUPS):</span>
                  <span className="text-blue-900">
                    {selectedCupsPrinter?.cupsName ||
                      selectedCupsPrinter?.name ||
                      (selectedUsbDevice?.description || "")?.split(" ")[0] ||
                      printer?.cupsPrinterName ||
                      "Belum dipilih"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Connection Type:</span>
                  <span className="text-blue-900">USB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Printer Status:</span>
                  <span className="text-blue-900">Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleSync}
              disabled={!(selectedCupsPrinter || selectedUsbDevice) || syncing}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {syncing && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {syncing ? "Menyinkronkan..." : "Sinkronisasi Sekarang"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
