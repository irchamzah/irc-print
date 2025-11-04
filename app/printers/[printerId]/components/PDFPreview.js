"use client";
import { useState, useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";

// Setup PDF.js worker - pastikan sama dengan pdfUtils
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js`;

const PDFPreview = ({ file, pageNumber, onRender }) => {
  const canvasRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const renderTaskRef = useRef(null);
  const pdfDocRef = useRef(null);

  useEffect(() => {
    if (!file) return;

    let isMounted = true;

    const renderPage = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Cancel previous render task
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
          renderTaskRef.current = null;
        }

        // Cleanup previous PDF doc
        if (pdfDocRef.current) {
          pdfDocRef.current.destroy();
          pdfDocRef.current = null;
        }

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({
          data: arrayBuffer,
          // Prevent caching untuk avoid conflict
          disableAutoFetch: true,
          disableStream: true,
        }).promise;

        if (!isMounted) return;

        pdfDocRef.current = pdf;

        const page = await pdf.getPage(pageNumber || 1);
        const viewport = page.getViewport({ scale: 0.5 });

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext("2d");

        // Clear canvas sebelum render baru
        context.clearRect(0, 0, canvas.width, canvas.height);

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render dengan task tracking
        const renderTask = page.render({
          canvasContext: context,
          viewport: viewport,
        });

        renderTaskRef.current = renderTask;

        await renderTask.promise;

        if (!isMounted) return;

        setIsLoading(false);
        onRender?.();
      } catch (err) {
        if (!isMounted) return;

        // Abort jika operation dibatalkan
        if (
          err?.name === "RenderingCancelledException" ||
          err?.message?.includes("cancel")
        ) {
          return;
        }

        console.error("Error rendering PDF page:", err);
        setError("Gagal memuat preview");
        setIsLoading(false);
      }
    };

    renderPage();

    // Cleanup function
    return () => {
      isMounted = false;

      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }

      if (pdfDocRef.current) {
        pdfDocRef.current.destroy();
        pdfDocRef.current = null;
      }
    };
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
