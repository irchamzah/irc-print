import { useEffect, useState } from "react";

export const FilterSection = ({
  filters,
  onApply,
  onReset,
  options,
  isLoading,
}) => {
  const [local, setLocal] = useState(filters);

  useEffect(() => {
    setLocal(filters);
  }, [filters]);

  const statusOptions = [
    { value: "", label: "Semua Status" },
    { value: "active", label: "Aktif" },
    { value: "completed", label: "Selesai" },
    { value: "paid", label: "Dibayar" },
  ];

  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mb-6 border border-purple-200">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-semibold text-purple-800 flex items-center gap-2">
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
          Filter Refill
        </h4>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1"
        >
          {showAdvanced ? "Sembunyikan" : "Tampilkan"} Filter Lanjutan
          <svg
            className={`w-3 h-3 transform transition-transform ${showAdvanced ? "rotate-180" : ""}`}
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
        </button>
      </div>

      {/* Basic Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status */}
        <div>
          <label className="block text-xs text-gray-600 mb-1 font-medium">
            Status
          </label>
          <select
            value={local.status}
            onChange={(e) => setLocal({ ...local, status: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Printer */}
        <div>
          <label className="block text-xs text-gray-600 mb-1 font-medium">
            Printer
          </label>
          <select
            value={local.printerId}
            onChange={(e) => setLocal({ ...local, printerId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">Semua Printer</option>
            {options.printers?.map((printer) => (
              <option key={printer} value={printer}>
                {printer}
              </option>
            ))}
          </select>
        </div>

        {/* Partner */}
        <div>
          <label className="block text-xs text-gray-600 mb-1 font-medium">
            Partner
          </label>
          <select
            value={local.partnerName}
            onChange={(e) =>
              setLocal({ ...local, partnerName: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">Semua Partner</option>
            {options.partners?.map((partner) => (
              <option key={partner} value={partner}>
                {partner}
              </option>
            ))}
          </select>
        </div>

        {/* Refill Date */}
        <div>
          <label className="block text-xs text-gray-600 mb-1 font-medium">
            Tanggal Refill
          </label>
          <div className="flex gap-2">
            <input
              type="date"
              value={local.startDate}
              onChange={(e) =>
                setLocal({ ...local, startDate: e.target.value })
              }
              className="w-1/2 px-2 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Dari"
            />
            <input
              type="date"
              value={local.endDate}
              onChange={(e) => setLocal({ ...local, endDate: e.target.value })}
              className="w-1/2 px-2 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Sampai"
            />
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-purple-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Completed Date */}
            <div>
              <label className="block text-xs text-gray-600 mb-1 font-medium">
                Tanggal Selesai
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={local.startCompletedDate}
                  onChange={(e) =>
                    setLocal({ ...local, startCompletedDate: e.target.value })
                  }
                  className="w-1/2 px-2 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="Dari"
                />
                <input
                  type="date"
                  value={local.endCompletedDate}
                  onChange={(e) =>
                    setLocal({ ...local, endCompletedDate: e.target.value })
                  }
                  className="w-1/2 px-2 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="Sampai"
                />
              </div>
            </div>

            {/* Paid Date */}
            <div>
              <label className="block text-xs text-gray-600 mb-1 font-medium">
                Tanggal Dibayar
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={local.startPaidDate}
                  onChange={(e) =>
                    setLocal({ ...local, startPaidDate: e.target.value })
                  }
                  className="w-1/2 px-2 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="Dari"
                />
                <input
                  type="date"
                  value={local.endPaidDate}
                  onChange={(e) =>
                    setLocal({ ...local, endPaidDate: e.target.value })
                  }
                  className="w-1/2 px-2 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="Sampai"
                />
              </div>
            </div>

            {/* Profit Range */}
            <div>
              <label className="block text-xs text-gray-600 mb-1 font-medium">
                Profit Partner (Rp)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={local.minProfit}
                  onChange={(e) =>
                    setLocal({ ...local, minProfit: e.target.value })
                  }
                  className="w-1/2 px-2 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="Min"
                />
                <input
                  type="number"
                  value={local.maxProfit}
                  onChange={(e) =>
                    setLocal({ ...local, maxProfit: e.target.value })
                  }
                  className="w-1/2 px-2 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="Max"
                />
              </div>
            </div>

            {/* Sheets Range */}
            <div>
              <label className="block text-xs text-gray-600 mb-1 font-medium">
                Jumlah Kertas
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={local.minSheets}
                  onChange={(e) =>
                    setLocal({ ...local, minSheets: e.target.value })
                  }
                  className="w-1/2 px-2 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="Min"
                />
                <input
                  type="number"
                  value={local.maxSheets}
                  onChange={(e) =>
                    setLocal({ ...local, maxSheets: e.target.value })
                  }
                  className="w-1/2 px-2 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="Max"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={() => onReset()}
          disabled={isLoading}
          className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm transition-colors"
        >
          Reset Filter
        </button>
        <button
          onClick={() => onApply(local)}
          disabled={isLoading}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm transition-colors disabled:opacity-50"
        >
          {isLoading ? "Memproses..." : "Terapkan Filter"}
        </button>
      </div>
    </div>
  );
};
