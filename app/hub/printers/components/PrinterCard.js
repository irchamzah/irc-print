"use client";
import { useState, useEffect } from "react";
import CustomLink from "@/app/components/CustomLink";
import { PrinterImages } from "./PrinterImages";
import { useHubAuth } from "../../auth/hooks/useHubAuth";

export const PrinterCard = ({ printer, formatDate, formatNumber }) => {
  const { isSuperAdmin } = useHubAuth();
  const isAdmin = isSuperAdmin();
  const [profitStats, setProfitStats] = useState({
    pendingPayout: 0,
    paidProfit: 0,
    totalRevenue: 0,
    platformProfit: 0,
  });
  const [loadingProfit, setLoadingProfit] = useState(true);

  useEffect(() => {
    const fetchProfitStats = async () => {
      try {
        const response = await fetch(
          `/api/hub/printers/${printer.printerId}/profit-stats`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("hubToken")}`,
            },
          },
        );
        if (response.ok) {
          const data = await response.json();
          console.log(
            `[PrinterCard] printerId=${printer.printerId} raw response:`,
            JSON.stringify(data),
          );
          if (data.success) {
            const pendingPayout = data.pendingPayout || 0;
            const paidProfit = data.paidProfit || 0;
            const totalRevenue = data.totalRevenue || 0;
            const stats = {
              pendingPayout,
              paidProfit,
              totalRevenue,
              platformProfit: data.platformProfit ?? (totalRevenue - pendingPayout - paidProfit),
            };
            console.log(`[PrinterCard] setProfitStats:`, JSON.stringify(stats));
            setProfitStats(stats);
          }
        } else {
          console.error(`[PrinterCard] response not ok: ${response.status}`);
        }
      } catch (error) {
        console.error("Error fetching profit stats:", error);
      } finally {
        setLoadingProfit(false);
      }
    };
    fetchProfitStats();
  }, [printer.printerId]);

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const statusColor =
    printer.status === "online"
      ? "bg-green-500"
      : printer.status === "offline"
        ? "bg-gray-400"
        : "bg-yellow-500";
  const statusText =
    printer.status === "online"
      ? "Online"
      : printer.status === "offline"
        ? "Offline"
        : "Maintenance";

  return (
    <CustomLink
      href={`/hub/printers/${printer.printerId}`}
      className="block bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      {/* Header with status */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800 line-clamp-1">
              {printer.printerName || printer.name}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {printer.location?.city || "Lokasi tidak tersedia"}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${statusColor}`}></div>
            <span className="text-xs text-gray-600">{statusText}</span>
          </div>
        </div>
      </div>

      {/* Images Gallery */}
      <PrinterImages printerId={printer.printerId} />

      {/* Profit Stats */}
      <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div
          className={`grid gap-2 ${isAdmin ? "grid-cols-3" : "grid-cols-2"}`}
        >
          <div className="text-center">
            <p className="text-xs text-orange-600">Profit Tertunda</p>
            <p className="text-sm font-bold text-orange-700">
              {loadingProfit ? "..." : formatRupiah(profitStats.pendingPayout)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-green-600">Total Profit</p>
            <p className="text-sm font-bold text-green-700">
              {loadingProfit ? "..." : formatRupiah(profitStats.paidProfit)}
            </p>
          </div>
          {isAdmin && (
            <div className="text-center">
              <p className="text-xs text-blue-600">Platform Profit</p>
              <p className="text-sm font-bold text-blue-700">
                {loadingProfit
                  ? "..."
                  : formatRupiah(profitStats.platformProfit)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="p-4 bg-gray-50">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-xs text-gray-500">Kertas</p>
            <p className="font-bold text-gray-800">
              {printer.paperStatus?.paperCount || 0}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Print Jobs</p>
            <p className="font-bold text-gray-800">
              {formatNumber(printer.statistics?.totalJobs || 0)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Halaman</p>
            <p className="font-bold text-gray-800">
              {formatNumber(printer.statistics?.totalPagesPrinted || 0)}
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
