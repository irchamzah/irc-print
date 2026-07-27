// components/PaperSizeTutorialModal.js
"use client";

import { useEffect, useState } from "react";

const STEPS = [
  {
    gif: "/assets/animations/change-paper/step-1.gif",
    button: "Sudah saya ambil dan taruh kertasnya",
  },
  {
    gif: "/assets/animations/change-paper/step-2.gif",
    button: "Sudah saya ambil kertas yang sesuai dan dimasukkan ke printer",
  },
  {
    gif: "/assets/animations/change-paper/step-3.gif",
    button: "Kertas sudah rapi",
  },
  {
    gif: "/assets/animations/change-paper/step-4.gif",
    button: "Paper guide sudah didempetkan",
  },
];

const PaperSizeTutorialModal = ({ isOpen, onConfirm, detectedSize }) => {
  const [stepIndex, setStepIndex] = useState(0);

  // Reset ke langkah pertama setiap kali modal dibuka
  useEffect(() => {
    if (isOpen) setStepIndex(0);
  }, [isOpen]);

  // Preload semua GIF agar perpindahan langkah tidak nge-lag
  useEffect(() => {
    if (!isOpen) return;
    STEPS.forEach(({ gif }) => {
      const img = new Image();
      img.src = gif;
    });
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeLabel = detectedSize || "Tidak Diketahui";
  const step = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onConfirm?.();
    } else {
      setStepIndex((prev) => prev + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-60 transition-opacity" />

      <div className="flex min-h-full items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="relative bg-white rounded-t-2xl sm:rounded-xl shadow-xl w-full sm:w-full sm:max-w-lg mx-auto">
          {/* Drag indicator (mobile) */}
          <div className="sm:hidden flex justify-center pt-2 pb-1">
            <div className="w-12 h-1 bg-gray-300 rounded-full" />
          </div>

          {/* Body */}
          <div className="p-4 sm:p-5 space-y-4">
            {/* Info message */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-gray-700 text-sm leading-relaxed">
                File PDF anda berukuran{" "}
                <span className="font-bold text-blue-700">{sizeLabel}</span>
                {", "}pastikan bahwa kertas yang terpasang di printer adalah
                kertas{" "}
                <span className="font-bold text-blue-700">{sizeLabel}</span>.
              </p>
            </div>

            {/* Tutorial animasi per langkah */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-gray-500">
                  Cara mengganti ukuran kertas di printer:
                </p>
                <p className="text-xs font-semibold text-gray-500">
                  Langkah {stepIndex + 1} dari {STEPS.length}
                </p>
              </div>

              <div className="relative w-full bg-black rounded-lg overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  key={step.gif}
                  src={step.gif}
                  alt={`Langkah ${stepIndex + 1} mengganti kertas`}
                  className="w-full h-auto object-contain"
                />
              </div>

              {/* Indikator progress */}
              <div className="flex items-center justify-center gap-2 mt-3">
                {STEPS.map((s, i) => (
                  <span
                    key={s.gif}
                    className={`h-1.5 rounded-full transition-all ${
                      i === stepIndex
                        ? "w-6 bg-blue-600"
                        : i < stepIndex
                        ? "w-1.5 bg-blue-400"
                        : "w-1.5 bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 rounded-b-2xl sm:rounded-b-xl border-t border-gray-200 p-4 sm:p-5">
            <button
              type="button"
              onClick={handleNext}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors text-sm"
            >
              ✅ {step.button}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaperSizeTutorialModal;
