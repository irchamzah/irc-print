// app/printers/[printerId]/hooks/usePageSelection.js
import { useEffect, useState } from "react";

// usePageSelection TERPAKAI
export const usePageSelection = (
  totalPages,
  initialSettings,
  onSettingsChange,
  prices,
) => {
  const [selections, setSelections] = useState([]);
  const [selectedPages, setSelectedPages] = useState([]);
  const [visiblePages, setVisiblePages] = useState(6);
  const [renderErrors, setRenderErrors] = useState({});
  const [printSettings, setPrintSettings] = useState(
    initialSettings.printSettings || {
      paperSize: "A4",
      orientation: "PORTRAIT",
      quality: "NORMAL",
      margins: "NORMAL",
      duplex: false,
    },
  );

  // Initialize selections
  useEffect(() => {
    if (!prices) {
      return;
    }

    const initialSelections = Array.from({ length: totalPages }, (_, i) => ({
      page: i + 1,
      type: initialSettings?.colorPages?.includes(i + 1)
        ? "color"
        : initialSettings?.bwPages?.includes(i + 1)
          ? "bw"
          : "bw",
      selected: true,
    }));
    setSelections(initialSelections);
    setSelectedPages(Array.from({ length: totalPages }, (_, i) => i + 1));

    if (initialSelections.length > 0) {
      const initialCost = calculateCostWithSettings(
        initialSelections,
        initialSettings.copies || 1,
        printSettings,
        prices,
      );
      notifyParent(
        initialSelections,
        initialSettings.copies || 1,
        printSettings,
        initialCost,
      );
    }
  }, [totalPages, prices]);

  // 🌐 handlePageSelection /app/printers/[printerId]/hooks/usePageSelection.js TERPAKAI
  const handlePageSelection = (pageNumber, isSelected) => {
    if (!prices) return;

    const newSelections = selections.map((sel) =>
      sel.page === pageNumber ? { ...sel, selected: isSelected } : sel,
    );
    setSelections(newSelections);

    const updatedSelectedPages = newSelections
      .filter((sel) => sel.selected)
      .map((sel) => sel.page);
    setSelectedPages(updatedSelectedPages);

    // Hitung ulang cost hanya untuk halaman yang terpilih
    const cost = calculateCostWithSettings(
      newSelections.filter((sel) => sel.selected),
      initialSettings.copies || 1,
      printSettings,
      prices,
    );

    // Notify parent hanya dengan halaman yang terpilih
    const selectedColorPages = newSelections
      .filter((sel) => sel.selected && sel.type === "color")
      .map((sel) => sel.page);
    const selectedBwPages = newSelections
      .filter((sel) => sel.selected && sel.type === "bw")
      .map((sel) => sel.page);

    onSettingsChange({
      colorPages: selectedColorPages,
      bwPages: selectedBwPages,
      copies: initialSettings.copies || 1,
      printSettings,
      cost,
      selectedPages: updatedSelectedPages,
    });
  };

  // 🌐 selectAllPages /app/printers/[printerId]/hooks/usePageSelection.js TERPAKAI
  const selectAllPages = () => {
    if (!prices) return;

    const newSelections = selections.map((sel) => ({ ...sel, selected: true }));
    setSelections(newSelections);
    setSelectedPages(Array.from({ length: totalPages }, (_, i) => i + 1));

    const cost = calculateCostWithSettings(
      newSelections.filter((sel) => sel.selected),
      initialSettings.copies || 1,
      printSettings,
      prices,
    );

    const selectedColorPages = newSelections
      .filter((sel) => sel.selected && sel.type === "color")
      .map((sel) => sel.page);
    const selectedBwPages = newSelections
      .filter((sel) => sel.selected && sel.type === "bw")
      .map((sel) => sel.page);

    onSettingsChange({
      colorPages: selectedColorPages,
      bwPages: selectedBwPages,
      copies: initialSettings.copies || 1,
      printSettings,
      cost,
      selectedPages: Array.from({ length: totalPages }, (_, i) => i + 1),
    });
  };

  // 🌐 deselectAllPages /app/printers/[printerId]/hooks/usePageSelection.js TERPAKAI
  const deselectAllPages = () => {
    const newSelections = selections.map((sel) => ({
      ...sel,
      selected: false,
    }));
    if (!prices) return;

    setSelections(newSelections);
    setSelectedPages([]);

    const cost = calculateCostWithSettings(
      newSelections.filter((sel) => sel.selected),
      initialSettings.copies || 1,
      printSettings,
      prices,
    );

    onSettingsChange({
      colorPages: [],
      bwPages: [],
      copies: initialSettings.copies || 1,
      printSettings,
      cost: 0,
      selectedPages: [],
    });
  };

  // 🌐 calculateBwPriceFromTiers /app/printers/[printerId]/hooks/usePageSelection.js TERPAKAI
  const calculateBwPriceFromTiers = (totalSheets, bwTiers) => {
    if (!bwTiers || bwTiers.length === 0) {
      return 500; // Default
    }

    // Urutkan tiers dari minSheets terbesar ke terkecil
    const sortedTiers = [...bwTiers].sort((a, b) => b.minSheets - a.minSheets);

    // Cari tier dengan minSheets yang paling besar tapi masih <= totalSheets
    for (const tier of sortedTiers) {
      if (totalSheets >= tier.minSheets) {
        return tier.price;
      }
    }

    // Fallback ke tier pertama (paling kecil)
    return bwTiers[0]?.price || 500;
  };

  // 🌐 calculateCostWithSettings /app/printers/[printerId]/hooks/usePageSelection.js TERPAKAI
  const calculateCostWithSettings = (selections, copies, settings, prices) => {
    if (!prices) return 0;

    const selectedSelections = selections.filter((sel) => sel.selected);
    const colorPages = selectedSelections.filter(
      (s) => s.type === "color",
    ).length;
    const bwPages = selectedSelections.filter((s) => s.type === "bw").length;

    const paperSize = settings.paperSize || "A4";
    const quality = settings.quality || "NORMAL";

    // Hitung TOTAL LEMBAR (warna + BW)
    const totalSheets = (colorPages + bwPages) * copies;

    const colorCostPerPage = prices?.color?.[paperSize] || 1500;

    let bwCostPerPage;
    if (paperSize === "A4") {
      // Gunakan totalSheets untuk menentukan harga BW
      if (prices?.bwTiers) {
        bwCostPerPage = calculateBwPriceFromTiers(totalSheets, prices.bwTiers);
      } else {
        bwCostPerPage = prices?.bw?.[paperSize] || 500;
      }
    } else {
      bwCostPerPage = prices?.bw?.[paperSize] || 500;
    }

    const qualitySurcharge = prices?.additionalFees?.highQuality || 0;

    const totalColorCost = colorPages * (colorCostPerPage + qualitySurcharge);
    const totalBwCost = bwPages * (bwCostPerPage + qualitySurcharge);

    return (totalColorCost + totalBwCost) * copies;
  };

  // 🌐 notifyParent /app/printers/[printerId]/hooks/usePageSelection.js TERPAKAI
  const notifyParent = (selections, copies, settings, cost) => {
    const selectedSelections = selections.filter((sel) => sel.selected);
    const colorPages = selectedSelections
      .filter((s) => s.type === "color")
      .map((s) => s.page);
    const bwPages = selectedSelections
      .filter((s) => s.type === "bw")
      .map((s) => s.page);

    const selectedPages = selectedSelections.map((s) => s.page);

    onSettingsChange({
      colorPages,
      bwPages,
      copies,
      printSettings: settings,
      cost,
      selectedPages,
    });
  };

  // 🌐 handlePageTypeChange /app/printers/[printerId]/hooks/usePageSelection.js TERPAKAI
  const handlePageTypeChange = (pageNumber, type) => {
    if (!prices) return;

    const newSelections = selections.map((sel) =>
      sel.page === pageNumber ? { ...sel, type } : sel,
    );
    setSelections(newSelections);

    const selectedSelections = newSelections.filter((sel) => sel.selected);
    const cost = calculateCostWithSettings(
      selectedSelections,
      initialSettings.copies || 1,
      printSettings,
      prices,
    );

    notifyParent(
      newSelections,
      initialSettings.copies || 1,
      printSettings,
      cost,
    );
  };

  // 🌐 setAllPages /app/printers/[printerId]/hooks/usePageSelection.js TERPAKAI
  const setAllPages = (type) => {
    const newSelections = selections.map((sel) => ({
      ...sel,
      type: type,
    }));
    if (!prices) return;

    setSelections(newSelections);

    const selectedSelections = newSelections.filter((sel) => sel.selected);
    const cost = calculateCostWithSettings(
      selectedSelections,
      initialSettings.copies || 1,
      printSettings,
      prices,
    );

    notifyParent(
      newSelections,
      initialSettings.copies || 1,
      printSettings,
      cost,
    );
  };

  // 🌐 handleRenderError /app/printers/[printerId]/hooks/usePageSelection.js TERPAKAI
  const handleRenderError = (pageNumber) => {
    setRenderErrors((prev) => ({ ...prev, [pageNumber]: true }));
  };

  // 🌐 loadMorePages /app/printers/[printerId]/hooks/usePageSelection.js TERPAKAI
  const loadMorePages = () => {
    setVisiblePages((prev) => Math.min(prev + 20, totalPages));
  };

  // 🌐 handlePrintSettingsChange /app/printers/[printerId]/hooks/usePageSelection.js TERPAKAI
  const handlePrintSettingsChange = (newSettings) => {
    if (!prices) return;

    const updatedSettings = { ...printSettings, ...newSettings };
    setPrintSettings(updatedSettings);

    const selectedSelections = selections.filter((sel) => sel.selected);
    const cost = calculateCostWithSettings(
      selectedSelections,
      initialSettings.copies || 1,
      updatedSettings,
      prices,
    );

    notifyParent(
      selections,
      initialSettings.copies || 1,
      updatedSettings,
      cost,
    );
  };

  // 🌐 handleCopiesChange /app/printers/[printerId]/hooks/usePageSelection.js TERPAKAI
  const handleCopiesChange = (copies) => {
    if (!prices) return;

    const validatedCopies = Math.max(1, Math.min(50, copies || 1));

    const selectedSelections = selections.filter((sel) => sel.selected);
    const cost = calculateCostWithSettings(
      selectedSelections,
      validatedCopies,
      printSettings,
      prices,
    );

    notifyParent(selections, validatedCopies, printSettings, cost);
  };

  const currentCost = prices
    ? calculateCostWithSettings(
        selections.filter((sel) => sel.selected),
        initialSettings.copies || 1,
        printSettings,
        prices,
      )
    : 0;

  return {
    // State
    selections,
    selectedPages,
    visiblePages,
    renderErrors,
    printSettings,

    // Computed values
    pagesToShow: selections.slice(0, visiblePages),
    hasMorePages: visiblePages < totalPages,
    currentCost,
    allPagesSelected: selectedPages.length === totalPages,
    somePagesSelected:
      selectedPages.length > 0 && selectedPages.length < totalPages,

    // Actions
    handlePageTypeChange,
    setAllPages,
    handleRenderError,
    loadMorePages,
    handlePrintSettingsChange,
    handleCopiesChange,
    handlePageSelection,
    selectAllPages,
    deselectAllPages,
  };
};
