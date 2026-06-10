"use client";
import { useState, useEffect, useCallback } from "react";
import { useHubAuth } from "../../auth/hooks/useHubAuth";

export const usePartnerPrinters = () => {
  const { token } = useHubAuth();
  const [printers, setPrinters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    city: "",
  });

  // Statistik profit untuk semua printer partner
  const [profitStats, setProfitStats] = useState({
    totalPendingPayout: 0,
    totalPaidProfit: 0,
    totalRevenue: 0,
    totalPlatformProfit: 0,
    printerCount: 0,
  });

  // Helper: Format tanggal
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Helper: Format Rupiah
  const formatRupiah = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Helper: Format number
  const formatNumber = (num) => {
    return new Intl.NumberFormat("id-ID").format(num || 0);
  };

  const fetchPrinters = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch("/api/hub/printers", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      if (data.success) {
        setPrinters(data.data);

        // Hitung profit stats dari semua printer
        let totalPending = 0;
        let totalPaid = 0;
        let totalRev = 0;
        let totalPlatform = 0;

        for (const printer of data.data) {
          const profitRes = await fetch(
            `/api/hub/printers/${printer.printerId}/profit-stats`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          if (profitRes.ok) {
            const profitData = await profitRes.json();
            if (profitData.success) {
              const pending = profitData.pendingPayout || 0;
              const paid = profitData.paidProfit || 0;
              const rev = profitData.totalRevenue || 0;
              totalPending += pending;
              totalPaid += paid;
              totalRev += rev;
              totalPlatform += profitData.platformProfit ?? (rev - pending - paid);
            }
          }
        }

        setProfitStats({
          totalPendingPayout: totalPending,
          totalPaidProfit: totalPaid,
          totalRevenue: totalRev,
          totalPlatformProfit: totalPlatform,
          printerCount: data.data.length,
        });
      }
    } catch (err) {
      console.error("❌ Error fetching printers:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const filteredPrinters = printers.filter((printer) => {
    if (
      filters.search &&
      !(printer.printerName || printer.name || "").toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }
    if (filters.status && printer.status !== filters.status) {
      return false;
    }
    if (filters.city && printer.location?.city !== filters.city) {
      return false;
    }
    return true;
  });

  useEffect(() => {
    if (token) fetchPrinters();
  }, [token]);

  return {
    printers: filteredPrinters,
    allPrinters: printers,
    profitStats,
    loading,
    error,
    filters,
    setFilters,
    refresh: fetchPrinters,
    formatDate,
    formatRupiah,
    formatNumber,
  };
};
