"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { getPDFPageCount, validatePDFFile } from "../../utils/pdfUtils";
import PaymentModal from "@/components/PaymentModal";

const PageSelector = dynamic(() => import("../../components/PageSelector"), {
  ssr: false,
  loading: () => <div>Loading...</div>,
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
  });
  const [totalPages, setTotalPages] = useState(0);
  const [cost, setCost] = useState(0);
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

  // GANTI handleSubmit function
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Silakan upload file terlebih dahulu!");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Generate order ID
      const orderId = `print-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // 2. Prepare data untuk payment dan print
      const requestData = {
        orderId: orderId,
        amount: cost,
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
        totalCost: cost,
      };

      console.log("💰 Payment request:", requestData);

      // 3. Create payment transaction di Midtrans
      const paymentResponse = await fetch("/api/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: cost,
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

      // 4. Simpan data untuk modal payment
      setPaymentData({
        qrCode: paymentResult.qr_code,
        redirectUrl: paymentResult.redirect_url,
        amount: cost,
        orderId: orderId,
      });

      // 5. Tampilkan modal payment
      setShowPaymentModal(true);
      setCurrentJobId(orderId);
    } catch (error) {
      console.error("❌ Payment error:", error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi untuk handle payment success
  const handlePaymentSuccess = async () => {
    try {
      setIsLoading(true);

      // 1. Upload file ke VPS setelah payment success
      const formData = new FormData();
      formData.append("pdf", file);
      formData.append("copies", advancedSettings.copies);
      formData.append("printerId", "printer-1");
      formData.append(
        "colorPages",
        JSON.stringify(advancedSettings.colorPages)
      );
      formData.append("bwPages", JSON.stringify(advancedSettings.bwPages));
      formData.append("totalCost", cost);
      formData.append("orderId", currentJobId);

      console.log("📤 Sending file to VPS after payment...");

      const response = await fetch("/api/print", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      console.log("📥 Response from VPS:", result);

      if (result.success) {
        alert(
          `✅ Payment berhasil! File sedang diproses untuk print.\nJob ID: ${result.jobId}`
        );

        // Reset form
        setFile(null);
        setTotalPages(0);
        setCost(0);
        setAdvancedSettings({
          colorPages: [],
          bwPages: [],
          copies: 1,
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

  // Fungsi untuk handle payment cancelled
  const handlePaymentCancelled = () => {
    setShowPaymentModal(false);
    setPaymentData(null);
    alert("❌ Pembayaran dibatalkan. Silakan coba lagi.");
  };

  if (!printer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat printer...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Printer Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {printer.name}
              </h1>
              <p className="text-gray-600">{printer.location.address}</p>
            </div>
            <div className="text-right">
              <div
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
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
              <p className="text-sm text-gray-600 mt-1">
                {printer.paperStatus.paperCount} kertas tersedia
              </p>
            </div>
          </div>
        </div>
      </div>

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
              <button
                type="submit"
                className="w-full px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                Bayar dan Print
              </button>
            )}
          </form>
        </div>
      </main>
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
