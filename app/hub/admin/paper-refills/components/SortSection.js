export const SortSection = ({ currentSort, onSortChange }) => {
  const sortOptions = [
    { value: "createdAt", label: "Tanggal Refill" },
    { value: "completedAt", label: "Tanggal Selesai" },
    { value: "paidAt", label: "Tanggal Dibayar" },
    { value: "printerName", label: "Nama Printer" },
    { value: "filledByName", label: "Partner" },
    { value: "sheetsAdded", label: "Jumlah Kertas" },
    { value: "partnerProfit", label: "Profit Partner" },
    { value: "totalRevenue", label: "Total Revenue" },
  ];

  const handleSortChange = (sortBy) => {
    const newOrder =
      currentSort.sortBy === sortBy && currentSort.sortOrder === "desc"
        ? "asc"
        : "desc";
    onSortChange(sortBy, newOrder);
  };

  return (
    <div className="flex flex-wrap items-center justify-end gap-2 mb-4">
      <span className="text-sm text-gray-500">Urutkan:</span>
      <div className="flex flex-wrap gap-1">
        {sortOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleSortChange(opt.value)}
            className={`px-2 py-1 rounded-lg text-xs transition-colors ${
              currentSort.sortBy === opt.value
                ? "bg-purple-100 text-purple-700 font-medium"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {opt.label}
            {currentSort.sortBy === opt.value && (
              <span className="ml-1">
                {currentSort.sortOrder === "desc" ? "↓" : "↑"}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
