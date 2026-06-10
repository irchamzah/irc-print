// app/printers/[printerId]/hooks/useFileManagement.js
import { useState } from "react";
import { getPDFPageCount, validatePDFFile, detectPDFPageSize } from "../../../../utils/pdfUtils";

// useFileManagement TERPAKAI
export const useFileManagement = () => {
  const [file, setFile] = useState(null);
  const [advancedSettings, setAdvancedSettings] = useState({
    colorPages: [],
    bwPages: [],
    copies: 1,
    printSettings: {
      paperSize: "A4",
      orientation: "PORTRAIT",
      quality: "NORMAL",
      margins: "NORMAL",
      duplex: false,
    },
    cost: 0,
  });
  const [totalPages, setTotalPages] = useState(0);
  const [detectedPDFSize, setDetectedPDFSize] = useState(null);

  // 🌐 handleFileUpload /app/printers/[printerId]/hooks/useFileManagement.js TERPAKAI
  const handleFileUpload = async (selectedFile, setIsLoading) => {
    const validation = validatePDFFile(selectedFile);
    if (!validation.isValid) {
      alert(validation.error);
      return false;
    }

    setIsLoading(true);
    try {
      const [pageCount, detectedSize] = await Promise.all([
        getPDFPageCount(selectedFile),
        detectPDFPageSize(selectedFile),
      ]);
      setTotalPages(pageCount);
      setFile(selectedFile);

      const paperSize = detectedSize || "A4";
      setDetectedPDFSize(detectedSize);
      if (detectedSize) {
        console.log(`📄 Ukuran kertas terdeteksi: ${detectedSize}`);
      }

      const defaultColorPages = [1];
      const defaultBwPages = Array.from(
        { length: pageCount - 1 },
        (_, i) => i + 2,
      );

      const initialSettings = {
        colorPages: defaultColorPages,
        bwPages: defaultBwPages,
        copies: 1,
        printSettings: {
          paperSize,
          orientation: "PORTRAIT",
          quality: "NORMAL",
          margins: "NORMAL",
          duplex: false,
        },
        cost: 0,
        _uploadKey: Date.now(),
      };

      setAdvancedSettings(initialSettings);
      return true;
    } catch (error) {
      console.error("Error reading PDF:", error);
      alert("Gagal membaca file PDF. Silakan coba file lain.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 🌐 handleSettingsChange /app/printers/[printerId]/hooks/useFileManagement.js TERPAKAI
  const handleSettingsChange = (newSettings) => {
    setAdvancedSettings(newSettings);
  };

  return {
    // States
    file,
    advancedSettings,
    totalPages,
    detectedPDFSize,

    // Setters
    setFile,
    setAdvancedSettings,
    setTotalPages,
    setDetectedPDFSize,

    // Functions
    handleFileUpload,
    handleSettingsChange,
  };
};
