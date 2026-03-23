import { useEffect, useState } from "react";

// Filter Component
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
    { value: "online", label: "Online" },
    { value: "offline", label: "Offline" },
    { value: "maintenance", label: "Maintenance" },
  ];

  const paperAvailableOptions = [
    { value: "", label: "Semua" },
    { value: "true", label: "Tersedia" },
    { value: "false", label: "Tidak Tersedia" },
  ];

  const booleanOptions = [
    { value: "", label: "Semua" },
    { value: "true", label: "Ya" },
    { value: "false", label: "Tidak" },
  ];

  const paperCountOptions = [
    { value: "", label: "Semua" },
    { value: "0", label: "0 lembar (Habis)" },
    { value: "1-20", label: "1-20 lembar (Kritis)" },
    { value: "21-50", label: "21-50 lembar (Sedang)" },
    { value: "51-100", label: "51-100 lembar (Cukup)" },
    { value: "100", label: ">100 lembar (Banyak)" },
  ];

  const handlePaperCountChange = (value) => {
    if (value === "") {
      setLocal({ ...local, minPaperCount: "", maxPaperCount: "" });
    } else if (value === "0") {
      setLocal({ ...local, minPaperCount: "0", maxPaperCount: "0" });
    } else if (value === "1-20") {
      setLocal({ ...local, minPaperCount: "1", maxPaperCount: "20" });
    } else if (value === "21-50") {
      setLocal({ ...local, minPaperCount: "21", maxPaperCount: "50" });
    } else if (value === "51-100") {
      setLocal({ ...local, minPaperCount: "51", maxPaperCount: "100" });
    } else if (value === "100") {
      setLocal({ ...local, minPaperCount: "101", maxPaperCount: "" });
    }
  };

  const getPaperCountValue = () => {
    if (!local.minPaperCount && !local.maxPaperCount) return "";
    if (local.minPaperCount === "0" && local.maxPaperCount === "0") return "0";
    if (local.minPaperCount === "1" && local.maxPaperCount === "20")
      return "1-20";
    if (local.minPaperCount === "21" && local.maxPaperCount === "50")
      return "21-50";
    if (local.minPaperCount === "51" && local.maxPaperCount === "100")
      return "51-100";
    if (local.minPaperCount === "101" && !local.maxPaperCount) return "100";
    return "";
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
        Filter Printer
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
            placeholder="Cari nama, ID, atau model..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs text-gray-600 mb-1 font-medium">
            Status
          </label>
          <select
            value={local.status}
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

        {/* Kota */}
        <div>
          <label className="block text-xs text-gray-600 mb-1 font-medium">
            Kota
          </label>
          <select
            value={local.city}
            onChange={(e) => setLocal({ ...local, city: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">Semua Kota</option>
            {options.cities?.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* Provinsi */}
        <div>
          <label className="block text-xs text-gray-600 mb-1 font-medium">
            Provinsi
          </label>
          <select
            value={local.province}
            onChange={(e) => setLocal({ ...local, province: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">Semua Provinsi</option>
            {options.provinces?.map((province) => (
              <option key={province} value={province}>
                {province}
              </option>
            ))}
          </select>
        </div>

        {/* Kertas Tersedia */}
        <div>
          <label className="block text-xs text-gray-600 mb-1 font-medium">
            Kertas Tersedia
          </label>
          <select
            value={local.paperAvailable}
            onChange={(e) =>
              setLocal({ ...local, paperAvailable: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            {paperAvailableOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sisa Kertas */}
        <div>
          <label className="block text-xs text-gray-600 mb-1 font-medium">
            Sisa Kertas
          </label>
          <select
            value={getPaperCountValue()}
            onChange={(e) => handlePaperCountChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            {paperCountOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Warna */}
        <div>
          <label className="block text-xs text-gray-600 mb-1 font-medium">
            Dukungan Warna
          </label>
          <select
            value={local.hasColor}
            onChange={(e) => setLocal({ ...local, hasColor: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            {booleanOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Duplex */}
        <div>
          <label className="block text-xs text-gray-600 mb-1 font-medium">
            Duplex (2 sisi)
          </label>
          <select
            value={local.hasDuplex}
            onChange={(e) => setLocal({ ...local, hasDuplex: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            {booleanOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
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
