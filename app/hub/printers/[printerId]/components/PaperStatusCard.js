"use client";

// PaperStatusCard - UPDATED with paper mode support
export const PaperStatusCard = ({
  paperCount,
  lastRefill,
  onRefill,
  loading,
  showSuccess,
  formatDate,
  paperMode = "limited", // ✅ Tambah: "limited" atau "unlimited"
  paperPackSizes = [20, 40, 80, 100], // ✅ Tambah: pilihan jumlah kertas
  onRefillWithAmount, // ✅ Tambah: fungsi dengan parameter amount
}) => {
  const MAX_PAPER = 100;
  const [selectedAmount, setSelectedAmount] = useState(80);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mode UNLIMITED
  if (paperMode === "unlimited") {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-purple-100">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Sisa Kertas</p>
              <p className="text-3xl font-bold text-purple-600">UNLIMITED</p>
              <p className="text-xs text-gray-400 mt-2">
                Terakhir diisi: {formatDate(lastRefill)}
              </p>
            </div>
          </div>

          {/* Tombol Isi Ulang - Disabled untuk unlimited mode */}
          <button
            disabled={true}
            className="px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 min-w-[200px] bg-gray-200 text-gray-400 cursor-not-allowed"
            title="Mode unlimited, tidak perlu isi kertas"
          >
            <svg
              className="w-5 h-5"
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
            <span>Isi Ulang Kertas (Tidak Tersedia)</span>
          </button>
        </div>
      </div>
    );
  }

  // Mode LIMITED
  const remainingToMax = MAX_PAPER - paperCount;

  // Filter pack sizes yang muat (tidak melebihi MAX_PAPER)
  const availablePackSizes = paperPackSizes.filter(
    (size) => size <= remainingToMax,
  );

  const handleRefillClick = () => {
    if (paperMode === "unlimited") return;
    setShowDropdown(!showDropdown);
  };

  const handleSelectAmount = (amount) => {
    setSelectedAmount(amount);
    setShowDropdown(false);
    if (onRefill) {
      onRefill(amount);
    }
  };

  const isNearMax = paperCount > MAX_PAPER - Math.min(...paperPackSizes);
  const canRefill = !isNearMax && availablePackSizes.length > 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isNearMax ? "bg-yellow-100" : "bg-green-100"
            }`}
          >
            <svg
              className={`w-6 h-6 ${
                isNearMax ? "text-yellow-600" : "text-green-600"
              }`}
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
          </div>
          <div>
            <p className="text-sm text-gray-500">Sisa Kertas</p>
            <p className="text-3xl font-bold text-gray-800">
              {paperCount} / {MAX_PAPER}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    isNearMax ? "bg-yellow-500" : "bg-green-500"
                  }`}
                  style={{ width: `${(paperCount / MAX_PAPER) * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">
                {Math.round((paperCount / MAX_PAPER) * 100)}%
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Terakhir diisi: {formatDate(lastRefill)}
            </p>
          </div>
        </div>

        <div
          className="flex flex-col sm:items-end gap-2 relative"
          ref={dropdownRef}
        >
          {/* Tombol Isi Ulang dengan Dropdown */}
          <div className="relative">
            <button
              onClick={handleRefillClick}
              disabled={loading || !canRefill}
              className={`px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 min-w-[200px] transition-all ${
                canRefill
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              title={
                !canRefill
                  ? isNearMax
                    ? "Kapasitas hampir penuh"
                    : "Tidak ada paket kertas yang muat"
                  : "Pilih jumlah kertas yang akan diisi"
              }
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
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
                  <span>Isi Ulang Kertas</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${showDropdown ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </>
              )}
            </button>

            {/* Dropdown Pilihan Jumlah Kertas */}
            {showDropdown && canRefill && !loading && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="py-2">
                  <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-100">
                    Pilih jumlah kertas:
                  </div>
                  {availablePackSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => handleSelectAmount(size)}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 transition-colors flex justify-between items-center"
                    >
                      <span>{size} lembar</span>
                      <span className="text-xs text-gray-400">
                        sisa: {remainingToMax - size}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Info sisa kapasitas */}
          {canRefill && !showDropdown && (
            <p className="text-xs text-gray-500 text-center sm:text-right">
              Sisa kapasitas: {remainingToMax} lembar
            </p>
          )}

          {/* Success message */}
          {showSuccess && (
            <div className="text-sm text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
              ✅ Kertas berhasil ditambahkan!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Import useEffect, useState, useRef di awal file jika belum ada
import { useState, useEffect, useRef } from "react";
