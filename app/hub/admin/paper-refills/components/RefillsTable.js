import CustomLink from "@/app/components/CustomLink";

export const RefillsTable = ({
  refills,
  onMarkAsPaid,
  processingId,
  formatDate,
  formatRupiah,
}) => {
  const getStatusBadge = (status) => {
    const statusMap = {
      active: { label: "Aktif", className: "bg-yellow-100 text-yellow-700" },
      completed: { label: "Selesai", className: "bg-blue-100 text-blue-700" },
      paid: { label: "Dibayar", className: "bg-green-100 text-green-700" },
    };
    const s = statusMap[status] || {
      label: status,
      className: "bg-gray-100 text-gray-700",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${s.className}`}>
        {s.label}
      </span>
    );
  };

  // Helper untuk mendapatkan paperRefillId
  const getPaperRefillId = (refill) => {
    return refill.paperRefillId || refill.refillId;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Tanggal Refill
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Printer
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Partner
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Kertas
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Profit Partner
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Profit Platform
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Status
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {refills.length === 0 ? (
            <tr>
              <td colSpan={8} className="text-center py-8 text-gray-500">
                Tidak ada data refill
              </td>
            </tr>
          ) : (
            refills.map((refill) => {
              const paperRefillId = getPaperRefillId(refill);
              const isProcessing = processingId === paperRefillId;

              return (
                <tr key={paperRefillId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatDate(refill.createdAt)}
                    {refill.completedAt && (
                      <p className="text-xs text-gray-400 mt-1">
                        Selesai: {formatDate(refill.completedAt)}
                      </p>
                    )}
                    {refill.paidAt && (
                      <p className="text-xs text-green-600 mt-1">
                        Dibayar: {formatDate(refill.paidAt)}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">
                    <CustomLink
                      href={`/hub/printers/${refill.printerId}`}
                      className="text-blue-500 hover:underline"
                    >
                      {refill.printerName || refill.printerId}
                    </CustomLink>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {refill.filledByName}
                    <p className="text-xs text-gray-400">
                      {refill.filledByRole === "super_admin"
                        ? "Admin"
                        : refill.filledByRole}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {refill.sheetsAdded} lembar
                    <p className="text-xs text-gray-400">
                      Stok: {refill.paperCountBefore} → {refill.paperCountAfter}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-green-600">
                      {formatRupiah(refill.partnerProfit)}
                    </div>
                    <p className="text-xs text-gray-400">
                      dari {formatRupiah(refill.totalRevenue)}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-blue-600">
                      {formatRupiah(refill.platformProfit)}
                    </div>
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(refill.status)}</td>
                  <td className="px-4 py-3 text-right">
                    {/* ✅ Tombol hanya untuk status completed */}
                    {refill.status === "completed" && (
                      <button
                        onClick={() => onMarkAsPaid(refill)}
                        disabled={isProcessing}
                        className={`px-3 py-1 text-white rounded-lg text-xs ${
                          isProcessing
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700"
                        }`}
                      >
                        {isProcessing ? (
                          <div className="flex items-center gap-1">
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                            <span>Memproses...</span>
                          </div>
                        ) : (
                          "Tandai Dibayar"
                        )}
                      </button>
                    )}
                    {/* ✅ Tampilkan info siapa yang membayar jika status paid */}
                    {refill.status === "paid" && refill.paidByName && (
                      <p className="text-xs text-gray-400 mt-1">
                        Dibayar oleh: {refill.paidByName}
                      </p>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};
