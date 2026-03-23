import { useHubAuth } from "@/app/hub/auth/hooks/useHubAuth";

// 🥸ProfitOverview /app/hub/printers/[printerId]/components/ProfitOverview.js TERPAKAI
export const ProfitOverview = ({
  totalRevenue,
  profitShare,
  pendingPayout,
  totalProfit,
  formatRupiah,
  dateRange,
}) => {
  const { isSuperAdmin } = useHubAuth();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
      {isSuperAdmin() && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Total Pendapatan</p>
          <p className="text-2xl font-bold text-gray-800">
            {formatRupiah(totalRevenue)}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            {dateRange.filterType === "all"
              ? "Semua waktu"
              : "Periode terpilih"}
          </p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-sm text-gray-500 mb-1">Share Profit</p>
        <p className="text-2xl font-bold text-green-600">{profitShare}%</p>
        <p className="text-xs text-gray-400 mt-2">
          {profitShare === 30 ? "✅ Partner isi sendiri" : "⏳ Diisi admin"}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-sm text-gray-500 mb-1">Profit Tertunda</p>
        <p className="text-2xl font-bold text-orange-600">
          {formatRupiah(pendingPayout)}
        </p>
        <p className="text-xs text-gray-400 mt-2">Periode terpilih</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-sm text-gray-500 mb-1">Total Profit</p>
        <p className="text-2xl font-bold text-blue-600">
          {formatRupiah(totalProfit)}
        </p>
        <p className="text-xs text-gray-400 mt-2">Periode terpilih</p>
      </div>
    </div>
  );
};
