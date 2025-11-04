import { useState } from "react";
import { getPDFPageCount, validatePDFFile } from "../../../../utils/pdfUtils";

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

  const handleFileUpload = async (selectedFile, setIsLoading) => {
    const validation = validatePDFFile(selectedFile);
    if (!validation.isValid) {
      alert(validation.error);
      return false;
    }

    setIsLoading(true);
    try {
      const pageCount = await getPDFPageCount(selectedFile);
      setTotalPages(pageCount);
      setFile(selectedFile);

      const defaultColorPages = [1];
      const defaultBwPages = Array.from(
        { length: pageCount - 1 },
        (_, i) => i + 2
      );

      const initialSettings = {
        colorPages: defaultColorPages,
        bwPages: defaultBwPages,
        copies: 1,
        printSettings: {
          paperSize: "A4",
          orientation: "PORTRAIT",
          quality: "NORMAL",
          margins: "NORMAL",
          duplex: false,
        },
        cost: 0,
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

  const handleSettingsChange = (newSettings) => {
    setAdvancedSettings(newSettings);
  };

  return {
    // States
    file,
    advancedSettings,
    totalPages,

    // Setters
    setFile,
    setAdvancedSettings,
    setTotalPages,

    // Functions
    handleFileUpload,
    handleSettingsChange,
  };
};
