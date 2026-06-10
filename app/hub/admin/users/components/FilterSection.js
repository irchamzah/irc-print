import { useEffect, useState } from "react";

// Filter Component - UPDATED dengan role admin
export const FilterSection = ({ filters, onApply, onReset, isLoading }) => {
  const [local, setLocal] = useState(filters);

  useEffect(() => {
    setLocal(filters);
  }, [filters]);

  // ✅ Update roleOptions dengan menambahkan Admin
  const roleOptions = [
    { value: "", label: "Semua Role" },
    { value: "super_admin", label: "Super Admin" },
    { value: "admin", label: "Admin" }, // ✅ Tambah Admin
    { value: "partner", label: "Partner" },
    { value: "customer", label: "Customer" }, // ✅ Ganti "user" → "customer"
  ];

  const hasBankAccountOptions = [
    { value: "", label: "Semua" },
    { value: "true", label: "Memiliki Rekening" },
    { value: "false", label: "Tidak Memiliki Rekening" },
  ];

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
        Filter User
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="col-span-1 sm:col-span-2">
          <label className="block text-xs text-gray-600 mb-1 font-medium">
            Cari
          </label>
          <input
            type="text"
            value={local.search}
            onChange={(e) => setLocal({ ...local, search: e.target.value })}
            placeholder="Cari nama, nomor HP, atau ID..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Role */}
        <div>
          <label className="block text-xs text-gray-600 mb-1 font-medium">
            Role
          </label>
          <select
            value={local.role}
            onChange={(e) => setLocal({ ...local, role: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            {roleOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Has Bank Account */}
        <div>
          <label className="block text-xs text-gray-600 mb-1 font-medium">
            Rekening Bank
          </label>
          <select
            value={local.hasBankAccount}
            onChange={(e) =>
              setLocal({ ...local, hasBankAccount: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            {hasBankAccountOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range - Dari Tanggal */}
        <div>
          <label className="block text-xs text-gray-600 mb-1 font-medium">
            Dari Tanggal
          </label>
          <input
            type="date"
            value={local.startDate}
            onChange={(e) => setLocal({ ...local, startDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>

        {/* Date Range - Sampai Tanggal */}
        <div>
          <label className="block text-xs text-gray-600 mb-1 font-medium">
            Sampai Tanggal
          </label>
          <input
            type="date"
            value={local.endDate}
            onChange={(e) => setLocal({ ...local, endDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>

        {/* Points Range - Minimal */}
        <div>
          <label className="block text-xs text-gray-600 mb-1 font-medium">
            Poin Minimal
          </label>
          <input
            type="number"
            step="0.01"
            value={local.minPoints}
            onChange={(e) => setLocal({ ...local, minPoints: e.target.value })}
            placeholder="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>

        {/* Points Range - Maksimal */}
        <div>
          <label className="block text-xs text-gray-600 mb-1 font-medium">
            Poin Maksimal
          </label>
          <input
            type="number"
            step="0.01"
            value={local.maxPoints}
            onChange={(e) => setLocal({ ...local, maxPoints: e.target.value })}
            placeholder="999999"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>

        {/* Total Spent Range - Minimal */}
        <div>
          <label className="block text-xs text-gray-600 mb-1 font-medium">
            Total Belanja Min
          </label>
          <input
            type="number"
            value={local.minTotalSpent}
            onChange={(e) =>
              setLocal({ ...local, minTotalSpent: e.target.value })
            }
            placeholder="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>

        {/* Total Spent Range - Maksimal */}
        <div>
          <label className="block text-xs text-gray-600 mb-1 font-medium">
            Total Belanja Max
          </label>
          <input
            type="number"
            value={local.maxTotalSpent}
            onChange={(e) =>
              setLocal({ ...local, maxTotalSpent: e.target.value })
            }
            placeholder="999999999"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
      </div>

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
