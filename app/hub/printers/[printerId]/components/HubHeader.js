"use client";
import CustomLink from "@/app/components/CustomLink";
import Link from "next/link";

export const HubHeader = ({ printerId, printerName }) => {
  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              Hub Partner
            </h1>
            <p className="text-sm text-gray-500 mt-1">{printerName}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full">
              ID: {printerId.slice(0, 8)}...
            </div>
            <CustomLink
              href="/hub/printers"
              className="text-sm text-gray-600 hover:text-gray-900 border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50"
            >
              ← Kembali
            </CustomLink>
          </div>
        </div>
      </div>
    </div>
  );
};
