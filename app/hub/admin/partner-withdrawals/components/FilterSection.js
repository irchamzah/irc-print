"use client";
import { useEffect, useState } from "react";

export const FilterSection = ({ filters, onApply, onReset, isLoading }) => {
  const [local, setLocal] = useState(filters);

  useEffect(() => {
    setLocal(filters);
  }, [filters]);

  const statusOptions = [
    { value: "", label: "Semua Status" },
    { value: "requested", label: "Diminta" },
    { value: "processed", label: "Diproses" },
    { value: "transferred", label: "Ditransfer" },
  ];

  const handleApply = () => {
    onApply(local);
  };

  const handleReset = () => {
    onReset();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleApply();
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mb-6 border border-purple-200">
      <h4 className="text-sm font-semibold text-purple-800 mb-3 flex items-center gap-2">
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
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
        Filter Penarikan
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status */}
        <div>
          <label className="block text-xs text-gray-600 mb-1 font-medium">
            Status
          </label>
          <select
            value={local.status || ""}
            onChange={(e) => setLocal({ ...local, status: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Partner ID */}
        <div>
          <label className="block text-xs text-gray-600 mb-1 font-medium">
            Partner ID
          </label>
          <input
            type="text"
            value={local.partnerId || ""}
            onChange={(e) => setLocal({ ...local, partnerId: e.target.value })}
            onKeyPress={handleKeyPress}
            placeholder="user-xxx"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-xs text-gray-600 mb-1 font-medium">
            Dari Tanggal
          </label>
          <input
            type="date"
            value={local.startDate || ""}
            onChange={(e) => setLocal({ ...local, startDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-xs text-gray-600 mb-1 font-medium">
            Sampai Tanggal
          </label>
          <input
            type="date"
            value={local.endDate || ""}
            onChange={(e) => setLocal({ ...local, endDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={handleReset}
          disabled={isLoading}
          className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm transition-colors"
        >
          Reset Filter
        </button>
        <button
          onClick={handleApply}
          disabled={isLoading}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm transition-colors disabled:opacity-50"
        >
          {isLoading ? "Memproses..." : "Terapkan Filter"}
        </button>
      </div>
    </div>
  );
};
