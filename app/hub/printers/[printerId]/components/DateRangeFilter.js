"use client";
import { useState, useEffect } from "react";

// 🥸DateRangeFilter /app/hub/printers/[printerId]/components/DateRangeFilter.js TERPAKAI
export const DateRangeFilter = ({
  dateRange,
  onApplyFilter,
  onResetFilter,
  formatDate,
}) => {
  const [startDate, setStartDate] = useState(dateRange.startDate || "");
  const [endDate, setEndDate] = useState(dateRange.endDate || "");
  const [showCustom, setShowCustom] = useState(
    dateRange.filterType === "custom",
  );

  useEffect(() => {
    setStartDate(dateRange.startDate || "");
    setEndDate(dateRange.endDate || "");
    setShowCustom(dateRange.filterType === "custom");
  }, [dateRange]);

  const handleApplyCustom = () => {
    if (startDate && endDate) {
      onApplyFilter(startDate, endDate);
    } else {
      alert("Pilih tanggal awal dan akhir terlebih dahulu");
    }
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setShowCustom(false);
    onResetFilter();
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="font-medium text-gray-700">Filter Periode:</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setShowCustom(false);
              // Set ke minggu ini
              const today = new Date();
              const weekAgo = new Date(today);
              weekAgo.setDate(today.getDate() - 7);
              onApplyFilter(
                weekAgo.toISOString().split("T")[0],
                today.toISOString().split("T")[0],
                "week",
              );
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              dateRange.filterType === "week"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Minggu Ini
          </button>

          <button
            onClick={() => {
              setShowCustom(false);
              // Set ke bulan ini
              const today = new Date();
              const monthAgo = new Date(today);
              monthAgo.setMonth(today.getMonth() - 1);
              onApplyFilter(
                monthAgo.toISOString().split("T")[0],
                today.toISOString().split("T")[0],
                "month",
              );
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              dateRange.filterType === "month"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Bulan Ini
          </button>

          <button
            onClick={() => setShowCustom(!showCustom)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              showCustom
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <div className="flex items-center gap-1">
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
                  d="M11 17l-5-5m0 0l5-5m-5 5h12"
                />
              </svg>
              <span>Custom Range</span>
            </div>
          </button>

          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
          >
            <div className="flex items-center gap-1">
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
              <span>Semua</span>
            </div>
          </button>
        </div>
      </div>

      {/* Custom Date Range Input */}
      {showCustom && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-end gap-4">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">
                Tanggal Awal
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">
                Tanggal Akhir
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={handleApplyCustom}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              Terapkan
            </button>
          </div>
        </div>
      )}

      {/* Info filter aktif */}
      {dateRange.filterType === "custom" &&
        dateRange.startDate &&
        dateRange.endDate && (
          <div className="mt-3 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <span>
                📅 Menampilkan data dari {formatDate(dateRange.startDate)} s/d{" "}
                {formatDate(dateRange.endDate)}
              </span>
              <button
                onClick={handleReset}
                className="text-blue-700 hover:text-blue-800"
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
          </div>
        )}
    </div>
  );
};
