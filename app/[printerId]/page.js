"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { getPDFPageCount, validatePDFFile } from "../../utils/pdfUtils";
import PaymentModal from "@/components/PaymentModal";

const PageSelector = dynamic(() => import("../../components/PageSelector"), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  ),
});

export default function PrinterPage() {
  const params = useParams();
  const printerId = params.printerId;

  const [printer, setPrinter] = useState(null);
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
    cost: 0, // TAMBAHKAN COST DI ADVANCED SETTINGS
  });
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [currentJobId, setCurrentJobId] = useState(null);

  useEffect(() => {
    fetchPrinterDetails();
  }, [printerId]);

  const fetchPrinterDetails = async () => {
    try {
      const response = await fetch(`/api/printers/${printerId}`);
      const result = await response.json();

      if (result.success) {
        setPrinter(result.printer);
      }
    } catch (error) {
      console.error("Error fetching printer:", error);
    }
  };

  const handleFileUpload = async (selectedFile) => {
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
        cost: 0, // Akan diupdate oleh PageSelector
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

  // Update handler untuk menerima settings dari PageSelector
  const handleSettingsChange = (newSettings) => {
    console.log("🔄 Settings updated from PageSelector:", newSettings);
    setAdvancedSettings(newSettings);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Silakan upload file terlebih dahulu!");
      return;
    }

    // Gunakan cost dari advancedSettings (dari PageSelector)
    const finalCost = advancedSettings.cost || 0;

    if (finalCost <= 0) {
      alert(
        "Biaya print belum dihitung. Silakan tunggu sebentar atau periksa pengaturan."
      );
      return;
    }

    setIsLoading(true);

    try {
      const orderId = `print-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      const requestData = {
        orderId: orderId,
        amount: finalCost, // GUNAKAN COST DARI PAGE SELECTOR
        fileInfo: {
          name: file.name,
          size: file.size,
          type: file.type,
        },
        printSettings: {
          copies: advancedSettings.copies,
          colorPages: advancedSettings.colorPages,
          bwPages: advancedSettings.bwPages,
          printSettings: advancedSettings.printSettings || {},
        },
        totalCost: finalCost,
      };

      console.log("💰 Payment request:", requestData);

      const paymentResponse = await fetch("/api/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: finalCost, // GUNAKAN COST DARI PAGE SELECTOR
          orderId: orderId,
        }),
      });

      const paymentResult = await paymentResponse.json();

      if (!paymentResult.success) {
        throw new Error(
          paymentResult.error || "Gagal membuat transaksi payment"
        );
      }

      console.log("✅ Payment transaction created:", paymentResult);

      setPaymentData({
        qrCode: paymentResult.qr_code,
        redirectUrl: paymentResult.redirect_url,
        amount: finalCost, // GUNAKAN COST DARI PAGE SELECTOR
        orderId: orderId,
      });

      setShowPaymentModal(true);
      setCurrentJobId(orderId);
    } catch (error) {
      console.error("❌ Payment error:", error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      setIsLoading(true);

      // Hitung total halaman yang akan diprint
      const totalPagesToPrint =
        (advancedSettings.colorPages.length + advancedSettings.bwPages.length) *
        advancedSettings.copies;

      console.log(`📄 Printing ${totalPagesToPrint} pages...`);

      // 1. Upload file ke VPS setelah payment success
      const formData = new FormData();
      formData.append("pdf", file);
      formData.append("copies", advancedSettings.copies);
      formData.append("printerId", printerId);
      formData.append(
        "colorPages",
        JSON.stringify(advancedSettings.colorPages)
      );
      formData.append("bwPages", JSON.stringify(advancedSettings.bwPages));
      formData.append("totalCost", advancedSettings.cost);
      formData.append("orderId", currentJobId);
      formData.append("totalPages", totalPagesToPrint);

      console.log("📤 Sending file to VPS after payment...");

      const response = await fetch("/api/print", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      console.log("📥 Response from VPS:", result);

      if (result.success) {
        alert(
          `✅ Payment berhasil! File sedang diproses untuk print.\n` +
            `📄 ${totalPagesToPrint} halaman akan dicetak.\n` +
            `Job ID: ${result.jobId}`
        );

        // Reset form
        setFile(null);
        setTotalPages(0);
        setAdvancedSettings({
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
        setShowPaymentModal(false);
        setPaymentData(null);
      } else {
        alert(`❌ Gagal mengirim file: ${result.error}`);
      }
    } catch (error) {
      console.error("❌ Error after payment:", error);
      alert("❌ Error setelah payment: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentCancelled = () => {
    setShowPaymentModal(false);
    setPaymentData(null);
    alert("❌ Pembayaran dibatalkan. Silakan coba lagi.");
  };

  if (!printer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat printer...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Printer Header - Responsive */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">
                {printer.name}
              </h1>
              <p className="text-gray-600 text-sm sm:text-base mt-1 truncate">
                {printer.location?.address}
              </p>
            </div>
            <div className="flex flex-col sm:items-end gap-2">
              <div
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                  printer.status === "online"
                    ? "bg-green-100 text-green-800"
                    : printer.status === "offline"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {printer.status === "online"
                  ? "🟢 Online"
                  : printer.status === "offline"
                  ? "🔴 Offline"
                  : "🟡 Maintenance"}
              </div>
              <p className="text-gray-600 text-xs sm:text-sm">
                {printer.paperStatus?.paperCount || 0} kertas tersedia
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Form Content */}
          <div className="p-4 sm:p-6 lg:p-8">
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              {/* File Upload Section */}
              <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-blue-600 flex-shrink-0"
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
                  <label className="flex flex-col items-center justify-center w-full h-32 sm:h-40 border-2 border-dashed border-blue-300 rounded-xl cursor-pointer bg-white hover:bg-blue-50 transition-all duration-200">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-10 w-10 sm:h-12 sm:w-12 text-blue-500 mb-2 sm:mb-3"
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
                      <p className="text-sm sm:text-base text-gray-600 mb-1">
                        <span className="font-semibold">Klik untuk upload</span>
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        PDF saja (Maks. 10MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf"
                      onChange={async (e) => {
                        const selectedFile = e.target.files[0];
                        if (selectedFile) {
                          if (selectedFile.type === "application/pdf") {
                            const success = await handleFileUpload(
                              selectedFile
                            );
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
                  <div className="mt-3 flex items-center justify-center sm:justify-start">
                    <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-green-600 mr-2 flex-shrink-0"
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
                      <span className="text-green-700 text-sm truncate max-w-[200px] sm:max-w-none">
                        {file.name}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Advanced Settings Section */}
              {file && totalPages > 0 && (
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 sm:p-6">
                  <PageSelector
                    totalPages={totalPages}
                    initialSettings={advancedSettings}
                    onSettingsChange={handleSettingsChange} // GUNAKAN HANDLER BARU
                    file={file}
                  />
                </div>
              )}

              {/* Cost Summary */}
              {advancedSettings.cost > 0 && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">
                        Total Biaya
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {totalPages} halaman × {advancedSettings.copies} rangkap
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl sm:text-3xl font-bold text-green-600">
                        Rp {advancedSettings.cost.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Button */}
              {advancedSettings.cost > 0 && (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed text-lg"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Memproses...
                    </div>
                  ) : (
                    "💳 Bayar dan Print"
                  )}
                </button>
              )}
            </form>
          </div>
        </div>
      </main>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-sm w-full">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mr-4"></div>
              <div>
                <p className="font-semibold text-gray-800">Memproses...</p>
                <p className="text-gray-600 text-sm mt-1">
                  Harap tunggu sebentar
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={handlePaymentCancelled}
        onSuccess={handlePaymentSuccess}
        paymentData={paymentData}
        isLoading={isLoading}
      />
    </div>
  );
}
