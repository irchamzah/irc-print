// TotalCostSection - UPDATED dengan finalPrices
export const TotalCostSection = ({
  advancedSettings,
  totalPages,
  finalPrices,
}) => {
  // Always render the cost section; show placeholder when cost not calculated yet
  const costValue = advancedSettings.cost || 0;
  if (costValue <= 0) return null;

  const selectedCount = advancedSettings.selectedPages?.length || totalPages;
  const bwPages = advancedSettings.bwPages?.length || 0;
  const copies = advancedSettings.copies || 1;
  const colorPages = advancedSettings.colorPages?.length || 0;
  const paperSize = advancedSettings.paperSize || "A4";

  const totalSheets = (colorPages + bwPages) * copies;

  // ✅ UPDATE: Gunakan finalPrices dari struktur baru
  const colorPrice = finalPrices?.color?.[paperSize] || 1500;
  const bwPrice = finalPrices?.monochrome?.[paperSize] || 500;

  // ✅ UPDATE: Volume discounts dari printer (discountFlat berlaku untuk semua jenis halaman)
  const volumeDiscounts = advancedSettings.volumeDiscounts || [];
  let discountFlat = 0;
  let nextTier = null;

  if (volumeDiscounts.length > 0) {
    const sortedTiers = [...volumeDiscounts].sort((a, b) => a.minSheets - b.minSheets);
    for (let i = 0; i < sortedTiers.length; i++) {
      if (totalSheets >= sortedTiers[i].minSheets) {
        discountFlat = sortedTiers[i].discountFlat || 0;
        nextTier = sortedTiers[i + 1] || null;
      }
    }
  }

  const effectiveBwPrice = Math.max(0, bwPrice - discountFlat);
  const effectiveColorPrice = Math.max(0, colorPrice - discountFlat);
  const sheetsNeeded = nextTier ? nextTier.minSheets - totalSheets : 0;
  const nextFlat = nextTier ? nextTier.discountFlat || 0 : 0;
  const nextTierBwPrice = Math.max(0, bwPrice - nextFlat);
  const nextTierColorPrice = Math.max(0, colorPrice - nextFlat);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      {/* Total */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-semibold">Total Biaya</h3>
          <p className="text-xs text-gray-500">
            {selectedCount} hlm × {copies} rangkap
          </p>
        </div>
        <p className="text-2xl font-bold text-green-600">
          Rp {costValue.toLocaleString()}
        </p>
      </div>

      {/* Harga per lembar */}
      <div className="space-y-2 text-sm mb-3">
        <div className="flex justify-between items-start">
          <span>🟡 Warna ({paperSize})</span>
          <div className="text-right">
            <span>Rp {effectiveColorPrice.toLocaleString()}/lbr</span>
            {nextTier && (
              <p className="text-xs text-blue-600">
                +{sheetsNeeded} lbr lagi → Rp {nextTierColorPrice.toLocaleString()}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-between items-start">
          <span>⚫ Hitam Putih ({paperSize})</span>
          <div className="text-right">
            <span className="font-medium">
              Rp {effectiveBwPrice.toLocaleString()}/lbr
            </span>
            {nextTier && (
              <p className="text-xs text-blue-600">
                +{sheetsNeeded} lbr lagi → Rp {nextTierBwPrice.toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Info total */}
      <div className="text-xs text-gray-500 pt-2 border-t">
        {totalSheets} lembar ({colorPages} warna, {bwPages} hitam putih)
      </div>
    </div>
  );
};
