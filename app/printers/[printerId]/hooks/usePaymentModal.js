import { useEffect, useRef, useState } from "react";

const NEXT_PUBLIC_MIDTRANS_ENVIRONMENT =
  process.env.NEXT_PUBLIC_MIDTRANS_ENVIRONMENT;
const NEXT_PUBLIC_MIDTRANS_CLIENT_KEY_SANDBOX =
  process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY_SANDBOX;
const NEXT_PUBLIC_MIDTRANS_CLIENT_KEY_PRODUCTION =
  process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY_PRODUCTION;

// usePaymentModal TERPAKAI
export const usePaymentModal = (
  isOpen,
  paymentData,
  isRestoredTransaction = false,
  currentPrintJobId,
) => {
  const [snapLoaded, setSnapLoaded] = useState(false);
  const [snapError, setSnapError] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const snapScriptRef = useRef(null);
  const isSnapOpenRef = useRef(false);
  const hasAttemptedOpenRef = useRef(false);

  // ✅ Suppress console errors dari Midtrans Snap
  useEffect(() => {
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;

    // Daftar pesan error yang akan diabaikan
    const suppressedMessages = [
      "Network Error: Failed to fetch",
      "Failed sending payload to the receiver",
      "snap-assets.al-pc-id-b.cdn.gtflabs.io",
      "Faro @grafana/faro-web-sdk",
      "Failed to fetch",
      "Network request failed",
    ];

    console.error = (...args) => {
      const errorMessage = args[0]?.toString() || "";

      // Cek apakah error berasal dari Midtrans Snap
      const isMidtransError = suppressedMessages.some((msg) =>
        errorMessage.includes(msg),
      );

      // Cek apakah error dari script Midtrans
      const isFromMidtransScript =
        args[0]?.stack?.includes("snap-assets") ||
        errorMessage.includes("snap-assets");

      if (isMidtransError || isFromMidtransScript) {
        // Abaikan error Midtrans
        return;
      }

      // Error lain tetap ditampilkan
      originalConsoleError.apply(console, args);
    };

    console.warn = (...args) => {
      const warnMessage = args[0]?.toString() || "";

      if (
        warnMessage.includes("snap-assets") ||
        warnMessage.includes("Midtrans")
      ) {
        return;
      }

      originalConsoleWarn.apply(console, args);
    };

    return () => {
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
    };
  }, []);

  // Load Snap script
  useEffect(() => {
    if (!isOpen || !paymentData?.token) {
      isSnapOpenRef.current = false;
      hasAttemptedOpenRef.current = false;
      return;
    }

    setSnapLoaded(false);
    setSnapError(false);
    isSnapOpenRef.current = false;
    hasAttemptedOpenRef.current = false;

    // Remove previous script if exists
    if (
      snapScriptRef.current &&
      document.body.contains(snapScriptRef.current)
    ) {
      document.body.removeChild(snapScriptRef.current);
      snapScriptRef.current = null;
    }

    const snapUrl =
      NEXT_PUBLIC_MIDTRANS_ENVIRONMENT === "production"
        ? "https://app.midtrans.com/snap/snap.js"
        : "https://app.sandbox.midtrans.com/snap/snap.js";

    const clientKey =
      NEXT_PUBLIC_MIDTRANS_ENVIRONMENT === "production"
        ? NEXT_PUBLIC_MIDTRANS_CLIENT_KEY_PRODUCTION
        : NEXT_PUBLIC_MIDTRANS_CLIENT_KEY_SANDBOX;

    const script = document.createElement("script");
    script.src = snapUrl;
    script.setAttribute("data-client-key", clientKey);
    script.async = true;

    script.onload = () => {
      setSnapLoaded(true);
    };

    script.onerror = () => {
      setSnapError(true);
      setSnapLoaded(false);
    };

    document.body.appendChild(script);
    snapScriptRef.current = script;

    return () => {
      setTimeout(() => {
        if (
          snapScriptRef.current &&
          document.body.contains(snapScriptRef.current)
        ) {
          try {
            document.body.removeChild(snapScriptRef.current);
          } catch (e) {
            // Silent cleanup error
          }
          snapScriptRef.current = null;
        }
      }, 1000);

      isSnapOpenRef.current = false;
      hasAttemptedOpenRef.current = false;
    };
  }, [isOpen, paymentData?.token, isRestoredTransaction]);

  // openSnapPayment function
  const openSnapPayment = (onSuccess, onError, onClose) => {
    if (isSnapOpenRef.current || !paymentData?.token || !window.snap) {
      return;
    }

    setSnapError(false);
    isSnapOpenRef.current = true;
    hasAttemptedOpenRef.current = true;

    try {
      window.snap.pay(paymentData.token, {
        onSuccess: function (result) {
          isSnapOpenRef.current = false;
          hasAttemptedOpenRef.current = false;
          onSuccess(currentPrintJobId);
        },
        onPending: function (result) {
          isSnapOpenRef.current = false;
          hasAttemptedOpenRef.current = false;
          onSuccess(result);
        },
        onError: function (result) {
          isSnapOpenRef.current = false;
          hasAttemptedOpenRef.current = false;
          setSnapError(true);
          onError?.(result);
        },
        onClose: function () {
          isSnapOpenRef.current = false;
          hasAttemptedOpenRef.current = false;
          setSnapError(false);
          if (onClose) {
            onClose();
          }
        },
      });
    } catch (error) {
      console.error("Error opening Snap:", error);
      isSnapOpenRef.current = false;
      hasAttemptedOpenRef.current = false;
      setSnapError(true);
    }
  };

  return {
    snapLoaded,
    snapError,
    isCancelling,
    isSnapOpen: isSnapOpenRef.current,
    openSnapPayment,
    setHasAttemptedOpen: (value) => {
      hasAttemptedOpenRef.current = value;
    },
  };
};
