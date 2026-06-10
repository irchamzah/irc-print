"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useHubAuth } from "../../../auth/hooks/useHubAuth";

export const useAdminPrinterModels = () => {
  const { token } = useHubAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [printerModels, setPrinterModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    isActive: searchParams.get("isActive") || "",
    sortBy: searchParams.get("sortBy") || "createdAt",
    sortOrder: searchParams.get("sortOrder") || "desc",
  });

  const [pagination, setPagination] = useState({
    page: parseInt(searchParams.get("page")) || 1,
    limit: parseInt(searchParams.get("limit")) || 10,
    total: 0,
    totalPages: 0,
  });

  const fetchPrinterModels = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", pagination.page.toString());
      params.set("limit", pagination.limit.toString());
      if (filters.search) params.set("search", filters.search);
      if (filters.isActive) params.set("isActive", filters.isActive);
      if (filters.sortBy) params.set("sortBy", filters.sortBy);
      if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);

      const response = await fetch(
        `/api/hub/admin/printer-models?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      if (data.success) {
        setPrinterModels(data.data || []);
        setPagination((prev) => ({
          ...prev,
          total: data.pagination?.total || 0,
          totalPages: data.pagination?.totalPages || 0,
        }));
      }
    } catch (err) {
      console.error("❌ Error fetching printer models:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, pagination.page, pagination.limit, filters]);

  const createPrinterModel = useCallback(
    async (formData) => {
      try {
        const response = await fetch(`/api/hub/admin/printer-models`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
        const result = await response.json();
        if (result.success) await fetchPrinterModels();
        return result;
      } catch (err) {
        return { success: false, error: err.message };
      }
    },
    [token, fetchPrinterModels],
  );

  const updatePrinterModel = useCallback(
    async (printerModelId, formData) => {
      try {
        const response = await fetch(
          `/api/hub/admin/printer-models/${printerModelId}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          },
        );
        const result = await response.json();
        if (result.success) await fetchPrinterModels();
        return result;
      } catch (err) {
        return { success: false, error: err.message };
      }
    },
    [token, fetchPrinterModels],
  );

  const deletePrinterModel = useCallback(
    async (printerModelId) => {
      try {
        const response = await fetch(
          `/api/hub/admin/printer-models/${printerModelId}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const result = await response.json();
        if (result.success) await fetchPrinterModels();
        return result;
      } catch (err) {
        return { success: false, error: err.message };
      }
    },
    [token, fetchPrinterModels],
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
      search: "",
      isActive: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  useEffect(() => {
    if (token) fetchPrinterModels();
  }, [token, pagination.page, pagination.limit, filters]);

  return {
    printerModels,
    loading,
    error,
    pagination,
    filters,
    applyFilters,
    resetFilters,
    changePage,
    changeLimit,
    createPrinterModel,
    updatePrinterModel,
    deletePrinterModel,
    refresh: fetchPrinterModels,
  };
};
