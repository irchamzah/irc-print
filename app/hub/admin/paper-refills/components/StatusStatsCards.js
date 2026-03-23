export const StatusStatsCards = ({ stats, loading }) => {
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl border p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-24"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-yellow-600 font-medium">Aktif</p>
          <span className="text-xs text-yellow-500">
            {formatNumber(stats.pending?.count || 0)} transaksi
          </span>
        </div>
        <p className="text-xl font-bold text-yellow-700">
          {formatRupiah(stats.pending?.amount || 0)}
        </p>
        <p className="text-xs text-yellow-500 mt-1">Menunggu selesai</p>
      </div>
      <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-blue-600 font-medium">Selesai</p>
          <span className="text-xs text-blue-500">
            {formatNumber(stats.completed?.count || 0)} transaksi
          </span>
        </div>
        <p className="text-xl font-bold text-blue-700">
          {formatRupiah(stats.completed?.amount || 0)}
        </p>
        <p className="text-xs text-blue-500 mt-1">Menunggu pembayaran</p>
      </div>
      <div className="bg-green-50 rounded-xl border border-green-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-green-600 font-medium">Dibayar</p>
          <span className="text-xs text-green-500">
            {formatNumber(stats.paid?.count || 0)} transaksi
          </span>
        </div>
        <p className="text-xl font-bold text-green-700">
          {formatRupiah(stats.paid?.amount || 0)}
        </p>
        <p className="text-xs text-green-500 mt-1">Sudah dibayar</p>
      </div>
    </div>
  );
};
