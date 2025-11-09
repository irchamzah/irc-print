export const SubmitButton = ({
  isLoading,
  advancedSettings,
  onSubmit,
  isPrinterOffline = false,
  userSession = null,
  isPaperInsufficient = false,
  availablePaper = 0,
  totalPagesNeeded = 0,
}) => {
  if (
    !advancedSettings.cost ||
    advancedSettings.cost <= 0 ||
    totalPagesNeeded <= 0
  ) {
    return null;
  }

  // ✅ CEK JIKA USER SESSION KOSONG
  const isUserNotLoggedIn = !userSession?.phone;

  // ✅ FUNCTION BARU: Handle click dengan confirmation
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

      {/* ✅ Warning untuk Kertas Tidak Cukup */}
      {isPaperInsufficient && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
          <p className="text-orange-700 text-sm font-medium">
            ⚠️ Kertas tidak cukup
          </p>
          <p className="text-orange-600 text-xs mt-1">
            Butuh {totalPagesNeeded} halaman, tersedia {availablePaper} halaman
          </p>
        </div>
      )}

      {/* ✅ Warning untuk User Belum Login */}
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

      {/* ✅ PERINGATAN PENTING - Selalu tampilkan */}
      {/* {!isPrinterOffline && !isPaperInsufficient && !isUserNotLoggedIn && (
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 text-center animate-pulse">
          <div className="flex items-center justify-center gap-2 mb-2">
            <svg
              className="w-5 h-5 text-red-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-red-700 text-sm font-bold uppercase">PENTING!</p>
          </div>
          <p className="text-red-600 text-sm font-medium">
            SETELAH MEMBAYAR, PRINTER AKAN LANGSUNG MENCETAK!
          </p>
          <p className="text-red-500 text-xs mt-1">
            Harap siap mengambil kertas setelah pembayaran berhasil
          </p>
        </div>
      )} */}

      <button
        type="submit"
        disabled={
          isLoading ||
          isPrinterOffline ||
          isUserNotLoggedIn ||
          isPaperInsufficient
        }
        onClick={handleClickWithWarning} // ✅ GUNAKAN FUNCTION BARU
        className={`w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed text-lg ${
          isPrinterOffline || isUserNotLoggedIn || isPaperInsufficient
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
        ) : isPaperInsufficient ? (
          <div className="flex items-center justify-center">
            <span className="mr-2">📄</span>
            Kertas Tidak Cukup
          </div>
        ) : isUserNotLoggedIn ? (
          <div className="flex items-center justify-center">
            <span className="mr-2">🔐</span>
            Harus Login
          </div>
        ) : (
          "💳 Bayar dan Print"
        )}
      </button>
    </div>
  );
};
