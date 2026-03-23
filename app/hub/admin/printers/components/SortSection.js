// Sort Component
export const SortSection = ({ currentSort, onSortChange }) => {
  const sortOptions = [
    { value: "createdAt", label: "Tanggal Dibuat" },
    { value: "name", label: "Nama Printer" },
    { value: "status", label: "Status" },
    { value: "updatedAt", label: "Terakhir Update" },
    { value: "statistics.totalJobs", label: "Total Job" },
  ];

  const handleSortChange = (sortBy) => {
    const newOrder =
      currentSort.sortBy === sortBy && currentSort.sortOrder === "desc"
        ? "asc"
        : "desc";
    onSortChange(sortBy, newOrder);
  };

  return (
    <div className="flex items-center justify-end gap-3 mb-4">
      <span className="text-sm text-gray-500">Urutkan:</span>
      <div className="flex gap-2">
        {sortOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleSortChange(opt.value)}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
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
