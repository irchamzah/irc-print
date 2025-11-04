"use client";
import { usePaymentModal } from "../hooks/usePaymentModal";

const PaymentModal = ({
  isOpen,
  onClose,
  onSuccess,
  paymentData,
  isLoading = false,
  userSession = null,
  isRestoredTransaction = false,
}) => {
  const {
    snapLoaded,
    snapError,
    isCancelling,
    isSnapOpen,
    openSnapPayment,
    cancelTransaction,
    setHasAttemptedOpen,
  } = usePaymentModal(isOpen, paymentData, isRestoredTransaction);

  const handleManualOpenSnap = () => {
    if (snapLoaded && !isSnapOpen) {
      setHasAttemptedOpen(true);
      openSnapPayment(onSuccess);
    }
  };

  const handleCancelTransaction = async () => {
    if (!window.confirm("Apakah Anda yakin ingin membatalkan transaksi ini?")) {
      return;
    }

    const result = await cancelTransaction(userSession);
    if (result.success) {
      alert("❌ Transaksi berhasil dibatalkan");
      onClose();
    } else {
      alert("❌ Gagal membatalkan transaksi: " + result.error);
    }
  };

  const handleManualClose = () => {
    setTimeout(() => {
      onClose();
    }, 100);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center relative">
        <CloseButton
          onClose={handleManualClose}
          disabled={isLoading || isCancelling}
        />

        <ModalContent
          snapLoaded={snapLoaded}
          snapError={snapError}
          isRestoredTransaction={isRestoredTransaction}
          paymentData={paymentData}
          isSnapOpen={isSnapOpen}
          isLoading={isLoading}
          isCancelling={isCancelling}
          onManualOpenSnap={handleManualOpenSnap}
          onCancelTransaction={handleCancelTransaction}
        />
      </div>
    </div>
  );
};

// Sub-components
const CloseButton = ({ onClose, disabled }) => (
  <button
    onClick={onClose}
    disabled={disabled}
    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
    title="Tutup modal pembayaran"
  >
    <svg
      className="w-6 h-6"
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
  </button>
);

const ModalContent = ({
  snapLoaded,
  snapError,
  isRestoredTransaction,
  paymentData,
  isSnapOpen,
  isLoading,
  isCancelling,
  onManualOpenSnap,
  onCancelTransaction,
}) => {
  if (!snapLoaded && !snapError) {
    return <LoadingState isRestoredTransaction={isRestoredTransaction} />;
  }

  if (snapError) {
    return <ErrorState />;
  }

  return (
    <>
      <OrderInfo
        paymentData={paymentData}
        isRestoredTransaction={isRestoredTransaction}
      />

      {snapLoaded && !isSnapOpen && (
        <OpenSnapButton
          isRestoredTransaction={isRestoredTransaction}
          disabled={isLoading || isCancelling}
          onClick={onManualOpenSnap}
        />
      )}

      {isSnapOpen && <SnapOpenState />}

      {/* {!isSnapOpen && (
        <CancelButton
          isCancelling={isCancelling}
          onClick={onCancelTransaction}
        />
      )} */}

      {isLoading && <LoadingFileState />}

      <HelpText />
    </>
  );
};

const LoadingState = ({ isRestoredTransaction }) => (
  <>
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
    <h3 className="text-lg font-semibold text-gray-800 mb-2">
      {isRestoredTransaction ? "Memuat Pembayaran..." : "Membuka Pembayaran..."}
    </h3>
    <p className="text-gray-600 mb-4">
      Sedang memuat halaman pembayaran Midtrans
    </p>
  </>
);

const ErrorState = () => (
  <>
    <div className="mx-auto mb-4 text-orange-500">
      <svg
        className="w-12 h-12 mx-auto"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
        />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-gray-800 mb-2">Perhatian</h3>
    <p className="text-gray-600 mb-4">
      Terjadi masalah teknis dengan pembayaran. Silakan coba lagi.
    </p>
  </>
);

const OrderInfo = ({ paymentData, isRestoredTransaction }) => (
  <div className="bg-gray-50 rounded-lg p-3 mb-4">
    <p className="text-sm text-gray-600">Order ID:</p>
    <p className="font-mono text-sm font-medium text-gray-800 break-all">
      {paymentData?.orderId}
    </p>
    <p className="text-lg font-bold text-green-600 mt-1">
      Rp {paymentData?.amount?.toLocaleString("id-ID")}
    </p>
    {/* {isRestoredTransaction && (
      <p className="text-xs text-orange-600 mt-2">
        ⏰ Transaksi berlaku hingga 1 jam
      </p>
    )} */}
  </div>
);

const OpenSnapButton = ({ isRestoredTransaction, disabled, onClick }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="w-full mb-3 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors font-medium cursor-pointer flex items-center justify-center space-x-2 shadow-lg"
  >
    <svg
      className="w-5 h-5"
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
    <span>
      {isRestoredTransaction ? "Lanjutkan Pembayaran" : "Buka Snap Pembayaran"}
    </span>
  </button>
);

const SnapOpenState = () => (
  <div className="w-full mb-3 bg-blue-100 border border-blue-300 text-blue-800 py-3 px-4 rounded-lg flex items-center justify-center space-x-2">
    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
    <span>Pop-up pembayaran sedang terbuka...</span>
  </div>
);

const CancelButton = ({ isCancelling, onClick }) => (
  <button
    onClick={onClick}
    disabled={isCancelling}
    className="w-full mb-3 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 disabled:bg-gray-300 transition-colors text-sm cursor-pointer flex items-center justify-center space-x-2"
  >
    {isCancelling ? (
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
    ) : (
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
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    )}
    <span>{isCancelling ? "Membatalkan..." : "Batalkan Transaksi"}</span>
  </button>
);

const LoadingFileState = () => (
  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
    <div className="flex items-center justify-center space-x-2">
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
      <p className="text-blue-800 text-sm font-medium">
        Mengirim file untuk printing...
      </p>
    </div>
  </div>
);

const HelpText = () => (
  <div className="text-xs text-gray-500 mt-3 space-y-1">
    <p>• Jika pop-up tidak terbuka, pastikan pop-up tidak diblokir</p>
    <p>• Transaksi otomatis expired setelah 1 jam</p>
  </div>
);

export default PaymentModal;
