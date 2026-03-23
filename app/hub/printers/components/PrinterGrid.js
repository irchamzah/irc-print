"use client";
import { PrinterCard } from "./PrinterCard";

// PrinterGrid TERPAKAI
export const PrinterGrid = ({ printers, formatDate, formatNumber }) => {
  if (printers.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-700 mb-2">
          Belum Ada Printer
        </h3>
        <p className="text-sm text-gray-500">
          Anda belum memiliki akses ke printer manapun.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {printers.map((printer) => (
        <PrinterCard
          key={printer.printerId}
          printer={printer}
          formatDate={formatDate}
          formatNumber={formatNumber}
        />
      ))}
    </div>
  );
};
