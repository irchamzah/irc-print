"use client";

// InfoCard TERPAKAI
export const InfoCard = ({ profitShare }) => {
  return (
    <div className="mt-6 bg-blue-50 rounded-xl border border-blue-200 p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <svg
            className="w-5 h-5 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">Bagaimana sistem profit bekerja:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Anda mendapatkan {profitShare}% dari setiap transaksi</li>
            <li>
              Setiap pengisian kertas (80 lembar) akan membuat periode profit
              baru
            </li>
            <li>
              Klik pada riwayat pengisian untuk melihat detail print jobs
              terkait
            </li>
            <li>
              Profit akan dicairkan per periode pengisian setelah status
              &quot;paid&quot;
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
