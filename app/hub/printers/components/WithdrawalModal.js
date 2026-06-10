"use client";
import { useState, useEffect } from "react";

export const WithdrawalModal = ({
  isOpen,
  onClose,
  onSubmit,
  totalAmount,
  processing,
  minWithdrawalAmount = 100000,
}) => {
  const [notes, setNotes] = useState("");
  const [bankAccount, setBankAccount] = useState({
    bankName: "",
    accountNumber: "",
    accountName: "",
  });
  const [loading, setLoading] = useState(false);

  // ✅ Ambil data user dari localStorage saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      loadUserBankAccount();
    }
  }, [isOpen]);

  const loadUserBankAccount = () => {
    setLoading(true);
    try {
      // Ambil user session dari localStorage
      const userSessionStr = localStorage.getItem("userSession");
      if (userSessionStr) {
        const userSession = JSON.parse(userSessionStr);
        // Cek apakah ada data bankAccount di user session
        if (userSession.bankAccount && userSession.bankAccount.bankName) {
          setBankAccount({
            bankName: userSession.bankAccount.bankName || "",
            accountNumber: userSession.bankAccount.accountNumber || "",
            accountName: userSession.bankAccount.accountName || "",
          });
        }
      }

      // Alternatif: ambil dari hub token (untuk partner yang login di hub)
      const hubToken = localStorage.getItem("hubToken");
      if (hubToken && !bankAccount.bankName) {
        // Fetch user data from API jika perlu
        fetchUserBankAccount();
      }
    } catch (error) {
      console.error("Error loading bank account:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserBankAccount = async () => {
    try {
      const token = localStorage.getItem("hubToken");
      if (!token) return;

      const response = await fetch(`/api/hub/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user && data.user.bankAccount) {
          setBankAccount({
            bankName: data.user.bankAccount.bankName || "",
            accountNumber: data.user.bankAccount.accountNumber || "",
            accountName: data.user.bankAccount.accountName || "",
          });
        }
      }
    } catch (error) {
      console.error("Error fetching user bank account:", error);
    }
  };

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  if (!isOpen) return null;

  const isBelowMinimum = totalAmount < minWithdrawalAmount;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isBelowMinimum) return;
    onSubmit({ notes, bankAccount });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">
            Buat Permintaan Withdrawal
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className={`rounded-lg p-3 border ${isBelowMinimum ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}>
            <p className={`text-sm ${isBelowMinimum ? "text-red-700" : "text-green-700"}`}>Total yang dapat ditarik:</p>
            <p className={`text-2xl font-bold ${isBelowMinimum ? "text-red-700" : "text-green-700"}`}>
              {formatRupiah(totalAmount)}
            </p>
            <p className={`text-xs mt-1 ${isBelowMinimum ? "text-red-600" : "text-green-600"}`}>
              Minimum withdrawal: {formatRupiah(minWithdrawalAmount)}
            </p>
            {isBelowMinimum && (
              <p className="text-xs text-red-600 font-medium mt-1">
                Profit belum mencapai minimum withdrawal
              </p>
            )}
          </div>

          {/* Informasi Bank yang Terisi Otomatis */}
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <p className="text-sm text-blue-700 mb-2 flex items-center gap-1">
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
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Informasi Bank Anda
            </p>
            {loading ? (
              <div className="flex justify-center py-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              </div>
            ) : bankAccount.bankName ? (
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-gray-600">Bank:</span>{" "}
                  <span className="font-medium">{bankAccount.bankName}</span>
                </p>
                <p>
                  <span className="text-gray-600">No. Rekening:</span>{" "}
                  <span className="font-medium">
                    {bankAccount.accountNumber}
                  </span>
                </p>
                <p>
                  <span className="text-gray-600">Atas Nama:</span>{" "}
                  <span className="font-medium">{bankAccount.accountName}</span>
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Belum ada informasi bank. Silakan isi data bank Anda.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Bank <span className="text-red-500">*</span>
            </label>
            <select
              value={bankAccount.bankName}
              onChange={(e) =>
                setBankAccount({ ...bankAccount, bankName: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="">Pilih Bank</option>
              <option value="BCA">Bank BCA</option>
              <option value="BNI">Bank BNI</option>
              <option value="BRI">Bank BRI</option>
              <option value="MANDIRI">Bank Mandiri</option>
              <option value="CIMB">Bank CIMB Niaga</option>
              <option value="DANAMON">Bank Danamon</option>
              <option value="PERMATA">Bank Permata</option>
              <option value="MAYBANK">Bank Maybank</option>
              <option value="BSI">Bank Syariah Indonesia</option>
              <option value="JAGO">Bank Jago</option>
              <option value="SEABANK">SeaBank</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nomor Rekening <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={bankAccount.accountNumber}
              onChange={(e) =>
                setBankAccount({
                  ...bankAccount,
                  accountNumber: e.target.value.replace(/\D/g, ""),
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              required
              placeholder="1234567890"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Pemilik Rekening <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={bankAccount.accountName}
              onChange={(e) =>
                setBankAccount({ ...bankAccount, accountName: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              required
              placeholder="Sesuai nama di rekening"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catatan (Opsional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              rows={3}
              placeholder="Tambahkan catatan jika diperlukan..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={processing || isBelowMinimum}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {processing ? "Memproses..." : "Ajukan Withdrawal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
