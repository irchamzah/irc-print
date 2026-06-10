export const SubmitButton = ({
  isLoading,
  advancedSettings,
  onSubmit,
  isPrinterOffline = false,
  userSession = null,
  isPaperInsufficient = false,
  availablePaper = 0,
  totalPagesNeeded = 0,
  paperMode = "limited",
  isPaperSizeMismatch = false,
  printerActivePaperSize = null,
  detectedPDFSize = null,
}) => {
  if (!advancedSettings) return null;

  // CEK JIKA USER SESSION KOSONG
  const isUserNotLoggedIn = !userSession?.phone;

  // ✅ Logika untuk Unlimited Mode: Abaikan pengecekan kertas
  const isUnlimitedMode = paperMode === "unlimited";
  const showPaperWarning = !isUnlimitedMode && isPaperInsufficient;
  const costValue = advancedSettings.cost || 0;

  if (costValue <= 0) return null;

  const isDisabled =
    isLoading ||
    isPrinterOffline ||
    isUserNotLoggedIn ||
    (!isUnlimitedMode && isPaperInsufficient) ||
    (!isUnlimitedMode && isPaperSizeMismatch) ||
    totalPagesNeeded <= 0;

  // Fungsi handle click dengan confirmation
  const handleClickWithWarning = (e) => {
    e.preventDefault();

    const confirmationMessage =
      "🚨 PERINGATAN!!!\n\n" +
      "SETELAH MEMBAYAR, PRINTER AKAN MULAI MENCETAK!\n" +
      "HARAP KERTAS SEGERA DIAMBIL!\n\n" +
      "Apakah Anda yakin ingin melanjutkan pembayaran?";

    if (window.confirm(confirmationMessage)) {
      onSubmit(e);
    }
  };

  // Teks untuk tombol ketika kertas tidak cukup (hanya untuk limited mode)
  const getInsufficientText = () => {
    if (isUnlimitedMode) return null;
    return (
      <div className="flex items-center justify-center">
        <span className="mr-2">📄</span>
        Kertas Tidak Cukup
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {/* Warning untuk Printer Offline */}
      {isPrinterOffline && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
          <p className="text-red-700 text-sm font-medium">
            ⚠️ Printer sedang offline. Tidak dapat melakukan print saat ini.
          </p>
          <p className="text-red-600 text-xs mt-1">
            Silakan coba lagi nanti atau pilih printer lain.
          </p>
        </div>
      )}

      {/* ✅ Warning untuk Kertas Tidak Cukup (hanya untuk limited mode) */}
      {showPaperWarning && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
          <p className="text-orange-700 text-sm font-medium">
            ⚠️ Kertas tidak cukup
          </p>
          <p className="text-orange-600 text-xs mt-1">
            Butuh {totalPagesNeeded} halaman, tersedia {availablePaper} halaman
          </p>
        </div>
      )}

      {/* Warning untuk ukuran kertas tidak sesuai (limited mode) */}
      {!isUnlimitedMode && isPaperSizeMismatch && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
          <p className="text-red-700 text-sm font-medium">
            ❌ Ukuran kertas tidak sesuai
          </p>
          <p className="text-red-600 text-xs mt-1">
            Printer terpasang kertas{" "}
            <span className="font-semibold">{printerActivePaperSize}</span>,
            sedangkan file PDF berukuran{" "}
            <span className="font-semibold">{detectedPDFSize}</span>. Ganti
            kertas atau upload file PDF yang sesuai.
          </p>
        </div>
      )}

      {/* ✅ Info untuk Unlimited Mode */}
      {/* {isUnlimitedMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
          <p className="text-blue-700 text-sm font-medium">♾️ Mode Unlimited</p>
          <p className="text-blue-600 text-xs mt-1">
            Printer ini tidak memerlukan isi ulang kertas. Stok selalu tersedia.
          </p>
        </div>
      )} */}

      {/* Warning untuk User Belum Login */}
      {isUserNotLoggedIn && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
          <p className="text-yellow-700 text-sm font-medium">
            🔐 Harus Login terlebih dahulu
          </p>
          <p className="text-yellow-600 text-xs mt-1">
            Masukkan nomor HP dan klik &quot;Login&quot; untuk melanjutkan
            pembayaran
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={isDisabled}
        onClick={handleClickWithWarning}
        className={`w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed text-lg ${
          isPrinterOffline || isUserNotLoggedIn || showPaperWarning
            ? "opacity-60"
            : "cursor-pointer"
        }`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
            Memproses...
          </div>
        ) : isPrinterOffline ? (
          <div className="flex items-center justify-center">
            <span className="mr-2">🚫</span>
            Printer Offline
          </div>
        ) : isUserNotLoggedIn ? (
          <div className="flex items-center justify-center">
            <span className="mr-2">🔐</span>
            Harus Login
          </div>
        ) : showPaperWarning ? (
          getInsufficientText()
        ) : (
          "💳 Bayar dan Print"
        )}
      </button>
    </div>
  );
};
