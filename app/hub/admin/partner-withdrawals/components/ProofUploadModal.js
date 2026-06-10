"use client";
import { useState } from "react";

export const ProofUploadModal = ({
  isOpen,
  onClose,
  onConfirm,
  withdrawal,
  processing,
  formatRupiah,
}) => {
  const [notes, setNotes] = useState("");
  const [proofFile, setProofFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  if (!isOpen || !withdrawal) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProofFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!proofFile) {
      alert("Silakan upload bukti transfer terlebih dahulu");
      return;
    }

    const formData = new FormData();
    formData.append("proof", proofFile);
    formData.append(
      "status",
      withdrawal.status === "requested" ? "processed" : "transferred",
    );
    if (notes) {
      formData.append("notes", notes);
    }

    onConfirm(formData);
  };

  const getActionText = () => {
    if (withdrawal.status === "requested") return "Memproses";
    if (withdrawal.status === "processed") return "Transfer";
    return "Proses";
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">
            Upload Bukti Transfer
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
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <p className="text-sm text-blue-700">Detail Penarikan:</p>
            <p className="text-xs text-blue-600 mt-1">
              Partner: {withdrawal.partnerName}
            </p>
            <p className="text-xs text-blue-600">
              Jumlah: {formatRupiah(withdrawal.totalAmount)}
            </p>
            <p className="text-xs text-blue-600">Aksi: {getActionText()}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bukti Transfer *
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              Upload screenshot bukti transfer (JPG, PNG, GIF, WEBP - maks 5MB)
            </p>
          </div>

          {previewUrl && (
            <div className="mt-2">
              <p className="text-xs text-gray-600 mb-1">Preview:</p>
              <img
                src={previewUrl}
                alt="Preview"
                className="max-h-32 rounded-lg border border-gray-200"
              />
            </div>
          )}

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
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={processing}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {processing ? "Memproses..." : "Konfirmasi & Upload"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
