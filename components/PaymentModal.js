"use client";
import { useState, useEffect } from "react";

export default function PaymentModal({
  isOpen,
  onClose,
  onSuccess,
  paymentData,
  isLoading = false,
}) {
  const [timeLeft, setTimeLeft] = useState(900); // 15 menit dalam detik
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, onClose]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleCheckPayment = async () => {
    if (!paymentData?.orderId) return;

    setIsCheckingPayment(true);
    try {
      console.log("🔍 Simulating payment check...");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("✅ Pembayaran berhasil! (Auto-success for testing)");
      onSuccess();
    } catch (error) {
      console.error("Error:", error);
      alert("Error simulated payment.");
    } finally {
      setIsCheckingPayment(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
      {/* Modal Container - Responsive sizing */}
      <div className="bg-white rounded-2xl w-full max-w-sm sm:max-w-md md:max-w-lg mx-auto my-auto shadow-2xl transform transition-all">
        {/* Header dengan gradient */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-2xl p-4 sm:p-6 text-white">
          <div className="flex items-center justify-center space-x-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-full">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
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
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-lg sm:text-xl font-bold">Pembayaran QRIS</h2>
              <p className="text-blue-100 text-xs sm:text-sm opacity-90">
                Scan QR code untuk pembayaran
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Amount Display */}
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-1">Total Pembayaran</p>
            <div className="text-2xl sm:text-3xl font-bold text-green-600 break-all">
              Rp {paymentData?.amount?.toLocaleString("id-ID")}
            </div>
          </div>

          {/* QR Code Container */}
          <div className="bg-gray-50 p-3 sm:p-4 rounded-xl border-2 border-dashed border-gray-200">
            <div className="bg-white p-2 rounded-lg mx-auto max-w-xs">
              <img
                src={paymentData?.qrCode}
                alt="QRIS Code"
                className="w-full aspect-square"
                onError={(e) => {
                  e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
                    paymentData?.redirectUrl || ""
                  )}`;
                }}
              />
            </div>
          </div>

          {/* Order Info */}
          <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-xs sm:text-sm">
                  Order ID:
                </span>
                <span className="font-mono text-gray-800 font-medium text-xs sm:text-sm break-all ml-2">
                  {paymentData?.orderId}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-xs sm:text-sm">
                  Metode:
                </span>
                <span className="text-gray-800 font-medium text-xs sm:text-sm">
                  QRIS
                </span>
              </div>
            </div>
          </div>

          {/* Timer */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 sm:p-4">
            <div className="flex items-center justify-center space-x-2 sm:space-x-3">
              <div className="bg-orange-100 p-1 sm:p-2 rounded-full">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-orange-800 text-xs sm:text-sm font-medium">
                  Selesaikan pembayaran dalam
                </p>
                <p className="text-orange-600 font-bold text-base sm:text-lg">
                  {formatTime(timeLeft)}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons - Stack on mobile, side by side on larger screens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            <button
              onClick={handleCheckPayment}
              disabled={isCheckingPayment || isLoading}
              className="bg-green-600 text-white py-3 px-4 rounded-xl hover:bg-green-700 disabled:bg-green-300 transition-all duration-200 font-medium flex items-center justify-center space-x-2 shadow-lg shadow-green-200 disabled:shadow-none text-sm sm:text-base"
            >
              {isCheckingPayment ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Memeriksa...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Cek Status</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              disabled={isLoading}
              className="bg-gray-500 text-white py-3 px-4 rounded-xl hover:bg-gray-600 disabled:bg-gray-300 transition-all duration-200 font-medium flex items-center justify-center space-x-2 shadow-lg shadow-gray-200 disabled:shadow-none text-sm sm:text-base"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <span>Batal</span>
            </button>
          </div>

          {/* Manual Payment Link */}
          <div className="text-center pt-2">
            <a
              href={paymentData?.redirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium transition-colors break-all"
            >
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              <span className="truncate">Buka halaman pembayaran manual</span>
            </a>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="p-3 sm:p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-blue-600"></div>
                <div>
                  <p className="text-blue-800 font-medium text-sm sm:text-base">
                    Mengirim file untuk printing...
                  </p>
                  <p className="text-blue-600 text-xs sm:text-sm">
                    Harap tunggu sebentar
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Help Text */}
          <div className="text-center pt-2">
            <p className="text-gray-500 text-xs leading-relaxed">
              Gunakan aplikasi e-wallet atau mobile banking untuk scan QR code
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
