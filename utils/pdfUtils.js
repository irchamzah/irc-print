import * as pdfjsLib from "pdfjs-dist/build/pdf";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export async function getPDFPageCount(file) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();

    fileReader.onload = async function (event) {
      try {
        const arrayBuffer = event.target.result;
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        resolve(pdf.numPages);
      } catch (error) {
        reject(error);
      }
    };

    fileReader.onerror = function (error) {
      reject(error);
    };

    fileReader.readAsArrayBuffer(file);
  });
}

export function validatePDFFile(file) {
  // Cek type file
  if (file.type !== "application/pdf") {
    return { isValid: false, error: "Hanya file PDF yang diperbolehkan!" };
  }

  // Cek size file (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    return { isValid: false, error: "File terlalu besar! Maksimal 10MB." };
  }

  return { isValid: true, error: null };
}
