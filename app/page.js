"use client";
import { useState } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import { getPDFPageCount, validatePDFFile } from "../utils/pdfUtils";

// Lazy load component untuk performance
const PageSelector = dynamic(() => import("../components/PageSelector"), {
  ssr: false,
  loading: () => <div>Loading...</div>,
});

export default function PrintService() {
  const [file, setFile] = useState(null);
  const [advancedSettings, setAdvancedSettings] = useState({
    colorPages: [],
    bwPages: [],
    copies: 1,
  });
  const [totalPages, setTotalPages] = useState(0);
  const [cost, setCost] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");

  const calculateCost = (settings = advancedSettings) => {
    const colorCost = settings.colorPages.length * 1500;
    const bwCost = settings.bwPages.length * 500;
    const totalCost = (colorCost + bwCost) * settings.copies;
    setCost(totalCost);
    return totalCost;
  };

  const handleFileUpload = async (selectedFile) => {
    // Validasi file
    const validation = validatePDFFile(selectedFile);
    if (!validation.isValid) {
      alert(validation.error);
      return false;
    }

    setIsLoading(true);
    try {
      // Get page count from PDF
      const pageCount = await getPDFPageCount(selectedFile);
      setTotalPages(pageCount);
      setFile(selectedFile);

      // Set default settings: halaman 1 warna, lainnya BW
      const defaultColorPages = [1];
      const defaultBwPages = Array.from(
        { length: pageCount - 1 },
        (_, i) => i + 2
      );

      setAdvancedSettings({
        colorPages: defaultColorPages,
        bwPages: defaultBwPages,
        copies: 1,
      });

      // Calculate initial cost
      calculateCost({
        colorPages: defaultColorPages,
        bwPages: defaultBwPages,
        copies: 1,
      });

      return true;
    } catch (error) {
      console.error("Error reading PDF:", error);
      alert("Gagal membaca file PDF. Silakan coba file lain.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi untuk set semua halaman ke warna tertentu
  const setAllPages = (type) => {
    if (totalPages === 0) return;

    const allPages = Array.from({ length: totalPages }, (_, i) => i + 1);

    if (type === "color") {
      setAdvancedSettings({
        ...advancedSettings,
        colorPages: allPages,
        bwPages: [],
      });
      calculateCost({
        colorPages: allPages,
        bwPages: [],
        copies: advancedSettings.copies,
      });
    } else {
      setAdvancedSettings({
        ...advancedSettings,
        colorPages: [],
        bwPages: allPages,
      });
      calculateCost({
        colorPages: [],
        bwPages: allPages,
        copies: advancedSettings.copies,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Silakan upload file terlebih dahulu!");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Prepare data untuk VPS
      const formData = new FormData();
      formData.append("pdf", file);
      formData.append("copies", advancedSettings.copies);
      formData.append("printerId", "printer-1"); // Default dulu
      formData.append(
        "colorPages",
        JSON.stringify(advancedSettings.colorPages)
      );
      formData.append("bwPages", JSON.stringify(advancedSettings.bwPages));
      formData.append("totalCost", cost);

      console.log("📤 Sending to VPS...", {
        file: file.name,
        copies: advancedSettings.copies,
        cost: cost,
      });

      // 2. Kirim ke VPS via API route kita
      const response = await fetch("/api/print", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      console.log("📥 Response from VPS:", result);

      if (result.success) {
        alert(`✅ ${result.message}\nJob ID: ${result.jobId}`);

        // Reset form setelah sukses
        setFile(null);
        setTotalPages(0);
        setCost(0);
        setAdvancedSettings({
          colorPages: [],
          bwPages: [],
          copies: 1,
        });

        // TODO: Redirect ke status page atau payment
      } else {
        alert(`❌ Print failed: ${result.error}`);
      }
    } catch (error) {
      console.error("❌ Submit error:", error);
      alert("❌ Network error: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Head>
        <title>Irc Print - Jasa Print Online</title>
        <meta
          name="description"
          content="Layanan print 24 jam online dengan pembayaran QRIS"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-8 mb-6 md:mb-8">
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-2">
              Irc Print
            </h1>
            <p className="text-sm md:text-base text-gray-600">
              Layanan Print Online
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
            {/* File Upload Section */}
            <div className="bg-blue-50 p-4 md:p-6 rounded-lg border border-blue-200">
              <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-3 md:mb-4 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 md:h-6 md:w-6 mr-2 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                Upload File
              </h2>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-28 md:h-32 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-4 pb-5 md:pt-5 md:pb-6">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 md:h-10 md:w-10 text-blue-500 mb-1 md:mb-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <p className="text-xs md:text-sm text-gray-600 text-center">
                      <span className="font-semibold">Klik untuk upload</span>{" "}
                      atau drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1 text-center">
                      PDF saja (Maks. 10MB)
                    </p>
                  </div>
                  {isLoading && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg mx-4">
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-blue-600 mr-3"></div>
                          <span className="text-sm md:text-base">
                            Memproses file PDF...
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf"
                    onChange={async (e) => {
                      const selectedFile = e.target.files[0];
                      if (selectedFile) {
                        if (selectedFile.type === "application/pdf") {
                          const success = await handleFileUpload(selectedFile);
                          if (!success) {
                            e.target.value = "";
                          }
                        } else {
                          alert("Hanya file PDF yang diperbolehkan!");
                          e.target.value = "";
                        }
                      }
                    }}
                    required
                  />
                </label>
              </div>
              {file && (
                <p className="text-xs md:text-sm text-green-600 mt-2 flex items-center justify-center md:justify-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  File terpilih: {file.name}
                </p>
              )}
            </div>

            {/* Advanced Settings Section */}
            {file && totalPages > 0 && (
              <div className="bg-gray-50 p-4 md:p-6 rounded-lg border border-gray-200">
                <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-3 md:mb-4">
                  Pengaturan Print Lanjutan
                </h2>

                <div className="mb-4 md:mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jumlah salinan:
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={advancedSettings.copies}
                    onChange={(e) => {
                      const copies = parseInt(e.target.value) || 1;
                      const newSettings = { ...advancedSettings, copies };
                      setAdvancedSettings(newSettings);
                      calculateCost(newSettings);
                    }}
                    className="w-full md:w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                  />
                </div>

                <PageSelector
                  totalPages={totalPages}
                  initialSettings={advancedSettings}
                  onSettingsChange={(newSettings) => {
                    setAdvancedSettings(newSettings);
                    calculateCost(newSettings);
                  }}
                  file={file}
                />
              </div>
            )}

            {/* Payment Section */}
            {cost > 0 && (
              <div className="bg-green-50 p-4 md:p-6 rounded-lg border border-green-200">
                <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-3 md:mb-4 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 md:h-6 md:w-6 mr-2 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  Pembayaran
                </h2>
                <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm mb-3 md:mb-4">
                  <p className="text-base md:text-lg font-semibold text-center text-gray-800">
                    Total Biaya:{" "}
                    <span className="text-blue-600">
                      Rp {cost.toLocaleString("id-ID")}
                    </span>
                  </p>
                </div>
                <button
                  type="submit"
                  className="w-full px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                >
                  Bayar dan Print
                </button>
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}
