"use client";
import { useState } from "react";
import { WithdrawalDetailModal } from "../../admin/partner-withdrawals/components/WithdrawalDetailModal";

export const WithdrawalsTable = ({
  withdrawals,
  formatDate,
  formatRupiah,
  getStatusBadge,
}) => {
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const handleViewDetail = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setShowDetailModal(true);
  };

  if (withdrawals.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="w-16 h-16 text-gray-300 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-gray-500">Belum ada riwayat penarikan</p>
        <p className="text-sm text-gray-400 mt-1">
          Permintaan withdrawal akan muncul di sini
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Tanggal
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                ID Penarikan
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Jumlah Refill
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Total Amount
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
            {withdrawals.map((wd) => (
              <tr key={wd.partnerWithdrawalId} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-600">
                  {formatDate(wd.createdAt)}
                  {wd.transferredAt && (
                    <p className="text-xs text-green-600 mt-1">
                      Transfer: {formatDate(wd.transferredAt)}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 text-sm font-mono text-gray-500">
                  {wd.partnerWithdrawalId}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {wd.paperRefillIds?.length || 0}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-green-600">
                  {formatRupiah(wd.totalAmount)}
                </td>
                <td className="px-4 py-3">{getStatusBadge(wd.status)}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleViewDetail(wd)}
                    className="px-3 py-1 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 text-xs"
                  >
                    Detail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <WithdrawalDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        withdrawal={selectedWithdrawal}
        formatDate={formatDate}
        formatRupiah={formatRupiah}
        getStatusBadge={getStatusBadge}
      />
    </>
  );
};
