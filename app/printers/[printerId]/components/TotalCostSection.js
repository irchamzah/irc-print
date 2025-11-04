export const TotalCostSection = ({ advancedSettings, totalPages }) => {
  if (!advancedSettings.cost || advancedSettings.cost <= 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 p-4 sm:p-6 lg:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 lg:gap-6">
        {/* Left Section - Text Info */}
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 mb-1 sm:mb-2">
            Total Biaya
          </h3>
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
            {totalPages} halaman × {advancedSettings.copies} rangkap
          </p>
        </div>

        {/* Right Section - Price */}
        <div className="text-center sm:text-right">
          <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-600 mb-1">
            Rp {advancedSettings.cost.toLocaleString("id-ID")}
          </p>
        </div>
      </div>
    </div>
  );
};
