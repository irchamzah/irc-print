"use client";
import { useState, useEffect } from "react";

export const PrinterModelFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  model,
  error,
  processing,
}) => {
  const ALL_PAPER_SIZES = [
    "A4",
    "F4",
    "Letter",
    "Legal",
    "A5",
    "B5",
    "4x6",
    "5x7",
    "8x10",
    "10x15",
    "A3",
  ];
  const ALL_QUALITIES = ["draft", "normal", "high"];
  const ALL_COLOR_MODES = ["color", "monochrome"];

  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    displayName: "",
    capabilities: {
      paperSizes: {
        allSupported: ALL_PAPER_SIZES,
        defaultEnabled: ["A4", "F4"],
      },
      colorModes: {
        allSupported: ALL_COLOR_MODES,
        defaultEnabled: ["color", "monochrome"],
      },
      qualities: {
        allSupported: ALL_QUALITIES,
        defaultEnabled: ["normal", "high"],
      },
      duplex: {
        supported: false,
        types: ["automatic", "manual"],
        defaultType: null,
      },
      borderless: {
        supported: false,
        allSupportedSizes: ["A4", "4x6", "5x7", "10x15"],
        defaultEnabledSizes: [],
      },
      maxCopies: 99,
      inputTrayCapacity: 100,
    },
    videoGuideUrl: "https://youtu.be/default",
    isActive: true,
  });

  useEffect(() => {
    if (model) {
      setFormData({
        brand: model.brand || "",
        model: model.model || "",
        displayName: model.displayName || "",
        capabilities: model.capabilities || {
          paperSizes: {
            allSupported: ALL_PAPER_SIZES,
            defaultEnabled: ["A4", "F4"],
          },
          colorModes: {
            allSupported: ALL_COLOR_MODES,
            defaultEnabled: ["color", "monochrome"],
          },
          qualities: {
            allSupported: ALL_QUALITIES,
            defaultEnabled: ["normal", "high"],
          },
          duplex: {
            supported: false,
            types: ["automatic", "manual"],
            defaultType: null,
          },
          borderless: {
            supported: false,
            allSupportedSizes: ["A4", "4x6", "5x7", "10x15"],
            defaultEnabledSizes: [],
          },
          maxCopies: 99,
          inputTrayCapacity: 100,
        },
        videoGuideUrl: model.videoGuideUrl || "https://youtu.be/default",
        isActive: model.isActive !== undefined ? model.isActive : true,
      });
    } else {
      setFormData({
        brand: "",
        model: "",
        displayName: "",
        capabilities: {
          paperSizes: {
            allSupported: ALL_PAPER_SIZES,
            defaultEnabled: ["A4", "F4"],
          },
          colorModes: {
            allSupported: ALL_COLOR_MODES,
            defaultEnabled: ["color", "monochrome"],
          },
          qualities: {
            allSupported: ALL_QUALITIES,
            defaultEnabled: ["normal", "high"],
          },
          duplex: {
            supported: false,
            types: ["automatic", "manual"],
            defaultType: null,
          },
          borderless: {
            supported: false,
            allSupportedSizes: ["A4", "4x6", "5x7", "10x15"],
            defaultEnabledSizes: [],
          },
          maxCopies: 99,
          inputTrayCapacity: 100,
        },
        videoGuideUrl: "https://youtu.be/default",
        isActive: true,
      });
    }
  }, [model]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const toggleDefaultPaperSize = (size) => {
    const current = [...formData.capabilities.paperSizes.defaultEnabled];
    if (current.includes(size)) {
      setFormData({
        ...formData,
        capabilities: {
          ...formData.capabilities,
          paperSizes: {
            ...formData.capabilities.paperSizes,
            defaultEnabled: current.filter((s) => s !== size),
          },
        },
      });
    } else {
      setFormData({
        ...formData,
        capabilities: {
          ...formData.capabilities,
          paperSizes: {
            ...formData.capabilities.paperSizes,
            defaultEnabled: [...current, size],
          },
        },
      });
    }
  };

  const toggleDefaultQuality = (quality) => {
    const current = [...formData.capabilities.qualities.defaultEnabled];
    if (current.includes(quality)) {
      setFormData({
        ...formData,
        capabilities: {
          ...formData.capabilities,
          qualities: {
            ...formData.capabilities.qualities,
            defaultEnabled: current.filter((q) => q !== quality),
          },
        },
      });
    } else {
      setFormData({
        ...formData,
        capabilities: {
          ...formData.capabilities,
          qualities: {
            ...formData.capabilities.qualities,
            defaultEnabled: [...current, quality],
          },
        },
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">
            {model ? "Edit Model Printer" : "Tambah Model Printer Baru"}
          </h3>
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

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-4 sm:p-6 overflow-y-auto max-h-[65vh]"
        >
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) =>
                    setFormData({ ...formData, brand: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                  placeholder="Canon"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Model <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) =>
                    setFormData({ ...formData, model: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                  placeholder="PIXMA G1010 series"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) =>
                  setFormData({ ...formData, displayName: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                required
                placeholder="Canon G1010"
              />
            </div>

            {/* Paper Sizes */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">
                📄 Ukuran Kertas (Default Enabled)
              </h4>
              <div className="flex flex-wrap gap-2">
                {ALL_PAPER_SIZES.map((size) => (
                  <label key={size} className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={formData.capabilities.paperSizes.defaultEnabled.includes(
                        size,
                      )}
                      onChange={() => toggleDefaultPaperSize(size)}
                      className="rounded text-purple-600"
                    />
                    <span className="text-sm">{size}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Centang ukuran yang ingin diaktifkan secara default untuk
                printer dengan model ini
              </p>
            </div>

            {/* Qualities */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">
                🎨 Kualitas Print (Default Enabled)
              </h4>
              <div className="flex gap-4">
                {ALL_QUALITIES.map((quality) => (
                  <label key={quality} className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={formData.capabilities.qualities.defaultEnabled.includes(
                        quality,
                      )}
                      onChange={() => toggleDefaultQuality(quality)}
                      className="rounded text-purple-600"
                    />
                    <span className="text-sm capitalize">{quality}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Duplex */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">🔄 Duplex</h4>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.capabilities.duplex.supported}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        capabilities: {
                          ...formData.capabilities,
                          duplex: {
                            ...formData.capabilities.duplex,
                            supported: e.target.checked,
                          },
                        },
                      })
                    }
                    className="rounded text-purple-600"
                  />
                  <span className="text-sm">Support Duplex</span>
                </label>
                {formData.capabilities.duplex.supported && (
                  <div>
                    <label className="text-sm text-gray-700 mr-2">
                      Default Type:
                    </label>
                    <select
                      value={formData.capabilities.duplex.defaultType || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          capabilities: {
                            ...formData.capabilities,
                            duplex: {
                              ...formData.capabilities.duplex,
                              defaultType: e.target.value || null,
                            },
                          },
                        })
                      }
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="">Pilih</option>
                      <option value="manual">Manual</option>
                      <option value="automatic">Otomatis</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Borderless */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">🖼️ Borderless</h4>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.capabilities.borderless.supported}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      capabilities: {
                        ...formData.capabilities,
                        borderless: {
                          ...formData.capabilities.borderless,
                          supported: e.target.checked,
                        },
                      },
                    })
                  }
                  className="rounded text-purple-600"
                />
                <span className="text-sm">Support Cetak Tanpa Batas</span>
              </label>
            </div>

            {/* Max Copies & Input Tray */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Copies
                </label>
                <input
                  type="number"
                  value={formData.capabilities.maxCopies}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      capabilities: {
                        ...formData.capabilities,
                        maxCopies: parseInt(e.target.value) || 1,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Input Tray Capacity
                </label>
                <input
                  type="number"
                  value={formData.capabilities.inputTrayCapacity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      capabilities: {
                        ...formData.capabilities,
                        inputTrayCapacity: parseInt(e.target.value) || 100,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  min="1"
                />
              </div>
            </div>

            {/* Video Guide URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Video Guide URL
              </label>
              <input
                type="url"
                value={formData.videoGuideUrl}
                onChange={(e) =>
                  setFormData({ ...formData, videoGuideUrl: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="https://youtu.be/..."
              />
              <p className="text-xs text-gray-400 mt-1">
                URL video panduan cara mengganti kertas
              </p>
            </div>

            {/* Status */}
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="rounded text-purple-600"
                />
                <span className="text-sm text-gray-700">
                  Aktif (dapat digunakan untuk printer baru)
                </span>
              </label>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={processing}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {processing ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Memproses...</span>
              </div>
            ) : model ? (
              "Update Model"
            ) : (
              "Simpan Model"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
