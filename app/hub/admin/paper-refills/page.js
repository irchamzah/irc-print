// app/hub/admin/paper-refills/page.js
"use client";
import { useState, useEffect } from "react";
import { useHubAuth } from "../../auth/hooks/useHubAuth";
import { AdminLayout } from "../components/AdminLayout";
import { useAdminData } from "../hooks/useAdminData";
import { ProofUploadModal } from "../components/ProofUploadModal";
import CustomLink from "@/app/components/CustomLink";

export default function AdminPaperRefillsPage() {
  const { isSuperAdmin, token } = useHubAuth();
  const {
    refills,
    refillStats,
    markRefillAsPaid,
    loading,
    error,
    refreshData,
    formatDate,
  } = useAdminData();
  const [processingId, setProcessingId] = useState(null);
  const [showProofModal, setShowProofModal] = useState(false);
  const [selectedRefill, setSelectedRefill] = useState(null);

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleMarkAsPaid = async (refill) => {
    // Validasi di frontend
    if (refill.status !== "completed") {
      alert('❌ Hanya refill dengan status "Selesai" yang bisa dibayar');
      return;
    }

    if (refill.totalRevenue <= 0) {
      alert("❌ Tidak bisa membayar refill tanpa pendapatan");
      return;
    }

    // Tampilkan modal upload bukti
    setSelectedRefill(refill);
    setShowProofModal(true);
  };

  const handleConfirmPayment = async (formData) => {
    if (!selectedRefill) return;

    setProcessingId(selectedRefill.refillId);

    try {
      // ✅ FETCH dilakukan di sini, bukan di modal
      const response = await fetch(
        `/api/hub/admin/paper-refills/${selectedRefill.refillId}/pay`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData, // FormData langsung dikirim
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`,
        );
      }

      const result = await response.json();

      if (result.success) {
        alert("✅ Pembayaran berhasil");
        setShowProofModal(false);
        await refreshData();
      } else {
        alert("❌ Gagal: " + result.error);
      }
    } catch (error) {
      alert("❌ Gagal: " + error.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleViewProof = (refill) => {
    if (refill.transferProof) {
      const imageUrl = `${process.env.NEXT_PUBLIC_VPS_API_URL}${refill.transferProof.url}`;
      window.open(imageUrl, "_blank");
    }
  };

  const handleRetry = () => {
    refreshData();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return (
          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
            Aktif
          </span>
        );
      case "completed":
        return (
          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
            Selesai
          </span>
        );
      case "paid":
        return (
          <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
            Dibayar
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
            {status}
          </span>
        );
    }
  };

  const tabs = [
    { id: "users", label: "👥 Users", href: "/hub/admin/users" },
    { id: "printers", label: "🖨️ Printers", href: "/hub/admin/printers" },
    {
      id: "refills",
      label: "💰 Paper Refills",
      href: "/hub/admin/paper-refills",
    },
  ];

  if (!isSuperAdmin()) {
    return null;
  }

  // Error state with retry button
  if (error) {
    return (
      <AdminLayout tabs={tabs} activeTab="refills">
        <div className="bg-white rounded-xl border border-red-200 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Gagal Memuat Data
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Coba Lagi
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout tabs={tabs} activeTab="refills">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Total Profit Partner</p>
          <p className="text-2xl font-bold text-gray-800">
            {formatRupiah(refillStats.total?.totalProfit || 0)}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {refillStats.total?.totalRefills || 0} transaksi
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Pending Payment</p>
          <p className="text-2xl font-bold text-yellow-600">
            {formatRupiah(refillStats.pending?.amount || 0)}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {refillStats.pending?.count || 0} menunggu
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Total Dibayar</p>
          <p className="text-2xl font-bold text-green-600">
            {formatRupiah(refillStats.paid?.amount || 0)}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {refillStats.paid?.count || 0} transaksi
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            💰 Pembayaran Partner
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Upload bukti transfer saat menandai pembayaran
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Memuat data...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tanggal
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Printer
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Partner
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Kertas
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Profit
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Bukti
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {refills.map((refill) => (
                  <tr key={refill.refillId} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-3 text-sm text-gray-600">
                      {formatDate(refill.createdAt)}
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-sm font-medium text-gray-800">
                      <CustomLink
                        href={`/hub/printers/${refill.printerId}`}
                        className={`text-blue-500 hover:underline`}
                      >
                        {refill.printerName}
                      </CustomLink>
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-sm text-gray-600">
                      {refill.filledByName}
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-sm text-gray-600">
                      {refill.sheetsAdded} lembar
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-sm font-medium text-green-600">
                      {formatRupiah(refill.partnerProfit)}
                    </td>
                    <td className="px-4 sm:px-6 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          refill.status === "paid"
                            ? "bg-green-100 text-green-700"
                            : refill.status === "completed"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {refill.status === "paid"
                          ? "Dibayar"
                          : refill.status === "completed"
                            ? "Selesai"
                            : "Aktif"}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3">
                      {refill.transferProof ? (
                        <button
                          onClick={() => handleViewProof(refill)}
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
                      ) : refill.status === "paid" ? (
                        <span className="text-xs text-gray-400">Tidak ada</span>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-right">
                      {refill.status === "completed" && (
                        <button
                          onClick={() => handleMarkAsPaid(refill)}
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
                      {refill.status === "paid" && refill.paidAt && (
                        <span className="text-xs text-gray-400">
                          {formatDate(refill.paidAt)}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Upload Bukti */}
      <ProofUploadModal
        isOpen={showProofModal}
        onClose={() => setShowProofModal(false)}
        onConfirm={handleConfirmPayment}
        refill={selectedRefill}
        processing={processingId === selectedRefill?.refillId}
        formatRupiah={formatRupiah}
      />
    </AdminLayout>
  );
}
