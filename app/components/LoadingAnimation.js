// components/LoadingAnimation.js
"use client";
import { useEffect, useState } from "react";

export default function LoadingAnimation() {
  const [useApng, setUseApng] = useState(false);

  useEffect(() => {
    // Deteksi browser yang tidak support WebM alpha
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari =
      navigator.userAgent.includes("Safari") &&
      !navigator.userAgent.includes("Chrome");
    setUseApng(isIOS || isSafari);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/50 backdrop-blur-sm">
      {useApng ? (
        <img
          src="/assets/animations/loading.apng"
          alt="Loading"
          className="w-1/4 max-w-[200px]"
        />
      ) : (
        <video autoPlay loop muted playsInline className="w-1/4 max-w-[200px]">
          <source src="/assets/animations/loading.webm" type="video/webm" />
          {/* Fallback ke APNG jika WebM tidak support */}
          <img
            src="/assets/animations/loading.apng"
            alt="Loading"
            className="w-full h-full object-contain"
          />
        </video>
      )}
    </div>
  );
}
