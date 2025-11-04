export const SubmitButton = ({
  isLoading,
  advancedSettings,
  onSubmit,
  isPrinterOffline = false,
}) => {
  if (!advancedSettings.cost || advancedSettings.cost <= 0) {
    return null;
  }

  return (
    <div className="space-y-2">
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

      <button
        type="submit"
        disabled={isLoading || isPrinterOffline}
        onClick={onSubmit}
        className={`w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed text-lg ${
          isPrinterOffline ? "opacity-60" : "cursor-pointer"
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
        ) : (
          "💳 Bayar dan Print"
        )}
      </button>
    </div>
  );
};
