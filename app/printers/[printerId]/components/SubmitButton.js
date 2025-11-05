export const SubmitButton = ({
  isLoading,
  advancedSettings,
  onSubmit,
  isPrinterOffline = false,
  userSession = null,
  isPaperInsufficient = false, // ✅ TAMBAH INI
  availablePaper = 0, // ✅ TAMBAH INI
  totalPagesNeeded = 0, // ✅ TAMBAH INI
}) => {
  if (!advancedSettings.cost || advancedSettings.cost <= 0) {
    return null;
  }

  // ✅ CEK JIKA USER SESSION KOSONG
  const isUserNotLoggedIn = !userSession?.phone;

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

      <button
        type="submit"
        disabled={
          isLoading ||
          isPrinterOffline ||
          isUserNotLoggedIn ||
          isPaperInsufficient
        } // ✅ TAMBAH isPaperInsufficient
        onClick={onSubmit}
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
        ) : isPaperInsufficient ? ( // ✅ TAMBAH CONDITION INI
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
