// Stats Cards Component - UPDATED dengan role admin
export const StatsCards = ({ stats, loading }) => {
  const formatNumber = (num) => new Intl.NumberFormat("id-ID").format(num || 0);
  const formatRupiah = (amount) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount || 0);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="bg-white rounded-xl border p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
      {/* Total User */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-4">
        <p className="text-xs text-blue-600 mb-1">Total User</p>
        <p className="text-2xl font-bold text-blue-800">
          {formatNumber(stats.total)}
        </p>
      </div>

      {/* Super Admin */}
      <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200 p-4">
        <p className="text-xs text-purple-600 mb-1">Super Admin</p>
        <p className="text-2xl font-bold text-purple-800">
          {formatNumber(stats.super_admin)}
        </p>
      </div>

      {/* Admin - ✅ TAMBAH untuk role admin */}
      <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-xl border border-indigo-200 p-4">
        <p className="text-xs text-indigo-600 mb-1">Admin</p>
        <p className="text-2xl font-bold text-indigo-800">
          {formatNumber(stats.admin || 0)}
        </p>
      </div>

      {/* Partner */}
      <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200 p-4">
        <p className="text-xs text-green-600 mb-1">Partner</p>
        <p className="text-2xl font-bold text-green-800">
          {formatNumber(stats.partner)}
        </p>
      </div>

      {/* Customer (User Biasa) */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-4">
        <p className="text-xs text-gray-600 mb-1">Customer</p>
        <p className="text-2xl font-bold text-gray-800">
          {formatNumber(stats.customer)}
        </p>
      </div>

      {/* Memiliki Rekening */}
      <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200 p-4">
        <p className="text-xs text-yellow-600 mb-1">Memiliki Rekening</p>
        <p className="text-2xl font-bold text-yellow-800">
          {formatNumber(stats.hasBankAccount)}
        </p>
      </div>

      {/* Total Poin */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200 p-4">
        <p className="text-xs text-orange-600 mb-1">Total Poin</p>
        <p className="text-2xl font-bold text-orange-800">
          {formatNumber(stats.totalPoints)}
        </p>
      </div>
    </div>
  );
};
