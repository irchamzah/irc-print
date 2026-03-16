"use client";

export const PaperStatusCard = ({
  paperCount,
  lastRefill,
  onRefill,
  loading,
  showSuccess,
  formatDate,
}) => {
  // Constants
  const MAX_PAPER = 100;
  const REFILL_AMOUNT = 80;
  const isNearMax = paperCount > 20; // Jika sisa >20, tidak bisa isi ulang karena akan melebihi 100
  const remainingToMax = MAX_PAPER - paperCount;
  const canRefill = !isNearMax && remainingToMax >= REFILL_AMOUNT;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isNearMax ? "bg-yellow-100" : "bg-green-100"
            }`}
          >
            <svg
              className={`w-6 h-6 ${
                isNearMax ? "text-yellow-600" : "text-green-600"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-500">Sisa Kertas</p>
            <p className="text-3xl font-bold text-gray-800">
              {paperCount} / {MAX_PAPER}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    isNearMax ? "bg-yellow-500" : "bg-green-500"
                  }`}
                  style={{ width: `${(paperCount / MAX_PAPER) * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">
                {Math.round((paperCount / MAX_PAPER) * 100)}%
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Terakhir diisi: {formatDate(lastRefill)}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:items-end gap-2">
          {/* Tombol Isi Ulang */}
          <button
            onClick={onRefill}
            disabled={loading || !canRefill}
            className={`px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 min-w-[200px] transition-all ${
              canRefill
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            title={
              !canRefill
                ? isNearMax
                  ? "Kapasitas hampir penuh"
                  : `Tidak cukup ruang (butuh ${REFILL_AMOUNT - remainingToMax} lembar lagi)`
                : "Isi ulang kertas"
            }
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span>Isi Ulang Kertas (+{REFILL_AMOUNT})</span>
              </>
            )}
          </button>

          {/* Info sisa kapasitas */}
          {canRefill && (
            <p className="text-xs text-gray-500 text-center sm:text-right">
              Sisa kapasitas: {remainingToMax} lembar
            </p>
          )}

          {/* Success message */}
          {showSuccess && (
            <div className="text-sm text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
              ✅ Kertas berhasil ditambahkan!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
