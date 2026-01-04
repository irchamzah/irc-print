// app/printers/[printerId]/components/TotalCostSection.js
export const TotalCostSection = ({ advancedSettings, totalPages }) => {
  if (!advancedSettings.cost || advancedSettings.cost <= 0) {
    return null;
  }

  const selectedCount = advancedSettings.selectedPages?.length || totalPages;
  const bwPages = advancedSettings.bwPages?.length || 0;
  const copies = advancedSettings.copies || 1;
  const colorPages = advancedSettings.colorPages?.length || 0;

  // Hitung total lembar
  const totalBwSheets = bwPages * copies;
  const totalColorSheets = colorPages * copies;
  const totalSheets = totalColorSheets + totalBwSheets;

  // Tentukan apakah ada diskon
  const hasBwDiscount = totalBwSheets >= 10;
  const bwPricePerPage = hasBwDiscount ? 200 : 400;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
      {/* Header Section */}
      <div className="mb-4 pb-4 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-1">
              Total Biaya
            </h3>
            <p className="text-gray-600 text-sm">
              {selectedCount} halaman × {copies} rangkap
            </p>
          </div>

          <div className="text-right">
            <p className="text-2xl sm:text-3xl font-bold text-green-600">
              Rp {advancedSettings.cost.toLocaleString("id-ID")}
            </p>
            {hasBwDiscount && (
              <p className="text-xs sm:text-sm text-blue-600 mt-1">
                ✓ Diskon diterapkan
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Detail Breakdown */}
      <div className="mb-4 space-y-3">
        {/* Total Lembar */}
        <div className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-lg">
          <span className="text-sm text-gray-700">Total lembar dicetak</span>
          <span className="text-sm font-semibold text-gray-800">
            {totalSheets} lembar
          </span>
        </div>

        {/* Detail Warna */}
        {colorPages > 0 && (
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></div>
              <span className="text-sm text-gray-700">Warna</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-800">
                {colorPages} halaman × {copies} = {totalColorSheets} lembar
              </p>
              <p className="text-xs text-gray-500">@ Rp 1.500/lembar</p>
            </div>
          </div>
        )}

        {/* Detail BW */}
        {bwPages > 0 && (
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-gray-600 mr-2"></div>
              <div>
                <span className="text-sm text-gray-700">Hitam Putih</span>
                {hasBwDiscount && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                    Diskon
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-800">
                {bwPages} halaman × {copies} = {totalBwSheets} lembar
              </p>
              <p className="text-xs text-gray-500">
                @ Rp {bwPricePerPage.toLocaleString()}/lembar
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Info Diskon */}
      {bwPages > 0 && (
        <div
          className={`mt-4 pt-4 border-t ${
            hasBwDiscount
              ? "border-blue-100 bg-blue-50"
              : "border-gray-100 bg-gray-50"
          } rounded-lg px-3 py-2`}
        >
          <div className="flex items-start">
            <div
              className={`flex-shrink-0 mt-0.5 mr-2 ${
                hasBwDiscount ? "text-blue-600" : "text-gray-500"
              }`}
            >
              {hasBwDiscount ? (
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
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
              )}
            </div>
            <div>
              <p
                className={`text-xs font-medium ${
                  hasBwDiscount ? "text-blue-800" : "text-gray-700"
                }`}
              >
                {hasBwDiscount
                  ? `Diskon BW aktif! ${totalBwSheets} lembar ≥ 10`
                  : `Butuh ${10 - totalBwSheets} lembar lagi untuk diskon`}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {hasBwDiscount
                  ? "Harga Rp 200/lembar (normal Rp 400)"
                  : "Harga akan turun menjadi Rp 200/lembar untuk print Hitam Putih"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer - Halaman Dipilih */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Halaman dipilih:</span>
          <span className="font-medium text-gray-800">
            {selectedCount} dari {totalPages}
          </span>
        </div>
      </div>
    </div>
  );
};
