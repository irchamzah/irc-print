// app/printers/[printerId]/hooks/usePageSelection.js
import { useEffect, useState } from "react";

// usePageSelection - UPDATED dengan finalPrices
export const usePageSelection = (
  totalPages,
  initialSettings,
  onSettingsChange,
  finalPrices, // ✅ Ganti prices → finalPrices
  volumeDiscounts, // ✅ Tambah parameter untuk diskon volume
) => {
  const [selections, setSelections] = useState([]);
  const [selectedPages, setSelectedPages] = useState([]);
  const [visiblePages, setVisiblePages] = useState(6);
  const [renderErrors, setRenderErrors] = useState({});
  const [printSettings, setPrintSettings] = useState(
    initialSettings.printSettings || {
      paperSize: "A4",
      orientation: "PORTRAIT",
      quality: "normal",
      margins: "normal",
      duplex: false,
    },
  );


  // ============================================
  // Helper: Ambil discountFlat yang berlaku berdasarkan total lembar
  // ============================================
  const getDiscountFlat = (totalSheets, discounts) => {
    if (!discounts || discounts.length === 0) return 0;
    const sortedTiers = [...discounts].sort((a, b) => b.minSheets - a.minSheets);
    for (const tier of sortedTiers) {
      if (totalSheets >= tier.minSheets) {
        return tier.discountFlat || 0;
      }
    }
    return 0;
  };

  // ============================================
  // Helper: Hitung total biaya
  // ============================================
  const calculateCostWithSettings = (
    selections,
    copies,
    settings,
    finalPrices,
    discounts,
  ) => {
    if (!finalPrices) return 0;

    const selectedSelections = selections.filter((sel) => sel.selected);
    const colorPages = selectedSelections.filter((s) => s.type === "color").length;
    const bwPages = selectedSelections.filter((s) => s.type === "bw").length;

    const paperSize = settings.paperSize || "A4";
    const totalSheets = (colorPages + bwPages) * copies;

    const colorPricePerSheet = finalPrices?.color?.[paperSize] || 1500;
    const bwPricePerSheet = finalPrices?.monochrome?.[paperSize] || 500;

    // Kurangi discountFlat dari harga tiap lembar (berlaku untuk semua jenis)
    const flat = getDiscountFlat(totalSheets, discounts);
    const effectiveColorPrice = Math.max(0, colorPricePerSheet - flat);
    const effectiveBwPrice = Math.max(0, bwPricePerSheet - flat);

    const totalColorCost = colorPages * effectiveColorPrice;
    const totalBwCost = bwPages * effectiveBwPrice;

    return (totalColorCost + totalBwCost) * copies;
  };

  // ============================================
  // Helper: Notify parent dengan data terbaru
  // ============================================
  const notifyParent = (selections, copies, settings, cost) => {
    const selectedSelections = selections.filter((sel) => sel.selected);
    const colorPages = selectedSelections
      .filter((s) => s.type === "color")
      .map((s) => s.page);
    const bwPages = selectedSelections
      .filter((s) => s.type === "bw")
      .map((s) => s.page);
    const selectedPagesList = selectedSelections.map((s) => s.page);

    onSettingsChange({
      colorPages,
      bwPages,
      copies,
      printSettings: settings,
      cost,
      selectedPages: selectedPagesList,
      paperSize: settings.paperSize,
      quality: settings.quality,
      volumeDiscounts,
    });
  };

  // ============================================
  // Initialize selections
  // ============================================
  useEffect(() => {
    if (!finalPrices) {
      return;
    }

    // Gunakan printSettings dari initialSettings langsung (fresh, bukan state stale)
    const freshPrintSettings = initialSettings.printSettings || {
      paperSize: "A4",
      orientation: "PORTRAIT",
      quality: "normal",
      margins: "normal",
      duplex: false,
    };

    // Sync state juga agar komponen lain yang baca printSettings dari hook ini ikut update
    setPrintSettings(freshPrintSettings);

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
        freshPrintSettings,
        finalPrices,
        volumeDiscounts,
      );
      notifyParent(
        initialSelections,
        initialSettings.copies || 1,
        freshPrintSettings,
        initialCost,
      );
    }
  }, [totalPages, finalPrices, volumeDiscounts, initialSettings.printSettings?.paperSize, initialSettings._uploadKey]);

  // ============================================
  // handlePageSelection
  // ============================================
  const handlePageSelection = (pageNumber, isSelected) => {
    if (!finalPrices) return;

    const newSelections = selections.map((sel) =>
      sel.page === pageNumber ? { ...sel, selected: isSelected } : sel,
    );
    setSelections(newSelections);

    const updatedSelectedPages = newSelections
      .filter((sel) => sel.selected)
      .map((sel) => sel.page);
    setSelectedPages(updatedSelectedPages);

    const cost = calculateCostWithSettings(
      newSelections.filter((sel) => sel.selected),
      initialSettings.copies || 1,
      printSettings,
      finalPrices,
      volumeDiscounts,
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
      selectedPages: updatedSelectedPages,
      paperSize: printSettings.paperSize,
      quality: printSettings.quality,
    });
  };

  // ============================================
  // selectAllPages
  // ============================================
  const selectAllPages = () => {
    if (!finalPrices) return;

    const newSelections = selections.map((sel) => ({ ...sel, selected: true }));
    setSelections(newSelections);
    setSelectedPages(Array.from({ length: totalPages }, (_, i) => i + 1));

    const cost = calculateCostWithSettings(
      newSelections.filter((sel) => sel.selected),
      initialSettings.copies || 1,
      printSettings,
      finalPrices,
      volumeDiscounts,
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
      paperSize: printSettings.paperSize,
      quality: printSettings.quality,
    });
  };

  // ============================================
  // deselectAllPages
  // ============================================
  const deselectAllPages = () => {
    const newSelections = selections.map((sel) => ({
      ...sel,
      selected: false,
    }));
    if (!finalPrices) return;

    setSelections(newSelections);
    setSelectedPages([]);

    const cost = calculateCostWithSettings(
      newSelections.filter((sel) => sel.selected),
      initialSettings.copies || 1,
      printSettings,
      finalPrices,
      volumeDiscounts,
    );

    onSettingsChange({
      colorPages: [],
      bwPages: [],
      copies: initialSettings.copies || 1,
      printSettings,
      cost: 0,
      selectedPages: [],
      paperSize: printSettings.paperSize,
      quality: printSettings.quality,
    });
  };

  // ============================================
  // handlePageTypeChange
  // ============================================
  const handlePageTypeChange = (pageNumber, type) => {
    if (!finalPrices) return;

    const newSelections = selections.map((sel) =>
      sel.page === pageNumber ? { ...sel, type } : sel,
    );
    setSelections(newSelections);

    const selectedSelections = newSelections.filter((sel) => sel.selected);
    const cost = calculateCostWithSettings(
      selectedSelections,
      initialSettings.copies || 1,
      printSettings,
      finalPrices,
      volumeDiscounts,
    );

    notifyParent(
      newSelections,
      initialSettings.copies || 1,
      printSettings,
      cost,
    );
  };

  // ============================================
  // setAllPages
  // ============================================
  const setAllPages = (type) => {
    const newSelections = selections.map((sel) => ({
      ...sel,
      type: type,
    }));
    if (!finalPrices) return;

    setSelections(newSelections);

    const selectedSelections = newSelections.filter((sel) => sel.selected);
    const cost = calculateCostWithSettings(
      selectedSelections,
      initialSettings.copies || 1,
      printSettings,
      finalPrices,
      volumeDiscounts,
    );

    notifyParent(
      newSelections,
      initialSettings.copies || 1,
      printSettings,
      cost,
    );
  };

  // ============================================
  // handlePrintSettingsChange
  // ============================================
  const handlePrintSettingsChange = (newSettings) => {
    if (!finalPrices) return;

    // ✅ Konversi quality ke lowercase jika ada
    let processedSettings = { ...newSettings };
    if (processedSettings.quality) {
      processedSettings.quality = processedSettings.quality.toLowerCase();
    }

    const updatedSettings = { ...printSettings, ...processedSettings };
    setPrintSettings(updatedSettings);

    const selectedSelections = selections.filter((sel) => sel.selected);
    const cost = calculateCostWithSettings(
      selectedSelections,
      initialSettings.copies || 1,
      updatedSettings,
      finalPrices,
      volumeDiscounts,
    );

    notifyParent(
      selections,
      initialSettings.copies || 1,
      updatedSettings,
      cost,
    );
  };

  // ============================================
  // handleCopiesChange
  // ============================================
  const handleCopiesChange = (copies) => {
    if (!finalPrices) return;

    const validatedCopies = Math.max(1, Math.min(50, copies || 1));

    const selectedSelections = selections.filter((sel) => sel.selected);
    const cost = calculateCostWithSettings(
      selectedSelections,
      validatedCopies,
      printSettings,
      finalPrices,
      volumeDiscounts,
    );

    notifyParent(selections, validatedCopies, printSettings, cost);
  };

  // ============================================
  // Helper functions (tidak berubah)
  // ============================================
  const handleRenderError = (pageNumber) => {
    setRenderErrors((prev) => ({ ...prev, [pageNumber]: true }));
  };

  const loadMorePages = () => {
    setVisiblePages((prev) => Math.min(prev + 20, totalPages));
  };

  // ============================================
  // Current cost calculation
  // ============================================
  const currentCost = finalPrices
    ? calculateCostWithSettings(
        selections.filter((sel) => sel.selected),
        initialSettings.copies || 1,
        printSettings,
        finalPrices,
        volumeDiscounts,
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
