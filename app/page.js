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
    const colorCost = settings.colorPages.length * 1000;
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Silakan upload file terlebih dahulu!");
      return;
    }

    // Generate format untuk Telegram
    const groupConsecutive = (pages) => {
      if (pages.length === 0) return [];
      pages.sort((a, b) => a - b);
      const result = [];
      let start = pages[0];
      let end = pages[0];

      for (let i = 1; i < pages.length; i++) {
        if (pages[i] === end + 1) {
          end = pages[i];
        } else {
          result.push(start === end ? `${start}` : `${start}-${end}`);
          start = end = pages[i];
        }
      }
      result.push(start === end ? `${start}` : `${start}-${end}`);
      return result;
    };

    const colorStr = groupConsecutive(advancedSettings.colorPages).join(",");
    const bwStr = groupConsecutive(advancedSettings.bwPages).join(",");

    // **PERUBAHAN PENTING**: Generate /setprint command
    const setprintCommand = `/setprint color:${colorStr} bw:${bwStr} copies:${advancedSettings.copies}`;

    // **COPY TO CLIPBOARD**
    try {
      await navigator.clipboard.writeText(setprintCommand);
      console.log("✅ Text copied to clipboard:", setprintCommand);
    } catch (err) {
      console.error("❌ Failed to copy text: ", err);
      // Fallback untuk browser yang tidak support clipboard API
      const textArea = document.createElement("textarea");
      textArea.value = setprintCommand;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      console.log("📋 Used fallback copy method");
    }

    // **DEEP LINK untuk Telegram**
    const telegramMessage = `/file ${file.name}`;
    const encodedMessage = encodeURIComponent(telegramMessage);
    const deepLink = `https://t.me/ircstore_bot?text=${encodedMessage}`;

    // Buka di tab baru
    window.open(deepLink, "_blank");

    alert(
      `✅ Text telah disalin ke clipboard: ${setprintCommand}\n\n` +
        "📱 Buka Telegram di tab yang terbuka, upload file, lalu paste text yang sudah disalin!"
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Head>
        <title>Print24Jam - Jasa Print 24 Jam</title>
        <meta
          name="description"
          content="Layanan print 24 jam online dengan pembayaran QRIS"
        />
      </Head>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              Print24Jam
            </h1>
            <p className="text-gray-600">Layanan Cetak Online 24 Jam</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* File Upload Section - Tetap sama seperti sebelumnya */}
            {/* File Upload Section */}
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-2 text-blue-600"
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
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10 text-blue-500 mb-2"
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
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Klik untuk upload</span>{" "}
                      atau drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PDF saja (Maks. 10MB) {/* Diubah dari PDF, DOC, DOCX */}
                    </p>
                  </div>
                  {isLoading && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white p-6 rounded-lg shadow-lg">
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                          <span>Memproses file PDF...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf" // Hanya terima PDF
                    onChange={async (e) => {
                      const selectedFile = e.target.files[0];
                      if (selectedFile) {
                        if (selectedFile.type === "application/pdf") {
                          // Panggil handleFileUpload yang berisi semua logic
                          const success = await handleFileUpload(selectedFile);
                          if (!success) {
                            e.target.value = ""; // Reset jika gagal
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
                <p className="text-sm text-green-600 mt-2 flex items-center">
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
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Pengaturan Print Lanjutan
                </h2>

                <div className="mb-6">
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
                    className="w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                  />
                </div>

                <PageSelector
                  totalPages={totalPages}
                  initialSettings={advancedSettings}
                  onSettingsChange={(newSettings) => {
                    setAdvancedSettings(newSettings);
                    calculateCost(newSettings);
                  }}
                  file={file} // ← Tambahkan ini
                />
              </div>
            )}

            {/* Payment Section - Tetap sama */}
            {cost > 0 && (
              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mr-2 text-green-600"
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
                <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                  <p className="text-lg font-semibold text-center text-gray-800">
                    Total Biaya:{" "}
                    <span className="text-blue-600">
                      Rp {cost.toLocaleString("id-ID")}
                    </span>
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                  <p className="text-center text-gray-600 mb-2">
                    Scan QRIS untuk pembayaran
                  </p>
                  <div className="flex justify-center">
                    <div className="w-48 h-48 bg-gray-200 flex items-center justify-center rounded-lg border border-gray-300">
                      <span className="text-gray-500 text-sm text-center">
                        [QRIS Code akan muncul di sini]
                      </span>
                    </div>
                  </div>
                  <p className="text-center text-xs text-gray-500 mt-2">
                    Supported by: Gopay, OVO, Dana, LinkAja, dll.
                  </p>
                </div>
                <button
                  type="submit"
                  className="w-full px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Bayar dan Print
                </button>
              </div>
            )}
          </form>
          {/* Di bagian bawah form, tambahkan test button */}
          {/* <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              Developer Test
            </h3>
            <button
              type="button"
              onClick={testDeepLink}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Test Deep Link
            </button>
            <p className="text-sm text-gray-600 mt-2">
              Klik untuk test deep link functionality (buka console untuk
              melihat detail)
            </p>
          </div> */}
        </div>
      </main>
    </div>
  );
}
