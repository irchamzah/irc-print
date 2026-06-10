"use client";

export const StatsCards = ({ stats, loading }) => {
  const formatNumber = (num) => new Intl.NumberFormat("id-ID").format(num || 0);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl border p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-4">
        <p className="text-xs text-blue-600 mb-1">Total Model</p>
        <p className="text-2xl font-bold text-blue-800">
          {formatNumber(stats.total)}
        </p>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200 p-4">
        <p className="text-xs text-green-600 mb-1">Aktif</p>
        <p className="text-2xl font-bold text-green-800">
          {formatNumber(stats.active)}
        </p>
      </div>

      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-4">
        <p className="text-xs text-gray-600 mb-1">Tidak Aktif</p>
        <p className="text-2xl font-bold text-gray-800">
          {formatNumber((stats.total || 0) - (stats.active || 0))}
        </p>
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200 p-4">
        <p className="text-xs text-purple-600 mb-1">Brand</p>
        <p className="text-2xl font-bold text-purple-800">
          {formatNumber(stats.uniqueBrands || 0)}
        </p>
      </div>
    </div>
  );
};
