// app/printers/[printerId]/hooks/usePaymentModal.js
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
) => {
  const [snapLoaded, setSnapLoaded] = useState(false);
  const [snapError, setSnapError] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const snapScriptRef = useRef(null);
  const isSnapOpenRef = useRef(false);
  const hasAttemptedOpenRef = useRef(false);

  // Suppress console errors for Midtrans
  useEffect(() => {
    const originalConsoleError = console.error;

    console.error = (...args) => {
      const errorMessage = args[0]?.toString() || "";

      if (
        errorMessage.includes("Network Error") &&
        (errorMessage.includes("snap-assets") ||
          errorMessage.includes("midtrans"))
      ) {
        return;
      }

      if (
        errorMessage.includes(
          "snap.pay is not allowed to be called in this state",
        )
      ) {
        return;
      }

      originalConsoleError.apply(console, args);
    };

    return () => {
      console.error = originalConsoleError;
    };
  }, []);

  // 🌐 openSnapPayment /app/printers/[printerId]/hooks/usePaymentModal.js TERPAKAI
  const openSnapPayment = (onSuccess, onError) => {
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
          onSuccess(result);
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
        },
      });
    } catch (error) {
      isSnapOpenRef.current = false;
      hasAttemptedOpenRef.current = false;
      setSnapError(true);
    }
  };

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
      if (!isRestoredTransaction && !hasAttemptedOpenRef.current) {
        setTimeout(() => {}, 1000);
      }
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

  return {
    // State
    snapLoaded,
    snapError,
    isCancelling,
    isSnapOpen: isSnapOpenRef.current,

    // Actions
    openSnapPayment,

    // Manual open control
    setHasAttemptedOpen: (value) => {
      hasAttemptedOpenRef.current = value;
    },
  };
};
