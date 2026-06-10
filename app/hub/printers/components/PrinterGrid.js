"use client";
import { PrinterCard } from "./PrinterCard";

// PrinterGrid TERPAKAI
export const PrinterGrid = ({ printers, formatDate, formatNumber }) => {
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
