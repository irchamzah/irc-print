import { useState, useEffect } from "react";
import { PRINT_SETTINGS } from "../../../../lib/printConstants";

export const usePageSelection = (
  totalPages,
  initialSettings,
  onSettingsChange
) => {
  const [selections, setSelections] = useState([]);
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
    }));
    setSelections(initialSelections);

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

  // Calculate cost based on selections and settings
  const calculateCostWithSettings = (selections, copies, settings) => {
    const colorPages = selections.filter((s) => s.type === "color").length;
    const bwPages = selections.filter((s) => s.type === "bw").length;

    const paperSize = settings.paperSize || "A4";
    const quality = settings.quality || "NORMAL";

    const colorCostPerPage = PRINT_SETTINGS.COSTS.COLOR[paperSize] || 1500;
    const bwCostPerPage = PRINT_SETTINGS.COSTS.BW[paperSize] || 500;
    const qualitySurcharge =
      PRINT_SETTINGS.COSTS.QUALITY_SURCHARGE[quality] || 0;

    const totalColorCost = colorPages * (colorCostPerPage + qualitySurcharge);
    const totalBwCost = bwPages * (bwCostPerPage + qualitySurcharge);

    return (totalColorCost + totalBwCost) * copies;
  };

  // Notify parent component about settings changes
  const notifyParent = (selections, copies, settings, cost) => {
    const colorPages = selections
      .filter((s) => s.type === "color")
      .map((s) => s.page);
    const bwPages = selections
      .filter((s) => s.type === "bw")
      .map((s) => s.page);

    onSettingsChange({
      colorPages,
      bwPages,
      copies,
      printSettings: settings,
      cost,
    });
  };

  // Handle page type change
  const handlePageTypeChange = (pageNumber, type) => {
    const newSelections = selections.map((sel) =>
      sel.page === pageNumber ? { ...sel, type } : sel
    );
    setSelections(newSelections);

    const cost = calculateCostWithSettings(
      newSelections,
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

  // Set all pages to same type
  const setAllPages = (type) => {
    const newSelections = selections.map((sel) => ({
      ...sel,
      type: type,
    }));

    setSelections(newSelections);

    const cost = calculateCostWithSettings(
      newSelections,
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

  // Handle print settings changes
  const handlePrintSettingsChange = (newSettings) => {
    const updatedSettings = { ...printSettings, ...newSettings };
    setPrintSettings(updatedSettings);

    const cost = calculateCostWithSettings(
      selections,
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

  // Handle copies change
  const handleCopiesChange = (copies) => {
    const validatedCopies = Math.max(1, Math.min(50, copies || 1));

    const cost = calculateCostWithSettings(
      selections,
      validatedCopies,
      printSettings
    );
    notifyParent(selections, validatedCopies, printSettings, cost);
  };

  // Get current cost
  const currentCost = calculateCostWithSettings(
    selections,
    initialSettings.copies || 1,
    printSettings
  );

  return {
    // State
    selections,
    visiblePages,
    renderErrors,
    printSettings,

    // Computed values
    pagesToShow: selections.slice(0, visiblePages),
    hasMorePages: visiblePages < totalPages,
    currentCost,

    // Actions
    handlePageTypeChange,
    setAllPages,
    handleRenderError,
    loadMorePages,
    handlePrintSettingsChange,
    handleCopiesChange,
  };
};
