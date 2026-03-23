// app/printers/[printerId]/components/TotalCostSection.js

// TotalCostSection TERPAKAI
export const TotalCostSection = ({ advancedSettings, totalPages, prices }) => {
  if (!advancedSettings.cost || advancedSettings.cost <= 0) {
    return null;
  }

  const selectedCount = advancedSettings.selectedPages?.length || totalPages;
  const bwPages = advancedSettings.bwPages?.length || 0;
  const copies = advancedSettings.copies || 1;
  const colorPages = advancedSettings.colorPages?.length || 0;

  const totalSheets = (colorPages + bwPages) * copies;
  const colorPrice = prices?.color?.A4 || 1500;

  // Cari harga BW dan tier selanjutnya
  let bwPrice = 500;
  let nextTier = null;

  if (prices?.bwTiers) {
    const sortedTiers = [...prices.bwTiers].sort(
      (a, b) => a.minSheets - b.minSheets,
    );

    for (let i = 0; i < sortedTiers.length; i++) {
      if (totalSheets >= sortedTiers[i].minSheets) {
        bwPrice = sortedTiers[i].price;
        nextTier = sortedTiers[i + 1];
      }
    }
  }

  const sheetsNeeded = nextTier ? nextTier.minSheets - totalSheets : 0;

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
          Rp {advancedSettings.cost.toLocaleString()}
        </p>
      </div>

      {/* Harga per lembar */}
      <div className="space-y-2 text-sm mb-3">
        <div className="flex justify-between">
          <span>🟡 Warna</span>
          <span>Rp {colorPrice.toLocaleString()}/lbr</span>
        </div>

        <div className="flex justify-between items-start">
          <span>⚫ Hitam Putih</span>
          <div className="text-right">
            <span className="font-medium">
              Rp {bwPrice.toLocaleString()}/lbr
            </span>
            {nextTier && (
              <p className="text-xs text-blue-600">
                +{sheetsNeeded} lbr lagi → Rp {nextTier.price}
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
