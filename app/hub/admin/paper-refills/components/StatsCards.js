export const StatsCards = ({ stats, loading }) => {
  const formatRupiah = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatNumber = (num) => new Intl.NumberFormat("id-ID").format(num || 0);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl border p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-24"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-4">
        <p className="text-xs text-blue-600 mb-1">Total Refill</p>
        <p className="text-2xl font-bold text-blue-800">
          {formatNumber(stats.total?.totalRefills || 0)}
        </p>
        <p className="text-xs text-blue-500 mt-1">
          {formatNumber(stats.total?.totalSheets || 0)} lembar
        </p>
      </div>
      <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200 p-4">
        <p className="text-xs text-green-600 mb-1">Total Revenue</p>
        <p className="text-2xl font-bold text-green-800">
          {formatRupiah(stats.total?.totalRevenue || 0)}
        </p>
      </div>
      <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200 p-4">
        <p className="text-xs text-purple-600 mb-1">Total Profit Partner</p>
        <p className="text-2xl font-bold text-purple-800">
          {formatRupiah(stats.total?.totalProfit || 0)}
        </p>
      </div>
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200 p-4">
        <p className="text-xs text-orange-600 mb-1">Profit Owner</p>
        <p className="text-2xl font-bold text-orange-800">
          {formatRupiah(
            (stats.total?.totalRevenue || 0) - (stats.total?.totalProfit || 0),
          )}
        </p>
      </div>
    </div>
  );
};
