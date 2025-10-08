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

  //   const handleCheckPayment = async () => {
  //     if (!paymentData?.orderId) return;

  //     setIsCheckingPayment(true);
  //     try {
  //       // Check payment status dari Midtrans
  //       const response = await fetch(
  //         `/api/payment/status?orderId=${paymentData.orderId}`
  //       );
  //       const result = await response.json();

  //       if (result.status === "settlement") {
  //         onSuccess();
  //       } else {
  //         alert(
  //           `Status pembayaran: ${
  //             result.status || "pending"
  //           }\nSilakan selesaikan pembayaran.`
  //         );
  //       }
  //     } catch (error) {
  //       console.error("Error checking payment:", error);
  //       alert("Gagal memeriksa status pembayaran.");
  //     } finally {
  //       setIsCheckingPayment(false);
  //     }
  //   };

  const handleCheckPayment = async () => {
    if (!paymentData?.orderId) return;

    setIsCheckingPayment(true);
    try {
      console.log("🔍 Simulating payment check...");

      // Simulate loading
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Auto success untuk testing
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            💳 Pembayaran QRIS
          </h2>
          <p className="text-gray-600 mb-4">
            Scan QR code berikut untuk melakukan pembayaran
          </p>

          {/* QR Code */}
          <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 mb-4">
            <img
              src={paymentData?.qrCode}
              alt="QRIS Code"
              className="w-64 h-64 mx-auto"
              onError={(e) => {
                e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
                  paymentData?.redirectUrl || ""
                )}`;
              }}
            />
          </div>

          {/* Payment Details */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Total Pembayaran:</span>
              <span className="text-xl font-bold text-green-600">
                Rp {paymentData?.amount?.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Order ID:</span>
              <span className="text-gray-700 font-mono">
                {paymentData?.orderId}
              </span>
            </div>
          </div>

          {/* Timer */}
          <div className="bg-yellow-50 p-3 rounded-lg mb-4">
            <div className="flex items-center justify-center space-x-2">
              <svg
                className="w-5 h-5 text-yellow-600"
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
              <span className="text-yellow-700 font-medium">
                Sisa waktu:{" "}
                <span className="font-bold">{formatTime(timeLeft)}</span>
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleCheckPayment}
              disabled={isCheckingPayment || isLoading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors flex items-center justify-center"
            >
              {isCheckingPayment ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Memeriksa...
                </>
              ) : (
                "✅ Cek Status"
              )}
            </button>

            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 disabled:bg-gray-300 transition-colors"
            >
              ❌ Batal
            </button>
          </div>

          {/* Manual Payment Link */}
          <div className="mt-4 text-center">
            <a
              href={paymentData?.redirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              atau klik di sini untuk pembayaran manual
            </a>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                <span className="text-blue-700">
                  Mengirim file untuk printing...
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
