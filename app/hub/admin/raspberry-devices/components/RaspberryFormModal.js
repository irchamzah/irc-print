// /app/hub/admin/raspberry-devices/components/RaspberryFormModal.js
"use client";
import { useState, useEffect } from "react";

export function RaspberryFormModal({
  isOpen,
  onClose,
  onSubmit,
  device,
  error,
  processing,
}) {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    ipAddress: "",
    status: "active",
    version: "1.0.0",
    osVersion: "",
    nodeVersion: "",
    config: {
      pollingInterval: 5000,
      maxConcurrentJobs: 3,
      retryAttempts: 3,
      tempDir: "/home/pi/irc-print-client/temp",
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (device) {
        setFormData({
          name: device.name || "",
          location: device.location || "",
          ipAddress: device.ipAddress || "",
          status: device.status || "active",
          version: device.version || "1.0.0",
          osVersion: device.osVersion || "",
          nodeVersion: device.nodeVersion || "",
          config: device.config || {
            pollingInterval: 5000,
            maxConcurrentJobs: 3,
            retryAttempts: 3,
            tempDir: "/home/pi/irc-print-client/temp",
          },
        });
      } else {
        setFormData({
          name: "",
          location: "",
          ipAddress: "",
          status: "active",
          version: "1.0.0",
          osVersion: "",
          nodeVersion: "",
          config: {
            pollingInterval: 5000,
            maxConcurrentJobs: 3,
            retryAttempts: 3,
            tempDir: "/home/pi/irc-print-client/temp",
          },
        });
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleConfigChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      config: { ...prev.config, [name]: parseInt(value) || value },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
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
        <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full mx-auto transform transition-all duration-300">
          <form onSubmit={handleSubmit}>
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {device
                  ? "Edit Raspberry Device"
                  : "Tambah Raspberry Device Baru"}
              </h2>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Device Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Contoh: Raspberry Pi - Toko Utama"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Contoh: Perum Green Garden, Jember"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    IP Address
                  </label>
                  <input
                    type="text"
                    name="ipAddress"
                    value={formData.ipAddress}
                    onChange={handleChange}
                    placeholder="Contoh: 192.168.1.100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="active">🟢 Active</option>
                    <option value="inactive">🔴 Inactive</option>
                    <option value="maintenance">🟡 Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Version
                  </label>
                  <input
                    type="text"
                    name="version"
                    value={formData.version}
                    onChange={handleChange}
                    placeholder="1.0.0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      OS Version
                    </label>
                    <input
                      type="text"
                      name="osVersion"
                      value={formData.osVersion}
                      onChange={handleChange}
                      placeholder="Raspberry Pi OS 11"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Node Version
                    </label>
                    <input
                      type="text"
                      name="nodeVersion"
                      value={formData.nodeVersion}
                      onChange={handleChange}
                      placeholder="v18.19.0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-md font-semibold text-gray-700 mb-3">
                    ⚙️ Konfigurasi
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Polling Interval (ms)
                      </label>
                      <input
                        type="number"
                        name="pollingInterval"
                        value={formData.config.pollingInterval}
                        onChange={handleConfigChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Max Concurrent Jobs
                      </label>
                      <input
                        type="number"
                        name="maxConcurrentJobs"
                        value={formData.config.maxConcurrentJobs}
                        onChange={handleConfigChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Retry Attempts
                      </label>
                      <input
                        type="number"
                        name="retryAttempts"
                        value={formData.config.retryAttempts}
                        onChange={handleConfigChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Temp Directory
                      </label>
                      <input
                        type="text"
                        name="tempDir"
                        value={formData.config.tempDir}
                        onChange={handleConfigChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
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
                type="submit"
                disabled={processing}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {processing && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {device ? "Update" : "Simpan"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
