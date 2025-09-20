"use client";
import { useState } from "react";
import Head from "next/head";

export default function PrintService() {
  const [file, setFile] = useState(null);
  const [settings, setSettings] = useState({
    color: "bw",
    pageRange: "",
    copies: 1,
  });
  const [cost, setCost] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState("pending");

  const calculateCost = () => {
    const pageCost = settings.color === "color" ? 1000 : 500;
    // Asumsi 10 halaman untuk perhitungan sederhana
    setCost(10 * pageCost * settings.copies);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Implementasi upload dan pembayaran
    alert("Fitur akan diimplementasi setelah setup backend");
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

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              Print24Jam
            </h1>
            <p className="text-gray-600">Layanan Cetak Online 24 Jam</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
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
                      PDF, DOC, DOCX (Maks. 10MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files[0])}
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

            {/* Print Settings Section */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-2 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m4 4h6a2 2 0 002-2v-4a2 2 0 00-2-2h-6a2 2 0 00-2 2v4a2 2 0 002 2z"
                  />
                </svg>
                Pengaturan Print
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Warna:
                  </label>
                  <select
                    value={settings.color}
                    onChange={(e) =>
                      setSettings({ ...settings, color: e.target.value })
                    }
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md text-gray-700"
                  >
                    <option value="bw">Hitam Putih (Rp 500/halaman)</option>
                    <option value="color">Warna (Rp 1000/halaman)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Halaman yang dicetak (kosongkan untuk semua):
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 1-5, 8, 11-13"
                    value={settings.pageRange}
                    onChange={(e) =>
                      setSettings({ ...settings, pageRange: e.target.value })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 ">
                    Jumlah salinan:
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={settings.copies}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        copies: parseInt(e.target.value),
                      })
                    }
                    className="mt-1 block w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-700"
                  />
                </div>

                <button
                  type="button"
                  onClick={calculateCost}
                  className="w-full md:w-auto px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Hitung Biaya
                </button>
              </div>
            </div>

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
        </div>

        <footer className="text-center text-gray-500 text-sm">
          <p>
            © {new Date().getFullYear()} Print24Jam - Layanan Cetak 24 Jam
            Online
          </p>
        </footer>
      </main>
    </div>
  );
}
