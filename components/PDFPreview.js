"use client";
import { useState, useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";

// Setup PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

const PDFPreview = ({ file, pageNumber, onRender }) => {
  const canvasRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!file) return;

    const renderPage = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        const page = await pdf.getPage(pageNumber);

        const viewport = page.getViewport({ scale: 0.5 }); // Scale untuk preview kecil
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        setIsLoading(false);
        onRender?.(); // Callback ketika render selesai
      } catch (err) {
        console.error("Error rendering PDF page:", err);
        setError("Gagal memuat preview");
        setIsLoading(false);
      }
    };

    renderPage();
  }, [file, pageNumber, onRender]);

  if (!file) return null;

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 bg-red-50 flex items-center justify-center p-2">
          <span className="text-red-600 text-xs">{error}</span>
        </div>
      )}

      <canvas
        ref={canvasRef}
        className={`border border-gray-200 rounded ${
          isLoading ? "opacity-50" : "opacity-100"
        }`}
        style={{ width: "100%", height: "auto" }}
      />
    </div>
  );
};

export default PDFPreview;
