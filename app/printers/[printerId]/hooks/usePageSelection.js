// app/printers/[printerId]/hooks/usePageSelection.js
import { PRINT_SETTINGS } from "@/lib/printConstants";
import { useEffect, useState } from "react";

export const usePageSelection = (
  totalPages,
  initialSettings,
  onSettingsChange
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
    }
  );

  // Initialize selections
  useEffect(() => {
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
        printSettings
      );
      notifyParent(
        initialSelections,
        initialSettings.copies || 1,
        printSettings,
        initialCost
      );
    }
  }, [totalPages]);

  const handlePageSelection = (pageNumber, isSelected) => {
    const newSelections = selections.map((sel) =>
      sel.page === pageNumber ? { ...sel, selected: isSelected } : sel
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
      printSettings
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

  // Fungsi untuk select/deselect semua - DIPERBAIKI
  const selectAllPages = () => {
    const newSelections = selections.map((sel) => ({ ...sel, selected: true }));
    setSelections(newSelections);
    setSelectedPages(Array.from({ length: totalPages }, (_, i) => i + 1));

    const cost = calculateCostWithSettings(
      newSelections.filter((sel) => sel.selected),
      initialSettings.copies || 1,
      printSettings
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

  const deselectAllPages = () => {
    const newSelections = selections.map((sel) => ({
      ...sel,
      selected: false,
    }));
    setSelections(newSelections);
    setSelectedPages([]);

    const cost = calculateCostWithSettings(
      newSelections.filter((sel) => sel.selected),
      initialSettings.copies || 1,
      printSettings
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

  const calculateBwPricePerPage = (bwPages, copies) => {
    // Hitung total lembar yang akan dicetak
    const totalSheets = bwPages * copies;

    // Logika: jika total lembar BW ≥ 10, harga = 200, jika tidak = 400
    return totalSheets >= 10 ? 200 : 400;
  };

  // Calculate cost based on selections and settings - DIPERBAIKI
  const calculateCostWithSettings = (selections, copies, settings) => {
    const selectedSelections = selections.filter((sel) => sel.selected);
    const colorPages = selectedSelections.filter(
      (s) => s.type === "color"
    ).length;
    const bwPages = selectedSelections.filter((s) => s.type === "bw").length;

    const paperSize = settings.paperSize || "A4";
    const quality = settings.quality || "NORMAL";

    const colorCostPerPage = PRINT_SETTINGS.COSTS.COLOR[paperSize] || 1500;

    // HITUNG HARGA BW DINAMIS BERDASARKAN JUMLAH LEMBAR (halaman × rangkap)
    let bwCostPerPage;
    if (paperSize === "A4") {
      // Hanya terapkan untuk ukuran A4
      bwCostPerPage = calculateBwPricePerPage(bwPages, copies);
    } else {
      // Untuk ukuran lain, gunakan harga tetap dari constants
      bwCostPerPage = PRINT_SETTINGS.COSTS.BW[paperSize] || 500;
    }

    const qualitySurcharge =
      PRINT_SETTINGS.COSTS.QUALITY_SURCHARGE[quality] || 0;

    const totalColorCost = colorPages * (colorCostPerPage + qualitySurcharge);
    const totalBwCost = bwPages * (bwCostPerPage + qualitySurcharge);

    return (totalColorCost + totalBwCost) * copies;
  };

  // Notify parent component about settings changes - DIPERBAIKI
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
      selectedPages, // ✅ Tambah ini
    });
  };

  // Handle page type change - PERLU DIPERBAIKI JUGA
  const handlePageTypeChange = (pageNumber, type) => {
    const newSelections = selections.map((sel) =>
      sel.page === pageNumber ? { ...sel, type } : sel
    );
    setSelections(newSelections);

    const selectedSelections = newSelections.filter((sel) => sel.selected);
    const cost = calculateCostWithSettings(
      selectedSelections,
      initialSettings.copies || 1,
      printSettings
    );

    notifyParent(
      newSelections,
      initialSettings.copies || 1,
      printSettings,
      cost
    );
  };

  // Set all pages to same type - PERLU DIPERBAIKI JUGA
  const setAllPages = (type) => {
    const newSelections = selections.map((sel) => ({
      ...sel,
      type: type,
    }));

    setSelections(newSelections);

    const selectedSelections = newSelections.filter((sel) => sel.selected);
    const cost = calculateCostWithSettings(
      selectedSelections,
      initialSettings.copies || 1,
      printSettings
    );

    notifyParent(
      newSelections,
      initialSettings.copies || 1,
      printSettings,
      cost
    );
  };

  // Handle render errors for PDF preview
  const handleRenderError = (pageNumber) => {
    setRenderErrors((prev) => ({ ...prev, [pageNumber]: true }));
  };

  // Load more pages for pagination
  const loadMorePages = () => {
    setVisiblePages((prev) => Math.min(prev + 20, totalPages));
  };

  // Handle print settings changes - PERLU DIPERBAIKI JUGA
  const handlePrintSettingsChange = (newSettings) => {
    const updatedSettings = { ...printSettings, ...newSettings };
    setPrintSettings(updatedSettings);

    const selectedSelections = selections.filter((sel) => sel.selected);
    const cost = calculateCostWithSettings(
      selectedSelections,
      initialSettings.copies || 1,
      updatedSettings
    );

    notifyParent(
      selections,
      initialSettings.copies || 1,
      updatedSettings,
      cost
    );
  };

  // Handle copies change - PERLU DIPERBAIKI JUGA
  const handleCopiesChange = (copies) => {
    const validatedCopies = Math.max(1, Math.min(50, copies || 1));

    const selectedSelections = selections.filter((sel) => sel.selected);
    const cost = calculateCostWithSettings(
      selectedSelections,
      validatedCopies,
      printSettings
    );

    notifyParent(selections, validatedCopies, printSettings, cost);
  };

  // Get current cost - PERLU DIPERBAIKI JUGA
  const currentCost = calculateCostWithSettings(
    selections.filter((sel) => sel.selected),
    initialSettings.copies || 1,
    printSettings
  );

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
