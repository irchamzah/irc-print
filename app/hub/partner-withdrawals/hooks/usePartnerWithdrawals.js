"use client";
import { useState, useEffect, useCallback } from "react";
import { useHubAuth } from "../../auth/hooks/useHubAuth";

export const usePartnerWithdrawals = () => {
  const { token } = useHubAuth();
  const [allWithdrawals, setAllWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    requested: 0,
    processed: 0,
    transferred: 0,
    totalAmount: 0,
  });
  const [filters, setFilters] = useState({
    status: "",
    startDate: "",
    endDate: "",
  });

  const fetchWithdrawals = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch("/api/hub/partner-withdrawals", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      if (data.success) {
        const w = data.data || [];
        setAllWithdrawals(w);
        setStats({
          total: w.length,
          requested: w.filter((wd) => wd.status === "requested").length,
          processed: w.filter((wd) => wd.status === "processed").length,
          transferred: w.filter((wd) => wd.status === "transferred").length,
          totalAmount: w.reduce((sum, wd) => sum + (wd.totalAmount || 0), 0),
        });
      }
    } catch (err) {
      console.error("❌ Error fetching withdrawals:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const createWithdrawal = useCallback(
    async (withdrawalData) => {
      try {
        const response = await fetch(`/api/hub/partner-withdrawals`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(withdrawalData),
        });
        const result = await response.json();
        if (result.success) {
          await fetchWithdrawals();
        }
        return result;
      } catch (err) {
        return { success: false, error: err.message };
      }
    },
    [token, fetchWithdrawals],
  );

  const withdrawals = allWithdrawals.filter((wd) => {
    if (filters.status && wd.status !== filters.status) return false;
    if (filters.startDate && new Date(wd.createdAt) < new Date(filters.startDate)) return false;
    if (filters.endDate && new Date(wd.createdAt) > new Date(filters.endDate + "T23:59:59")) return false;
    return true;
  });

  const applyFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters({ status: "", startDate: "", endDate: "" });
  };

  useEffect(() => {
    if (token) fetchWithdrawals();
  }, [token]);

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

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

  const getStatusBadge = (status) => {
    const statusMap = {
      requested: {
        label: "Diminta",
        className: "bg-yellow-100 text-yellow-700",
      },
      processed: { label: "Diproses", className: "bg-blue-100 text-blue-700" },
      transferred: {
        label: "Ditransfer",
        className: "bg-green-100 text-green-700",
      },
    };
    const s = statusMap[status] || {
      label: status,
      className: "bg-gray-100 text-gray-700",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${s.className}`}>
        {s.label}
      </span>
    );
  };

  return {
    withdrawals,
    stats,
    loading,
    error,
    filters,
    applyFilters,
    resetFilters,
    createWithdrawal,
    refresh: fetchWithdrawals,
    formatRupiah,
    formatDate,
    getStatusBadge,
  };
};
