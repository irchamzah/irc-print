"use client";
import { useState, useEffect } from "react";

export const SettingsForm = ({ settings, onSubmit, saving }) => {
  const [formData, setFormData] = useState({
    globalDefaults: {
      defaultPaperSizes: ["A4", "F4"],
      defaultColorModes: ["color", "monochrome"],
      defaultQualities: ["normal", "high"],
    },
    paperConfig: {
      defaultMode: "limited",
      defaultPackSizes: [20, 40, 80, 100],
    },
    videoGuides: {
      A4_to_F4: "",
      F4_to_A4: "",
      default: "",
    },
    withdrawalConfig: {
      minWithdrawalAmount: 100000,
    },
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        globalDefaults: settings.globalDefaults || {
          defaultPaperSizes: ["A4", "F4"],
          defaultColorModes: ["color", "monochrome"],
          defaultQualities: ["normal", "high"],
        },
        paperConfig: settings.paperConfig || {
          defaultMode: "limited",
          defaultPackSizes: [20, 40, 80, 100],
        },
        videoGuides: settings.videoGuides || {
          A4_to_F4: "",
          F4_to_A4: "",
          default: "",
        },
        withdrawalConfig: settings.withdrawalConfig || {
          minWithdrawalAmount: 100000,
        },
      });
    }
  }, [settings]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const toggleDefaultPaperSize = (size) => {
    const current = [...formData.globalDefaults.defaultPaperSizes];
    if (current.includes(size)) {
      setFormData({
        ...formData,
        globalDefaults: {
          ...formData.globalDefaults,
          defaultPaperSizes: current.filter((s) => s !== size),
        },
      });
    } else {
      setFormData({
        ...formData,
        globalDefaults: {
          ...formData.globalDefaults,
          defaultPaperSizes: [...current, size],
        },
      });
    }
  };

  const toggleDefaultColorMode = (mode) => {
    const current = [...formData.globalDefaults.defaultColorModes];
    if (current.includes(mode)) {
      setFormData({
        ...formData,
        globalDefaults: {
          ...formData.globalDefaults,
          defaultColorModes: current.filter((m) => m !== mode),
        },
      });
    } else {
      setFormData({
        ...formData,
        globalDefaults: {
          ...formData.globalDefaults,
          defaultColorModes: [...current, mode],
        },
      });
    }
  };

  const toggleDefaultQuality = (quality) => {
    const current = [...formData.globalDefaults.defaultQualities];
    if (current.includes(quality)) {
      setFormData({
        ...formData,
        globalDefaults: {
          ...formData.globalDefaults,
          defaultQualities: current.filter((q) => q !== quality),
        },
      });
    } else {
      setFormData({
        ...formData,
        globalDefaults: {
          ...formData.globalDefaults,
          defaultQualities: [...current, quality],
        },
      });
    }
  };

  const updatePackSize = (index, value) => {
    const newPackSizes = [...formData.paperConfig.defaultPackSizes];
    newPackSizes[index] = parseInt(value) || 0;
    setFormData({
      ...formData,
      paperConfig: {
        ...formData.paperConfig,
        defaultPackSizes: newPackSizes,
      },
    });
  };

  const addPackSize = () => {
    setFormData({
      ...formData,
      paperConfig: {
        ...formData.paperConfig,
        defaultPackSizes: [...formData.paperConfig.defaultPackSizes, 50],
      },
    });
  };

  const removePackSize = (index) => {
    const newPackSizes = formData.paperConfig.defaultPackSizes.filter(
      (_, i) => i !== index,
    );
    setFormData({
      ...formData,
      paperConfig: {
        ...formData.paperConfig,
        defaultPackSizes: newPackSizes,
      },
    });
  };

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
  const ALL_COLOR_MODES = ["color", "monochrome"];
  const ALL_QUALITIES = ["draft", "normal", "high"];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Global Defaults Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Pengaturan Global Default
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Pengaturan default untuk printer baru
          </p>
        </div>

        <div className="p-4 space-y-4">
          {/* Default Paper Sizes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📄 Default Ukuran Kertas
            </label>
            <div className="flex flex-wrap gap-3">
              {ALL_PAPER_SIZES.map((size) => (
                <label key={size} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={formData.globalDefaults.defaultPaperSizes.includes(
                      size,
                    )}
                    onChange={() => toggleDefaultPaperSize(size)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">{size}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Default Color Modes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🎨 Default Mode Warna
            </label>
            <div className="flex gap-4">
              {ALL_COLOR_MODES.map((mode) => (
                <label key={mode} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={formData.globalDefaults.defaultColorModes.includes(
                      mode,
                    )}
                    onChange={() => toggleDefaultColorMode(mode)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm capitalize">{mode}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Default Qualities */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ⚡ Default Kualitas Print
            </label>
            <div className="flex gap-4">
              {ALL_QUALITIES.map((quality) => (
                <label key={quality} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={formData.globalDefaults.defaultQualities.includes(
                      quality,
                    )}
                    onChange={() => toggleDefaultQuality(quality)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm capitalize">{quality}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Paper Config Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-teal-50">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-green-600"
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
            Konfigurasi Kertas
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Pengaturan default untuk manajemen kertas
          </p>
        </div>

        <div className="p-4 space-y-4">
          {/* Default Paper Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📋 Default Mode Kertas
            </label>
            <select
              value={formData.paperConfig.defaultMode}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  paperConfig: {
                    ...formData.paperConfig,
                    defaultMode: e.target.value,
                  },
                })
              }
              className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="limited">Limited (Perlu Isi Kertas)</option>
              <option value="unlimited">
                Unlimited (Tidak Perlu Isi Kertas)
              </option>
            </select>
          </div>

          {/* Default Pack Sizes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📦 Default Paket Isi Kertas (lembar)
            </label>
            <div className="flex flex-wrap gap-2 items-center">
              {formData.paperConfig.defaultPackSizes.map((size, index) => (
                <div key={index} className="flex items-center gap-1">
                  <input
                    type="number"
                    value={size}
                    onChange={(e) => updatePackSize(index, e.target.value)}
                    className="w-20 px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-center"
                    min="1"
                  />
                  <button
                    type="button"
                    onClick={() => removePackSize(index)}
                    className="text-red-500 hover:text-red-700"
                    disabled={formData.paperConfig.defaultPackSizes.length <= 1}
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addPackSize}
                className="px-3 py-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 text-sm"
              >
                + Tambah
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Pilihan jumlah kertas yang tersedia saat isi ulang
            </p>
          </div>
        </div>
      </div>

      {/* Video Guides Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            Video Panduan
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            URL video panduan untuk mengganti kertas
          </p>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              A4 → F4
            </label>
            <input
              value={formData.videoGuides.A4_to_F4}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  videoGuides: {
                    ...formData.videoGuides,
                    A4_to_F4: e.target.value,
                  },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="https://youtu.be/..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              F4 → A4
            </label>
            <input
              value={formData.videoGuides.F4_to_A4}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  videoGuides: {
                    ...formData.videoGuides,
                    F4_to_A4: e.target.value,
                  },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="https://youtu.be/..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Default (Umum)
            </label>
            <input
              value={formData.videoGuides.default}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  videoGuides: {
                    ...formData.videoGuides,
                    default: e.target.value,
                  },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="https://youtu.be/..."
            />
          </div>
        </div>
      </div>

      {/* Withdrawal Config Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-yellow-50">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Konfigurasi Penarikan (Withdrawal)
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Pengaturan batas minimum permintaan penarikan profit partner
          </p>
        </div>

        <div className="p-4">
          <div className="max-w-xs">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              💰 Minimum Withdrawal (Rp)
            </label>
            <input
              type="number"
              value={formData.withdrawalConfig.minWithdrawalAmount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  withdrawalConfig: {
                    ...formData.withdrawalConfig,
                    minWithdrawalAmount: parseInt(e.target.value) || 0,
                  },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              min="0"
              step="1000"
            />
            <p className="text-xs text-gray-400 mt-1">
              Partner tidak dapat mengajukan withdrawal di bawah jumlah ini
            </p>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {saving ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Menyimpan...</span>
            </div>
          ) : (
            "Simpan Pengaturan"
          )}
        </button>
      </div>
    </form>
  );
};
