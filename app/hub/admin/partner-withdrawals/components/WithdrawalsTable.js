"use client";
import { useState } from "react";
import { WithdrawalDetailModal } from "./WithdrawalDetailModal";
import { ProofUploadModal } from "./ProofUploadModal";

export const WithdrawalsTable = ({
  withdrawals,
  onProcess,
  processingId,
  formatDate,
  formatRupiah,
}) => {
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showProofModal, setShowProofModal] = useState(false);


  const getStatusBadge = (status) => {
    const statusMap = {
      requested: {
        label: "Diminta",
        className: "bg-yellow-100 text-yellow-700",
      },
      processed: { label: "Diproses", className: "bg-blue-100 text-blue-700" },
      transferred: {
        label: "Ditransfer",
        className: "bg-green-100 text-green-700",
      },
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

  const handleViewDetail = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setShowDetailModal(true);
  };

  const handleProcessClick = async (withdrawal, type) => {
    if (type === "process") {
      if (
        !confirm(
          `Proses withdrawal milik ${withdrawal.partnerName} sebesar ${formatRupiah(withdrawal.totalAmount)}?\n\nStatus akan berubah menjadi "Diproses".`,
        )
      )
        return;
      const result = await onProcess(
        withdrawal.partnerWithdrawalId,
        "processed",
        null,
      );
      if (result && result.success) {
        alert("✅ Withdrawal berhasil diproses!");
      } else {
        alert("❌ Gagal: " + (result?.error || "Terjadi kesalahan"));
      }
    } else {
      setSelectedWithdrawal(withdrawal);
      setShowProofModal(true);
    }
  };

  const handleConfirmPayment = async (formData) => {
    if (!selectedWithdrawal) return;

    const result = await onProcess(
      selectedWithdrawal.partnerWithdrawalId,
      "transferred",
      formData,
    );

    if (result && result.success) {
      alert(
        "✅ Withdrawal berhasil ditandai transfer! Status refills telah diperbarui menjadi PAID.",
      );
    } else {
      alert("❌ Gagal: " + (result?.error || "Terjadi kesalahan"));
    }

    setShowProofModal(false);
    setSelectedWithdrawal(null);
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
        <p className="text-gray-500">Tidak ada data penarikan</p>
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
                Partner
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
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Diproses Oleh
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
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-gray-800">
                    {wd.partnerName}
                  </div>
                  <div className="text-xs text-gray-400">{wd.partnerId}</div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {wd.paperRefillIds?.length || 0}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-green-600">
                  {formatRupiah(wd.totalAmount)}
                </td>
                <td className="px-4 py-3">{getStatusBadge(wd.status)}</td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {wd.processedBy || "-"}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleViewDetail(wd)}
                      className="px-3 py-1 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 text-xs"
                    >
                      Detail
                    </button>
                    {wd.status === "requested" && (
                      <button
                        onClick={() => handleProcessClick(wd, "process")}
                        disabled={processingId === wd.partnerWithdrawalId}
                        className={`px-3 py-1 text-white rounded-lg text-xs ${
                          processingId === wd.partnerWithdrawalId
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-orange-600 hover:bg-orange-700"
                        }`}
                      >
                        {processingId === wd.partnerWithdrawalId
                          ? "Memproses..."
                          : "Proses"}
                      </button>
                    )}
                    {wd.status === "processed" && (
                      <button
                        onClick={() => handleProcessClick(wd, "transfer")}
                        disabled={processingId === wd.partnerWithdrawalId}
                        className={`px-3 py-1 text-white rounded-lg text-xs ${
                          processingId === wd.partnerWithdrawalId
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700"
                        }`}
                      >
                        {processingId === wd.partnerWithdrawalId
                          ? "Memproses..."
                          : "Tandai Transfer"}
                      </button>
                    )}
                  </div>
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
      />

      <ProofUploadModal
        isOpen={showProofModal}
        onClose={() => {
          setShowProofModal(false);
          setSelectedWithdrawal(null);
          setActionType(null);
        }}
        onConfirm={handleConfirmPayment}
        withdrawal={selectedWithdrawal}
        processing={processingId === selectedWithdrawal?.partnerWithdrawalId}
        formatRupiah={formatRupiah}
      />
    </>
  );
};
