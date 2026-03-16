"use client";
import { useState, useEffect } from "react";

export const PrinterFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  printer,
  error,
  processing,
}) => {
  const [formData, setFormData] = useState({
    printerId: "",
    name: "",
    model: "",
    location: {
      address: "",
      city: "",
      province: "",
      coordinates: {
        type: "Point",
        coordinates: [0, 0],
      },
      mapsUrl: "",
    },
    capabilities: {
      color: true,
      duplex: false,
      paperSizes: ["A4"],
      maxCopies: 100,
      quality: ["draft", "normal"],
    },
    pricing: {
      color: 1500,
      bw: 500,
      additionalFees: {
        highQuality: 0,
        specialPaper: 0,
        duplex: 0,
      },
      bwTiers: [
        { minSheets: 1, maxSheets: 4, price: 500 },
        { minSheets: 5, maxSheets: 9, price: 400 },
        { minSheets: 10, maxSheets: 14, price: 360 },
        { minSheets: 15, maxSheets: 19, price: 333 },
        { minSheets: 20, maxSheets: null, price: 300 },
      ],
    },
    profitSettings: {
      defaultShare: 20,
      partnerShare: 30,
      paperPackSize: 80,
    },
    pointDivider: printer?.pointDivider ?? "",
    paperStatus: {
      available: true,
      paperCount: 0,
      lastRefill: null,
      estimatedPages: 0,
    },
    operatingHours: {
      open: "00:00",
      close: "24:00",
      timezone: "Asia/Jakarta",
      is24Hours: true,
    },
    contact: {
      phone: "",
      email: "",
    },
    status: "offline",
  });

  // Update formData ketika printer berubah (untuk edit)
  useEffect(() => {
    if (printer) {
      setFormData({
        printerId: printer.printerId || "",
        name: printer.name || "",
        model: printer.model || "",
        location: {
          address: printer.location?.address || "",
          city: printer.location?.city || "",
          province: printer.location?.province || "",
          coordinates: {
            type: "Point",
            coordinates: printer.location?.coordinates?.coordinates || [0, 0],
          },
          mapsUrl: printer.location?.mapsUrl || "",
        },
        capabilities: printer.capabilities || {
          color: true,
          duplex: false,
          paperSizes: ["A4"],
          maxCopies: 100,
          quality: ["draft", "normal"],
        },
        pricing: printer.pricing || {
          color: 1500,
          bw: 500,
          additionalFees: {
            highQuality: 0,
            specialPaper: 0,
            duplex: 0,
          },
          bwTiers: [
            { minSheets: 1, maxSheets: 4, price: 500 },
            { minSheets: 5, maxSheets: 9, price: 400 },
            { minSheets: 10, maxSheets: 14, price: 360 },
            { minSheets: 15, maxSheets: 19, price: 333 },
            { minSheets: 20, maxSheets: null, price: 300 },
          ],
        },
        profitSettings: printer.profitSettings || {
          defaultShare: 20,
          partnerShare: 30,
          paperPackSize: 80,
        },
        pointDivider: printer.pointDivider || "",
        paperStatus: printer.paperStatus || {
          available: true,
          paperCount: 0,
          lastRefill: null,
          estimatedPages: 0,
        },
        operatingHours: printer.operatingHours || {
          open: "00:00",
          close: "24:00",
          timezone: "Asia/Jakarta",
          is24Hours: true,
        },
        contact: printer.contact || {
          phone: "",
          email: "",
        },
        status: printer.status || "offline",
      });
    } else {
      // Reset ke default untuk create new
      setFormData({
        printerId: "",
        name: "",
        model: "",
        location: {
          address: "",
          city: "",
          province: "",
          coordinates: {
            type: "Point",
            coordinates: [0, 0],
          },
          mapsUrl: "",
        },
        capabilities: {
          color: true,
          duplex: false,
          paperSizes: ["A4"],
          maxCopies: 100,
          quality: ["draft", "normal"],
        },
        pricing: {
          color: 1500,
          bw: 500,
          additionalFees: {
            highQuality: 0,
            specialPaper: 0,
            duplex: 0,
          },
          bwTiers: [
            { minSheets: 1, maxSheets: 4, price: 500 },
            { minSheets: 5, maxSheets: 9, price: 400 },
            { minSheets: 10, maxSheets: 14, price: 360 },
            { minSheets: 15, maxSheets: 19, price: 333 },
            { minSheets: 20, maxSheets: null, price: 300 },
          ],
        },
        profitSettings: {
          defaultShare: 20,
          partnerShare: 30,
          paperPackSize: 80,
        },
        pointDivider: "",
        paperStatus: {
          available: true,
          paperCount: 0,
          lastRefill: null,
          estimatedPages: 0,
        },
        operatingHours: {
          open: "00:00",
          close: "24:00",
          timezone: "Asia/Jakarta",
          is24Hours: true,
        },
        contact: {
          phone: "",
          email: "",
        },
        status: "offline",
      });
    }
  }, [printer]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateBwTier = (index, field, value) => {
    const newTiers = [...formData.pricing.bwTiers];
    newTiers[index] = { ...newTiers[index], [field]: value };
    setFormData({
      ...formData,
      pricing: { ...formData.pricing, bwTiers: newTiers },
    });
  };

  const togglePaperSize = (size) => {
    const currentSizes = [...formData.capabilities.paperSizes];
    if (currentSizes.includes(size)) {
      setFormData({
        ...formData,
        capabilities: {
          ...formData.capabilities,
          paperSizes: currentSizes.filter((s) => s !== size),
        },
      });
    } else {
      setFormData({
        ...formData,
        capabilities: {
          ...formData.capabilities,
          paperSizes: [...currentSizes, size],
        },
      });
    }
  };

  const toggleQuality = (quality) => {
    const currentQuality = [...formData.capabilities.quality];
    if (currentQuality.includes(quality)) {
      setFormData({
        ...formData,
        capabilities: {
          ...formData.capabilities,
          quality: currentQuality.filter((q) => q !== quality),
        },
      });
    } else {
      setFormData({
        ...formData,
        capabilities: {
          ...formData.capabilities,
          quality: [...currentQuality, quality],
        },
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">
            {printer ? "Edit Printer" : "Tambah Printer Baru"}
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

        {/* Form dengan tabs */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[70vh]">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Informasi Dasar
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Printer ID
                  </label>
                  <input
                    type="text"
                    value={formData.printerId}
                    onChange={(e) =>
                      setFormData({ ...formData, printerId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    required
                    disabled={!!printer}
                  />
                  {printer && (
                    <p className="text-xs text-gray-500 mt-1">
                      Printer ID tidak dapat diubah
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Printer
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Model
                  </label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) =>
                      setFormData({ ...formData, model: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Canon G1010 series"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Lokasi
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alamat
                  </label>
                  <input
                    type="text"
                    value={formData.location.address}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: {
                          ...formData.location,
                          address: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kota
                  </label>
                  <input
                    type="text"
                    value={formData.location.city}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: {
                          ...formData.location,
                          city: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Provinsi
                  </label>
                  <input
                    type="text"
                    value={formData.location.province}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: {
                          ...formData.location,
                          province: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maps URL
                  </label>
                  <input
                    type="url"
                    value={formData.location.mapsUrl}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: {
                          ...formData.location,
                          mapsUrl: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="https://maps.app.goo.gl/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.location.coordinates.coordinates[1]}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: {
                          ...formData.location,
                          coordinates: {
                            ...formData.location.coordinates,
                            coordinates: [
                              formData.location.coordinates.coordinates[0],
                              parseFloat(e.target.value) || 0,
                            ],
                          },
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.location.coordinates.coordinates[0]}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: {
                          ...formData.location,
                          coordinates: {
                            ...formData.location.coordinates,
                            coordinates: [
                              parseFloat(e.target.value) || 0,
                              formData.location.coordinates.coordinates[1],
                            ],
                          },
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Capabilities */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                  />
                </svg>
                Kemampuan Printer
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.capabilities.color}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          capabilities: {
                            ...formData.capabilities,
                            color: e.target.checked,
                          },
                        })
                      }
                      className="rounded text-purple-600"
                    />
                    <span className="text-sm text-gray-700">Warna</span>
                  </label>
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.capabilities.duplex}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          capabilities: {
                            ...formData.capabilities,
                            duplex: e.target.checked,
                          },
                        })
                      }
                      className="rounded text-purple-600"
                    />
                    <span className="text-sm text-gray-700">
                      Duplex (2 sisi)
                    </span>
                  </label>
                </div>
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
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ukuran Kertas
                </label>
                <div className="flex gap-3">
                  {["A4", "A5", "LETTER", "LEGAL"].map((size) => (
                    <label key={size} className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={formData.capabilities.paperSizes.includes(
                          size,
                        )}
                        onChange={() => togglePaperSize(size)}
                        className="rounded text-purple-600"
                      />
                      <span className="text-sm">{size}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kualitas Print
                </label>
                <div className="flex gap-3">
                  {["draft", "normal", "high"].map((quality) => (
                    <label key={quality} className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={formData.capabilities.quality.includes(
                          quality,
                        )}
                        onChange={() => toggleQuality(quality)}
                        className="rounded text-purple-600"
                      />
                      <span className="text-sm capitalize">{quality}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Harga
              </h4>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Harga Warna (A4)
                  </label>
                  <input
                    type="number"
                    value={formData.pricing.color}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pricing: {
                          ...formData.pricing,
                          color: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Harga BW (A4)
                  </label>
                  <input
                    type="number"
                    value={formData.pricing.bw}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pricing: {
                          ...formData.pricing,
                          bw: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <h5 className="text-sm font-medium text-gray-700 mb-2">
                BW Tiers
              </h5>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {formData.pricing.bwTiers.map((tier, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="number"
                      value={tier.minSheets}
                      onChange={(e) =>
                        updateBwTier(
                          index,
                          "minSheets",
                          parseInt(e.target.value) || 0,
                        )
                      }
                      className="w-16 px-2 py-1 border border-gray-300 rounded-lg text-sm"
                      placeholder="Min"
                    />
                    <span>-</span>
                    <input
                      type="number"
                      value={tier.maxSheets === null ? "" : tier.maxSheets}
                      onChange={(e) =>
                        updateBwTier(
                          index,
                          "maxSheets",
                          e.target.value ? parseInt(e.target.value) : null,
                        )
                      }
                      className="w-16 px-2 py-1 border border-gray-300 rounded-lg text-sm"
                      placeholder="Max"
                    />
                    <span>:</span>
                    <input
                      type="number"
                      value={tier.price}
                      onChange={(e) =>
                        updateBwTier(
                          index,
                          "price",
                          parseInt(e.target.value) || 0,
                        )
                      }
                      className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-sm"
                      placeholder="Price"
                    />
                  </div>
                ))}
              </div>

              <h5 className="text-sm font-medium text-gray-700 mb-2">
                Additional Fees
              </h5>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    High Quality
                  </label>
                  <input
                    type="number"
                    value={formData.pricing.additionalFees.highQuality}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pricing: {
                          ...formData.pricing,
                          additionalFees: {
                            ...formData.pricing.additionalFees,
                            highQuality: parseInt(e.target.value) || 0,
                          },
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Special Paper
                  </label>
                  <input
                    type="number"
                    value={formData.pricing.additionalFees.specialPaper}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pricing: {
                          ...formData.pricing,
                          additionalFees: {
                            ...formData.pricing.additionalFees,
                            specialPaper: parseInt(e.target.value) || 0,
                          },
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Duplex
                  </label>
                  <input
                    type="number"
                    value={formData.pricing.additionalFees.duplex}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pricing: {
                          ...formData.pricing,
                          additionalFees: {
                            ...formData.pricing.additionalFees,
                            duplex: parseInt(e.target.value) || 0,
                          },
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Profit Settings */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
                Profit Settings
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Default Share (%)
                  </label>
                  <input
                    type="number"
                    value={formData.profitSettings.defaultShare}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        profitSettings: {
                          ...formData.profitSettings,
                          defaultShare: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Partner Share (%)
                  </label>
                  <input
                    type="number"
                    value={formData.profitSettings.partnerShare}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        profitSettings: {
                          ...formData.profitSettings,
                          partnerShare: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Paper Pack Size
                  </label>
                  <input
                    type="number"
                    value={formData.profitSettings.paperPackSize}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        profitSettings: {
                          ...formData.profitSettings,
                          paperPackSize: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h5 className="text-sm font-medium text-gray-700 mb-3">
                  🎯 Point Settings
                </h5>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Point Divider (Rp per point)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={formData.pointDivider}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            pointDivider: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        min="100"
                        step="100"
                      />
                      <span className="text-sm text-gray-500">
                        Rp = 1 point
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Contoh: Jika diisi 2000, maka setiap Rp 2.000 = 1 point
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Kontak
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    No. Telepon
                  </label>
                  <input
                    type="text"
                    value={formData.contact.phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contact: { ...formData.contact, phone: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="+6285117038583"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.contact.email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contact: { ...formData.contact, email: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="irccc.store@gmail.com"
                  />
                </div>
              </div>
            </div>

            {/* Paper Status */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-gray-600"
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
                Status Kertas
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={formData.paperStatus.available}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          paperStatus: {
                            ...formData.paperStatus,
                            available: e.target.checked,
                          },
                        })
                      }
                      className="rounded text-purple-600"
                    />
                    <span className="text-sm text-gray-700">
                      Kertas Tersedia
                    </span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jumlah Kertas
                  </label>
                  <input
                    type="number"
                    value={formData.paperStatus.paperCount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        paperStatus: {
                          ...formData.paperStatus,
                          paperCount: parseInt(e.target.value) || 0,
                          estimatedPages: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

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
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Memproses...</span>
              </div>
            ) : printer ? (
              "Update Printer"
            ) : (
              "Tambah Printer"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
