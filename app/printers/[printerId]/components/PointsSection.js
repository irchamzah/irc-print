import { useEffect, useState } from "react";

export const PointsSection = ({
  userSession,
  userPoints,
  phoneNumber = "",
  checkingPoints,
  refreshingPoints,
  advancedSettings,
  onCheckPoints,
  onRefreshPoints,
  onLogout,
  onPhoneNumberChange,
}) => {
  const [localPhoneNumber, setLocalPhoneNumber] = useState(phoneNumber);

  useEffect(() => {
    setLocalPhoneNumber(phoneNumber);
  }, [phoneNumber]);

  const handleLocalPhoneChange = (e) => {
    const value = e.target.value;
    setLocalPhoneNumber(value);
    if (onPhoneNumberChange) onPhoneNumberChange(value);
  };

  const handleCheckPoints = () => {
    if (onCheckPoints && onPhoneNumberChange) {
      onPhoneNumberChange(localPhoneNumber);
      setTimeout(() => onCheckPoints(), 100);
    } else if (onCheckPoints) {
      onCheckPoints();
    }
  };

  // Login Form (User belum login)
  if (!userSession) {
    return (
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-800 flex items-center">
            <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center mr-2">
              <svg
                className="w-4 h-4 text-white"
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
            </div>
            Login
          </h3>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Masukkan nomor HP
            </label>
            <div className="flex gap-2">
              <input
                type="tel"
                value={localPhoneNumber}
                onChange={handleLocalPhoneChange}
                placeholder="085117038583"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-black focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-sm"
              />
              <button
                type="button"
                onClick={handleCheckPoints}
                disabled={checkingPoints}
                className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 disabled:bg-yellow-300 text-sm font-medium min-w-[80px]"
              >
                {checkingPoints ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>
                ) : (
                  "Login"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // User sudah login
  return (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200 p-4">
      {/* Header dengan info user dan tombol aksi */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center">
            <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center mr-2">
              <svg
                className="w-4 h-4 text-white"
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
            </div>
            <h3 className="text-base font-semibold text-gray-800">Akun Anda</h3>
          </div>
          <p className="text-xs text-gray-500 mt-1 truncate max-w-[180px] sm:max-w-none">
            {userSession.phone}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onRefreshPoints}
            disabled={refreshingPoints}
            type="button"
            className="px-2.5 py-1 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 disabled:opacity-50 text-xs flex items-center gap-1"
          >
            {refreshingPoints ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                <span>Loading</span>
              </>
            ) : (
              <>
                <svg
                  className="w-3 h-3"
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
                <span>Refresh</span>
              </>
            )}
          </button>

          <button
            onClick={onLogout}
            className="px-2.5 py-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200 text-xs flex items-center gap-1"
          >
            <svg
              className="w-3 h-3"
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
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Points Display - Kompak */}
      <div className="bg-white rounded-md border border-yellow-200 p-3 mb-3">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-xs text-gray-500">Total Point:</span>
            <span className="text-lg font-bold text-yellow-600">
              {typeof userPoints === "number" ? userPoints.toFixed(2) : "0.00"}
            </span>
          </div>

          <button
            onClick={() =>
              window.open("https://irc-store-one.vercel.app/product", "_blank")
            }
            type="button"
            className="w-full px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md hover:from-purple-600 hover:to-pink-600 text-sm font-medium mt-2"
          >
            Tukar Point
          </button>
        </div>
      </div>

      {/* Points yang akan didapat */}
      {advancedSettings.cost > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-md border border-green-200 p-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-700">Point akan ditambah:</span>
            <span className="text-sm font-bold text-green-600">
              +{(advancedSettings.cost / 4000).toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
