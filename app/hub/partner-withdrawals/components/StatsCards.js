"use client";

export const StatsCards = ({ stats, loading, formatRupiah }) => {
  const formatNumber = (num) => new Intl.NumberFormat("id-ID").format(num || 0);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
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
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-4">
        <p className="text-xs text-blue-600 mb-1">Total Penarikan</p>
        <p className="text-2xl font-bold text-blue-800">
          {formatNumber(stats.total)}
        </p>
      </div>

      <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200 p-4">
        <p className="text-xs text-yellow-600 mb-1">Diminta</p>
        <p className="text-2xl font-bold text-yellow-800">
          {formatNumber(stats.requested)}
        </p>
      </div>

      <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200 p-4">
        <p className="text-xs text-orange-600 mb-1">Diproses</p>
        <p className="text-2xl font-bold text-orange-800">
          {formatNumber(stats.processed)}
        </p>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200 p-4">
        <p className="text-xs text-green-600 mb-1">Total Nilai</p>
        <p className="text-2xl font-bold text-green-800">
          {formatRupiah(stats.totalAmount)}
        </p>
      </div>
    </div>
  );
};
