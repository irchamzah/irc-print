import CustomLink from "@/app/components/CustomLink";

export const RefillsTable = ({
  refills,
  onMarkAsPaid,
  onViewProof,
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
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Bukti
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
            refills.map((refill) => (
              <tr key={refill.refillId} className="hover:bg-gray-50">
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
                    {refill.printerName}
                  </CustomLink>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {refill.filledByName}
                  <p className="text-xs text-gray-400">{refill.filledByRole}</p>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {refill.sheetsAdded} lembar
                  <p className="text-xs text-gray-400">
                    {refill.paperCountBefore} → {refill.paperCountAfter}
                  </p>
                </td>
                <td className="px-4 py-3 text-sm font-medium text-green-600">
                  {formatRupiah(refill.partnerProfit)}
                  <p className="text-xs text-gray-400">
                    {refill.profitShare}% dari{" "}
                    {formatRupiah(refill.totalRevenue)}
                  </p>
                </td>
                <td className="px-4 py-3">{getStatusBadge(refill.status)}</td>
                <td className="px-4 py-3">
                  {refill.transferProof ? (
                    <button
                      onClick={() => onViewProof(refill)}
                      className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1"
                      title="Lihat Bukti"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      Lihat
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {refill.status === "completed" && (
                    <button
                      onClick={() => onMarkAsPaid(refill)}
                      disabled={processingId === refill.refillId}
                      className={`px-3 py-1 text-white rounded-lg text-xs ${
                        processingId === refill.refillId
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      {processingId === refill.refillId ? (
                        <div className="flex items-center gap-1">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                          <span>Memproses...</span>
                        </div>
                      ) : (
                        "Tandai Dibayar"
                      )}
                    </button>
                  )}
                  {refill.status === "paid" && refill.paidByName && (
                    <p className="text-xs text-gray-400 mt-1">
                      Oleh: {refill.paidByName}
                    </p>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
