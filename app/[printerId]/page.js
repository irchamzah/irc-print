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
    cost: 0,
  });
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [currentJobId, setCurrentJobId] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [userPoints, setUserPoints] = useState(null);
  const [checkingPoints, setCheckingPoints] = useState(false);
  const [refreshingPoints, setRefreshingPoints] = useState(false);
  const [userSession, setUserSession] = useState(null);

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

  const refreshUserPoints = async () => {
    if (!userSession) {
      alert("Silakan login terlebih dahulu");
      return;
    }

    setRefreshingPoints(true);
    try {
      const response = await fetch(`/api/users/${userSession.phone}/points`);
      console.log("📡 [FRONTEND] Refresh points response:", response);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.user) {
        const newPoints = result.points || 0;
        setUserPoints(newPoints);
        setUserSession((prev) => ({
          ...prev,
          points: newPoints,
        }));

        const updatedSession = {
          ...userSession,
          points: newPoints,
          timestamp: Date.now(),
        };
        localStorage.setItem("userSession", JSON.stringify(updatedSession));

        alert(
          `✅ Point berhasil di-refresh! Point terbaru: ${newPoints.toFixed(
            2
          )} poin`
        );
      } else {
        alert("❌ User tidak ditemukan. Silakan login ulang.");
        logoutUser();
      }
    } catch (error) {
      console.error("❌ Error refreshing points:", error);
      alert("❌ Gagal refresh poin: " + error.message);
    } finally {
      setRefreshingPoints(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Silakan upload file terlebih dahulu!");
      return;
    }

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

      const paymentResponse = await fetch("/api/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: finalCost,
          orderId: orderId,
          ...(userSession && { phoneNumber: userSession.phone }),
        }),
      });

      const paymentResult = await paymentResponse.json();

      if (!paymentResult.success) {
        throw new Error(
          paymentResult.error || "Gagal membuat transaksi payment"
        );
      }

      setPaymentData({
        qrCode: paymentResult.qr_code,
        redirectUrl: paymentResult.redirect_url,
        amount: finalCost,
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

      const totalPagesToPrint =
        (advancedSettings.colorPages.length + advancedSettings.bwPages.length) *
        advancedSettings.copies;

      const pointsToAdd = (advancedSettings.cost / 2000).toFixed(2);

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
      formData.append("pointsToAdd", pointsToAdd);

      if (userSession) {
        formData.append("phoneNumber", userSession.phone);
      }

      const response = await fetch(`/api/print`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        if (userSession) {
          setTimeout(() => {
            refreshUserPoints();
          }, 3000);
        }

        alert(
          `✅ Payment berhasil! File sedang diproses untuk print.\n` +
            `📄 ${totalPagesToPrint} halaman akan dicetak.\n` +
            (userSession
              ? `🎉 +${pointsToAdd} point telah ditambahkan!\nPoint akan di-update otomatis...\n`
              : "") +
            `Job ID: ${result.jobId}\n\nHalaman akan direfresh...`
        );

        setTimeout(() => {
          window.location.reload();
        }, 2000);
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

  const checkUserPoints = async () => {
    if (!phoneNumber.trim()) {
      alert("Silakan masukkan nomor HP terlebih dahulu");
      return;
    }

    const cleanPhone = phoneNumber.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      alert("Nomor HP harus minimal 10 digit");
      return;
    }

    setCheckingPoints(true);
    try {
      const response = await fetch(`/api/users/${cleanPhone}/points`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        if (result.user) {
          setUserPoints(result.points);
          setUserSession({
            phone: cleanPhone,
            points: result.points,
            name: result.user.name || `User ${cleanPhone}`,
          });

          localStorage.setItem(
            "userSession",
            JSON.stringify({
              phone: cleanPhone,
              points: result.points,
              name: result.user.name || `User ${cleanPhone}`,
              timestamp: Date.now(),
            })
          );

          alert(
            `✅ Point berhasil dicek! Anda memiliki ${result.points.toFixed(
              2
            )} point.`
          );
        } else if (result.user === null) {
          await createNewUserDirect(cleanPhone);
        }
      } else {
        throw new Error(result.error || "Gagal memeriksa poin");
      }
    } catch (error) {
      console.error("❌ Error checking points:", error);
      await createNewUserDirect(cleanPhone, true);
    } finally {
      setCheckingPoints(false);
    }
  };

  const createNewUserDirect = async (phone, isFallback = false) => {
    try {
      const createResponse = await fetch(`/api/users/points`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: phone,
          points: 0,
          amount: 0,
          orderId: `init-${Date.now()}`,
          fileName: "user-initialization.pdf",
        }),
      });

      if (createResponse.ok) {
        const createResult = await createResponse.json();

        setUserPoints(0);
        setUserSession({
          phone: phone,
          points: 0,
          name: `User ${phone}`,
        });

        localStorage.setItem(
          "userSession",
          JSON.stringify({
            phone: phone,
            points: 0,
            name: `User ${phone}`,
            timestamp: Date.now(),
          })
        );

        if (isFallback) {
          alert("✅ Nomor HP berhasil didaftarkan! Mulai dengan 0 point.");
        } else {
          alert("✅ Akun baru berhasil dibuat! Anda mendapatkan 0 point awal.");
        }
      } else {
        throw new Error("Gagal membuat user baru");
      }
    } catch (error) {
      console.error("❌ Error creating user:", error);

      setUserPoints(0);
      setUserSession({
        phone: phone,
        points: 0,
        name: `User ${phone}`,
      });

      localStorage.setItem(
        "userSession",
        JSON.stringify({
          phone: phone,
          points: 0,
          name: `User ${phone}`,
          timestamp: Date.now(),
        })
      );

      alert("⚠️ Sistem point sedang maintenance. Lanjut dengan 0 point.");
    }
  };

  const logoutUser = () => {
    setUserSession(null);
    setUserPoints(null);
    setPhoneNumber("");
    localStorage.removeItem("userSession");
  };

  useEffect(() => {
    const savedSession = localStorage.getItem("userSession");
    if (savedSession) {
      const session = JSON.parse(savedSession);
      if (Date.now() - session.timestamp < 24 * 60 * 60 * 1000) {
        setUserSession(session);
        setUserPoints(session.points);
        setPhoneNumber(session.phone);
      } else {
        localStorage.removeItem("userSession");
      }
    }
  }, []);

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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
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

              {file && totalPages > 0 && (
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 sm:p-6">
                  <PageSelector
                    totalPages={totalPages}
                    initialSettings={advancedSettings}
                    onSettingsChange={handleSettingsChange}
                    file={file}
                  />
                </div>
              )}

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

              {/* Section Point Reward */}
              <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                  Point Reward
                </h3>

                {!userSession ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nomor HP untuk Cek Poin
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="Contoh: 085117038583"
                          className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white text-gray-700"
                        />
                        <button
                          type="button"
                          onClick={checkUserPoints}
                          disabled={checkingPoints}
                          className="px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:bg-yellow-400 transition-colors font-medium cursor-pointer"
                        >
                          {checkingPoints ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>
                          ) : (
                            "Check Point"
                          )}
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Masukkan nomor HP untuk melihat dan mendapatkan poin
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600">
                          Nomor HP terdaftar:
                        </p>
                        <p className="font-semibold text-gray-800">
                          {userSession.phone}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={refreshUserPoints}
                          disabled={refreshingPoints}
                          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:bg-blue-50 transition-colors cursor-pointer flex items-center gap-1"
                          title="Refresh point terbaru"
                        >
                          {refreshingPoints ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-700"></div>
                          ) : (
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                              />
                            </svg>
                          )}
                          Refresh
                        </button>
                        <button
                          onClick={logoutUser}
                          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors cursor-pointer"
                        >
                          Logout
                        </button>
                      </div>
                    </div>

                    {/* BAGIAN INI YANG DITAMBAH TOMBOL TUKAR POINT */}
                    <div className="bg-white rounded-lg p-4 border-2 border-yellow-200">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">
                          Total Point Anda
                        </p>
                        <p className="text-3xl font-bold text-yellow-600">
                          {typeof userPoints === "number"
                            ? userPoints.toFixed(2)
                            : "0.00"}{" "}
                          Point
                        </p>

                        {/* TOMBOL TUKAR POINT */}
                        <button
                          onClick={() =>
                            window.open(
                              "https://irc-store-one.vercel.app/product",
                              "_blank"
                            )
                          }
                          className="mt-3 w-full max-w-xs mx-auto px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 font-medium text-sm cursor-pointer flex items-center justify-center gap-2 shadow-md"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                            />
                          </svg>
                          Tukar Point
                        </button>

                        <p className="text-xs text-gray-500 mt-2">
                          Terakhir update: {new Date().toLocaleTimeString()}
                        </p>
                      </div>
                    </div>

                    {advancedSettings.cost > 0 && userSession && (
                      <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-700">
                            Point yang akan didapat:
                          </span>
                          <span className="text-lg font-bold text-green-600">
                            +{(advancedSettings.cost / 2000).toFixed(2)} poin
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          Setiap Rp 2.000 = 1 point • Point akan ditambahkan
                          otomatis setelah print
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

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
