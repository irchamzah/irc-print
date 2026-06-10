"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useHubAuth } from "../../../auth/hooks/useHubAuth";

export const useAdminPartnerWithdrawals = () => {
  const { token } = useHubAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [withdrawals, setWithdrawals] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    requested: 0,
    processed: 0,
    transferred: 0,
    totalAmount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    status: searchParams.get("status") || "",
    partnerId: searchParams.get("partnerId") || "",
    startDate: searchParams.get("startDate") || "",
    endDate: searchParams.get("endDate") || "",
    sortBy: searchParams.get("sortBy") || "createdAt",
    sortOrder: searchParams.get("sortOrder") || "desc",
  });

  const [pagination, setPagination] = useState({
    page: parseInt(searchParams.get("page")) || 1,
    limit: parseInt(searchParams.get("limit")) || 10,
    total: 0,
    totalPages: 0,
  });

  const fetchWithdrawals = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", pagination.page.toString());
      params.set("limit", pagination.limit.toString());
      if (filters.status) params.set("status", filters.status);
      if (filters.partnerId) params.set("partnerId", filters.partnerId);
      if (filters.startDate) params.set("startDate", filters.startDate);
      if (filters.endDate) params.set("endDate", filters.endDate);
      if (filters.sortBy) params.set("sortBy", filters.sortBy);
      if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);

      const response = await fetch(
        `/api/hub/admin/partner-withdrawals?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      if (data.success) {
        setWithdrawals(data.data || []);
        setStats(
          data.stats || {
            total: 0,
            requested: 0,
            processed: 0,
            transferred: 0,
            totalAmount: 0,
          },
        );
        setPagination((prev) => ({
          ...prev,
          total: data.pagination?.total || 0,
          totalPages: data.pagination?.totalPages || 0,
        }));
      }
    } catch (err) {
      console.error("❌ Error fetching withdrawals:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, pagination.page, pagination.limit, filters]);

  const processWithdrawal = useCallback(
    async (withdrawalId, status, transferProof = null) => {
      try {
        let body;
        let headers = {
          Authorization: `Bearer ${token}`,
        };

        if (transferProof && transferProof instanceof FormData) {
          body = transferProof;
          // Jangan set Content-Type untuk FormData
        } else {
          body = JSON.stringify({ status });
          headers["Content-Type"] = "application/json";
        }

        const response = await fetch(
          `/api/hub/admin/partner-withdrawals/${withdrawalId}/process`,
          {
            method: "POST",
            headers,
            body,
          },
        );

        const result = await response.json();

        if (result.success) {
          await fetchWithdrawals();
        }

        // ✅ PASTIKAN MENGEMBALIKAN RESULT
        return result;
      } catch (err) {
        console.error("❌ Error processing withdrawal:", err);
        // ✅ KEMBALIKAN OBJECT ERROR
        return { success: false, error: err.message };
      }
    },
    [token, fetchWithdrawals],
  );

  const changePage = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  const changeLimit = (newLimit) => {
    setPagination((prev) => ({ ...prev, page: 1, limit: newLimit }));
  };

  const applyFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const resetFilters = () => {
    setFilters({
      status: "",
      partnerId: "",
      startDate: "",
      endDate: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  useEffect(() => {
    if (token) fetchWithdrawals();
  }, [token, pagination.page, pagination.limit, filters]);

  return {
    withdrawals,
    stats,
    loading,
    error,
    pagination,
    filters,
    applyFilters,
    resetFilters,
    changePage,
    changeLimit,
    processWithdrawal,
    refresh: fetchWithdrawals,
  };
};
