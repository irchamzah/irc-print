// utils/pdfUtils.js
import * as pdfjsLib from "pdfjs-dist";

// Gunakan worker yang sama dengan PDFPreview
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js`;

export async function getPDFPageCount(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    return pdf.numPages;
  } catch (error) {
    console.error("Error getting PDF page count:", error);
    throw error;
  }
}

export function validatePDFFile(file) {
  if (file.type !== "application/pdf") {
    return { isValid: false, error: "Hanya file PDF yang diperbolehkan!" };
  }

  if (file.size > 10 * 1024 * 1024) {
    return { isValid: false, error: "File terlalu besar! Maksimal 10MB." };
  }

  return { isValid: true, error: null };
}
