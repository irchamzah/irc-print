"use client";
import { useEffect, useState } from "react";

// 🥸UserFormModal /app/hub/admin/components/UserFormModal.js TERPAKAI
export const UserFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  user,
  printers,
  error,
  processing,
}) => {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    role: user?.role || "user",
    password: "",
    accessPrinters: user?.accessPrinters || [],
    bankAccount: {
      bankName: user?.bankAccount?.bankName || "",
      accountNumber: user?.bankAccount?.accountNumber || "",
      accountName: user?.bankAccount?.accountName || "",
    },
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        role: user.role || "user",
        password: "",
        accessPrinters: user.accessPrinters || [],
        bankAccount: {
          bankName: user.bankAccount?.bankName || "",
          accountNumber: user.bankAccount?.accountNumber || "",
          accountName: user.bankAccount?.accountName || "",
        },
      });
    } else {
      // Reset ke default untuk create new
      setFormData({
        name: "",
        phone: "",
        role: "user",
        password: "",
        accessPrinters: [],
        bankAccount: {
          bankName: "",
          accountNumber: "",
          accountName: "",
        },
      });
    }
  }, [user]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const togglePrinter = (printerId) => {
    setFormData((prev) => ({
      ...prev,
      accessPrinters: prev.accessPrinters.includes(printerId)
        ? prev.accessPrinters.filter((id) => id !== printerId)
        : [...prev.accessPrinters, printerId],
    }));
  };

  // Daftar bank Indonesia umum
  const bankOptions = [
    { value: "", label: "Pilih Bank" },
    { value: "BCA", label: "Bank BCA" },
    { value: "BNI", label: "Bank BNI" },
    { value: "BRI", label: "Bank BRI" },
    { value: "MANDIRI", label: "Bank Mandiri" },
    { value: "CIMB", label: "Bank CIMB Niaga" },
    { value: "DANAMON", label: "Bank Danamon" },
    { value: "PERMATA", label: "Bank Permata" },
    { value: "MAYBANK", label: "Bank Maybank" },
    { value: "PANIN", label: "Bank Panin" },
    { value: "OCBC", label: "Bank OCBC NISP" },
    { value: "BTPN", label: "Bank BTPN" },
    { value: "BSI", label: "Bank Syariah Indonesia" },
    { value: "BTN", label: "Bank BTN" },
    { value: "JAGO", label: "Bank Jago" },
    { value: "DIGIBANK", label: "Digibank" },
    { value: "SEABANK", label: "SeaBank" },
    { value: "BLU", label: "Bank BLU" },
    { value: "LAINNYA", label: "Bank Lainnya" },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">
            {user ? "Edit User" : "Tambah User Baru"}
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

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-4 sm:p-6 overflow-y-auto max-h-[60vh]"
        >
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          <div className="space-y-4">
            {/* Nama */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nomor HP
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required={!user}
                placeholder={user ? "Kosongkan jika tidak diubah" : ""}
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="user">User</option>
                <option value="partner">Partner</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>

            {/* Bank Information Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
                Informasi Bank (untuk Partner)
              </h4>

              {/* Nama Bank */}
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Bank
                </label>
                <select
                  value={formData.bankAccount.bankName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bankAccount: {
                        ...formData.bankAccount,
                        bankName: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  {bankOptions.map((bank) => (
                    <option key={bank.value} value={bank.value}>
                      {bank.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nomor Rekening */}
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nomor Rekening
                </label>
                <input
                  type="text"
                  value={formData.bankAccount.accountNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bankAccount: {
                        ...formData.bankAccount,
                        accountNumber: e.target.value.replace(/\D/g, ""), // Hanya angka
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Contoh: 1234567890"
                />
              </div>

              {/* Nama Pemilik Rekening */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Pemilik Rekening
                </label>
                <input
                  type="text"
                  value={formData.bankAccount.accountName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bankAccount: {
                        ...formData.bankAccount,
                        accountName: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Sesuai dengan nama di rekening"
                />
              </div>

              <p className="text-xs text-gray-500 mt-2">
                * Informasi bank digunakan untuk transfer keuntungan bagi
                pengguna dengan role Partner
              </p>
            </div>

            {/* Akses Printer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Akses ke Printer
              </label>
              <div className="border border-gray-200 rounded-lg p-3 max-h-48 overflow-y-auto">
                {printers && printers.length > 0 ? (
                  printers.map((printer) => (
                    <label
                      key={printer.printerId}
                      className="flex items-center gap-3 py-2 hover:bg-gray-50 px-2 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={formData.accessPrinters.includes(
                          printer.printerId,
                        )}
                        onChange={() => togglePrinter(printer.printerId)}
                        className="rounded text-purple-600 focus:ring-purple-500"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">
                          {printer.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {printer.location?.city || "Lokasi tidak tersedia"}
                        </p>
                      </div>
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Tidak ada printer tersedia
                  </p>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={processing}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Memproses...</span>
              </div>
            ) : user ? (
              "Update"
            ) : (
              "Simpan"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
