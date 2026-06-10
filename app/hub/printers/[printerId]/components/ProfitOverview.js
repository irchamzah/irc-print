import CustomLink from "@/app/components/CustomLink";
import { useHubAuth } from "@/app/hub/auth/hooks/useHubAuth";

// ProfitOverview - UPDATED dengan struktur baru
export const ProfitOverview = ({
  totalRevenue,
  pendingPayout, // partnerProfit dari status active + completed
  paidProfit, // partnerProfit dari status paid
  platformProfit, // total platformProfit dari semua status
  formatRupiah,
  dateRange,
}) => {
  const { isSuperAdmin } = useHubAuth();

  const isAdmin = isSuperAdmin();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Pendapatan - Hanya untuk Super Admin */}
      {isAdmin && (
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

      {/* Profit Partner Tertunda (active + completed) - Untuk Partner & Admin */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-sm text-gray-500 mb-1">Profit Partner Tertunda</p>
        <p className="text-2xl font-bold text-orange-600">
          {formatRupiah(pendingPayout)}
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Belum dicairkan (Active + Completed)
        </p>
      </div>

      {/* Total Profit Partner (paid) - Untuk Partner & Admin */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-sm text-gray-500 mb-1">Total Profit Partner</p>
        <p className="text-2xl font-bold text-green-600">
          {formatRupiah(paidProfit)}
        </p>
        <p className="text-xs text-gray-400 mt-2">Sudah dicairkan (Paid)</p>
      </div>

      {/* Total Profit Platform - Hanya untuk Super Admin */}
      {isAdmin && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Total Profit Platform</p>
          <p className="text-2xl font-bold text-blue-600">
            {formatRupiah(platformProfit)}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            {dateRange.filterType === "all"
              ? "Semua waktu"
              : "Periode terpilih"}
          </p>
        </div>
      )}
    </div>
  );
};
