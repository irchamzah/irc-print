import { useEffect, useState } from "react";

export const PointsSection = ({
  userSession,
  userPoints,
  phoneNumber = "", // ← DEFAULT VALUE
  checkingPoints,
  refreshingPoints,
  advancedSettings,
  onCheckPoints,
  onRefreshPoints,
  onLogout,
  onPhoneNumberChange,
}) => {
  // Local state fallback
  const [localPhoneNumber, setLocalPhoneNumber] = useState(phoneNumber);

  // Sync dengan prop phoneNumber
  useEffect(() => {
    setLocalPhoneNumber(phoneNumber);
  }, [phoneNumber]);

  const handleLocalPhoneChange = (e) => {
    const value = e.target.value;
    setLocalPhoneNumber(value);

    // Panggil parent handler jika ada
    if (onPhoneNumberChange) {
      onPhoneNumberChange(value);
    }
  };

  const handleCheckPoints = () => {
    // Gunakan localPhoneNumber untuk check points
    if (onCheckPoints && onPhoneNumberChange) {
      // Update parent state dulu
      onPhoneNumberChange(localPhoneNumber);
      // Lalu check points
      setTimeout(() => onCheckPoints(), 100);
    } else if (onCheckPoints) {
      onCheckPoints();
    }
  };

  if (!userSession) {
    return (
      <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4 sm:p-6 lg:p-6">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-5 flex items-center">
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-yellow-600 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          Point Reward
        </h3>

        <div className="space-y-4 sm:space-y-5">
          <div>
            <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2 sm:mb-3">
              Nomor HP untuk Cek Poin
            </label>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <input
                type="tel"
                value={localPhoneNumber}
                onChange={handleLocalPhoneChange}
                placeholder="Contoh: 085117038583"
                className="flex-1 p-3 sm:p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white text-gray-700 text-sm sm:text-base"
              />
              <button
                type="button"
                onClick={handleCheckPoints}
                disabled={checkingPoints}
                className="px-4 sm:px-6 py-3 sm:py-4 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:bg-yellow-400 transition-colors font-medium cursor-pointer text-sm sm:text-base flex items-center justify-center min-w-[120px] sm:min-w-[140px]"
              >
                {checkingPoints ? (
                  <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                ) : (
                  "Check Point"
                )}
              </button>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mt-2 sm:mt-3">
              Masukkan nomor HP untuk melihat dan mendapatkan poin
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4 sm:p-6 lg:p-6">
      <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-5 flex items-center">
        <svg
          className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-yellow-600 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
        Point Reward
      </h3>

      <div className="space-y-4 sm:space-y-5">
        {/* User Info Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
          <div className="flex-1">
            <p className="text-sm sm:text-base text-gray-600 mb-1">
              Nomor HP terdaftar:
            </p>
            <p className="font-semibold text-gray-800 text-base sm:text-lg break-all">
              {userSession.phone}
            </p>
          </div>
          <div className="flex gap-2 sm:gap-3 self-start sm:self-center">
            <button
              onClick={onRefreshPoints}
              disabled={refreshingPoints}
              type="button"
              className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:bg-blue-50 transition-colors cursor-pointer flex items-center gap-1 sm:gap-2"
              title="Refresh point terbaru"
            >
              {refreshingPoints ? (
                <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-blue-700"></div>
              ) : (
                <svg
                  className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              )}
              <span className="sm:inline">Refresh</span>
            </button>
            <button
              onClick={onLogout}
              className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors cursor-pointer flex items-center gap-1 sm:gap-2"
            >
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span className="sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Points Display Card */}
        <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 border-2 border-yellow-200 shadow-sm">
          <div className="text-center">
            <p className="text-sm sm:text-base text-gray-600 mb-2">
              Total Point Anda
            </p>
            <p className="text-2xl sm:text-4xl lg:text-5xl font-bold text-yellow-600 mb-4 sm:mb-6">
              {typeof userPoints === "number" ? userPoints.toFixed(2) : "0.00"}{" "}
              <span className="text-lg sm:text-xl lg:text-2xl text-yellow-500">
                Point
              </span>
            </p>

            <button
              onClick={() =>
                window.open(
                  "https://irc-store-one.vercel.app/product",
                  "_blank"
                )
              }
              type="button"
              className="w-full max-w-xs mx-auto px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 font-medium text-sm sm:text-base cursor-pointer flex items-center justify-center gap-2 sm:gap-3 shadow-lg"
            >
              ⭐ Tukar Point
            </button>

            <p className="text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4">
              Terakhir update: {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Points Earned Preview */}
        {advancedSettings.cost > 0 && userSession && (
          <div className="bg-green-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-green-200">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4">
              <span className="text-sm sm:text-base text-gray-700 text-center sm:text-left">
                Point yang akan didapat:
              </span>
              <span className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600 text-center sm:text-right">
                +{(advancedSettings.cost / 2000).toFixed(2)} poin
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
