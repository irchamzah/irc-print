"use client";
import CustomLink from "@/app/components/CustomLink";
import Link from "next/link";

export const PrinterCard = ({ printer, formatDate, formatNumber }) => {
  const statusColor =
    printer.status === "online" ? "bg-green-500" : "bg-gray-400";
  const statusText = printer.status === "online" ? "Online" : "Offline";

  return (
    <CustomLink
      href={`/hub/printers/${printer.printerId}`}
      className="block bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      {/* Header with status */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-gray-800 line-clamp-1">
              {printer.name}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {printer.location.city}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${statusColor}`}></div>
            <span className="text-xs text-gray-600">{statusText}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="p-4 bg-gray-50">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-xs text-gray-500">Kertas</p>
            <p className="font-bold text-gray-800">
              {printer.paperStatus.paperCount}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Print Jobs</p>
            <p className="font-bold text-gray-800">
              {formatNumber(printer.statistics.totalJobs)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Halaman</p>
            <p className="font-bold text-gray-800">
              {formatNumber(printer.statistics.totalPagesPrinted)}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-400">
          Terakhir aktif: {formatDate(printer.lastSeen)}
        </span>
        <svg
          className="w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </CustomLink>
  );
};
