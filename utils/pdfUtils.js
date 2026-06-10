// utils/pdfUtils.js
import * as pdfjsLib from "pdfjs-dist";

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

// Ukuran kertas dalam points (1pt = 1/72 inch). Selalu dalam orientasi portrait (lebar < tinggi).
const PAPER_SIZES = [
  { name: "A4",     w: 595, h: 842 },
  { name: "F4",     w: 612, h: 936 }, // 8.5" × 13" — standar Folio Indonesia
  { name: "F4",     w: 595, h: 935 }, // varian F4 210mm × 330mm
  { name: "A5",     w: 420, h: 595 },
  { name: "Letter", w: 612, h: 792 },
  { name: "Legal",  w: 612, h: 1008 },
  { name: "A3",     w: 842, h: 1191 },
  { name: "B5",     w: 499, h: 709 },
];
const TOLERANCE = 10; // ±10 points

export async function detectPDFPageSize(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    const page = await pdf.getPage(1);
    const [, , rawW, rawH] = page.view; // [x, y, width, height] in points

    // Normalisasi ke portrait
    const w = Math.min(rawW, rawH);
    const h = Math.max(rawW, rawH);

    for (const size of PAPER_SIZES) {
      if (
        Math.abs(w - size.w) <= TOLERANCE &&
        Math.abs(h - size.h) <= TOLERANCE
      ) {
        return size.name;
      }
    }
    return null; // tidak dikenali
  } catch (error) {
    console.error("Error detecting PDF page size:", error);
    return null;
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
