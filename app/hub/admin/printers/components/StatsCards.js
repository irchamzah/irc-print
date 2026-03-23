// Stats Cards Component
export const StatsCards = ({ stats, loading }) => {
  const formatNumber = (num) => new Intl.NumberFormat("id-ID").format(num || 0);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white rounded-xl border p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-4">
        <p className="text-xs text-blue-600 mb-1">Total Printer</p>
        <p className="text-2xl font-bold text-blue-800">
          {formatNumber(stats.total)}
        </p>
      </div>
      <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200 p-4">
        <p className="text-xs text-green-600 mb-1">Online</p>
        <p className="text-2xl font-bold text-green-800">
          {formatNumber(stats.online)}
        </p>
      </div>
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-4">
        <p className="text-xs text-gray-600 mb-1">Offline</p>
        <p className="text-2xl font-bold text-gray-800">
          {formatNumber(stats.offline)}
        </p>
      </div>
      <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200 p-4">
        <p className="text-xs text-yellow-600 mb-1">Kertas &lt; 20</p>
        <p className="text-2xl font-bold text-yellow-800">
          {formatNumber(stats.lowPaper)}
        </p>
      </div>
      <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl border border-red-200 p-4">
        <p className="text-xs text-red-600 mb-1">Kertas Habis</p>
        <p className="text-2xl font-bold text-red-800">
          {formatNumber(stats.outOfPaper)}
        </p>
      </div>
    </div>
  );
};
