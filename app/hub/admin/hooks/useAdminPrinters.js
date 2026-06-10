// app/hub/admin/hooks/useAdminPrinters.js SUDAH DIUPDATE
"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useHubAuth } from "../../auth/hooks/useHubAuth";

export const useAdminPrinters = () => {
  const { token } = useHubAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  // State
  const [printers, setPrinters] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    online: 0,
    offline: 0,
    maintenance: 0,
    lowPaper: 0,
    outOfPaper: 0,
    unlimitedMode: 0, // ✅ Tambah stat untuk unlimited mode
    limitedMode: 0, // ✅ Tambah stat untuk limited mode
  });
  const [filterOptions, setFilterOptions] = useState({
    cities: [],
    provinces: [],
    paperModes: ["limited", "unlimited"], // ✅ Tambah opsi filter paper mode
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter state
  const [filters, setFilters] = useState({
    status: searchParams.get("status") || "",
    city: searchParams.get("city") || "",
    province: searchParams.get("province") || "",
    paperAvailable: searchParams.get("paperAvailable") || "",
    minPaperCount: searchParams.get("minPaperCount") || "",
    maxPaperCount: searchParams.get("maxPaperCount") || "",
    paperMode: searchParams.get("paperMode") || "", // ✅ Tambah filter paper mode
    search: searchParams.get("search") || "",
    sortBy: searchParams.get("sortBy") || "createdAt",
    sortOrder: searchParams.get("sortOrder") || "desc",
  });

  // Pagination state
  const [pagination, setPagination] = useState({
    page: parseInt(searchParams.get("page")) || 1,
    limit: parseInt(searchParams.get("limit")) || 10,
    total: 0,
    totalPages: 0,
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

  // Helper: Mendapatkan status kertas (low/out)
  const getPaperStatus = (paperCount, paperMode) => {
    if (paperMode === "unlimited") return "unlimited";
    if (paperCount === 0) return "out";
    if (paperCount < 20) return "low";
    return "normal";
  };

  // Helper: Build query params
  const buildQueryParams = useCallback(
    (extraParams = {}) => {
      const params = new URLSearchParams();

      // Pagination
      params.set("page", extraParams.page || pagination.page.toString());
      params.set("limit", extraParams.limit || pagination.limit.toString());

      // Filters
      if (filters.status) params.set("status", filters.status);
      if (filters.city) params.set("city", filters.city);
      if (filters.province) params.set("province", filters.province);
      if (filters.paperAvailable)
        params.set("paperAvailable", filters.paperAvailable);
      if (filters.minPaperCount)
        params.set("minPaperCount", filters.minPaperCount);
      if (filters.maxPaperCount)
        params.set("maxPaperCount", filters.maxPaperCount);
      if (filters.paperMode) params.set("paperMode", filters.paperMode); // ✅ Tambah
      if (filters.search) params.set("search", filters.search);
      if (filters.sortBy) params.set("sortBy", filters.sortBy);
      if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);

      return params;
    },
    [filters, pagination.page, pagination.limit],
  );

  // Update URL dengan filter & pagination
  const updateUrl = useCallback(
    (newPage, newLimit, newFilters) => {
      const params = new URLSearchParams();
      params.set("page", newPage.toString());
      params.set("limit", newLimit.toString());

      if (newFilters.status) params.set("status", newFilters.status);
      if (newFilters.city) params.set("city", newFilters.city);
      if (newFilters.province) params.set("province", newFilters.province);
      if (newFilters.paperAvailable)
        params.set("paperAvailable", newFilters.paperAvailable);
      if (newFilters.minPaperCount)
        params.set("minPaperCount", newFilters.minPaperCount);
      if (newFilters.maxPaperCount)
        params.set("maxPaperCount", newFilters.maxPaperCount);
      if (newFilters.paperMode) params.set("paperMode", newFilters.paperMode); // ✅ Tambah
      if (newFilters.search) params.set("search", newFilters.search);
      if (newFilters.sortBy) params.set("sortBy", newFilters.sortBy);
      if (newFilters.sortOrder) params.set("sortOrder", newFilters.sortOrder);

      router.push(`/hub/admin/printers?${params.toString()}`);
    },
    [router],
  );

  // Fetch printers data
  const fetchPrinters = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    try {
      const params = buildQueryParams();
      const url = `/api/hub/admin/printers?${params.toString()}`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      if (data.success) {
        setPrinters(data.data || []);

        // ✅ Update stats dengan data dari VPS
        setStats(
          data.stats || {
            total: 0,
            online: 0,
            offline: 0,
            maintenance: 0,
            lowPaper: 0,
            outOfPaper: 0,
            unlimitedMode: 0,
            limitedMode: 0,
          },
        );

        setFilterOptions(
          data.filters || {
            cities: [],
            provinces: [],
            paperModes: ["limited", "unlimited"],
          },
        );

        setPagination((prev) => ({
          ...prev,
          total: data.pagination?.total || 0,
          totalPages: data.pagination?.totalPages || 0,
        }));
      }
    } catch (err) {
      console.error("❌ Error fetching printers:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, buildQueryParams]);

  // Apply filters (reset page to 1)
  const applyFilters = useCallback(
    async (newFilters) => {
      const updatedFilters = { ...filters, ...newFilters };
      setFilters(updatedFilters);
      setPagination((prev) => ({ ...prev, page: 1 }));
      updateUrl(1, pagination.limit, updatedFilters);
    },
    [filters, pagination.limit, updateUrl],
  );

  // Reset all filters
  const resetFilters = useCallback(async () => {
    const emptyFilters = {
      status: "",
      city: "",
      province: "",
      paperAvailable: "",
      minPaperCount: "",
      maxPaperCount: "",
      paperMode: "",
      search: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    };
    setFilters(emptyFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
    updateUrl(1, pagination.limit, emptyFilters);
  }, [pagination.limit, updateUrl]);

  // Change page
  const changePage = useCallback(
    (newPage) => {
      if (newPage >= 1 && newPage <= pagination.totalPages) {
        setPagination((prev) => ({ ...prev, page: newPage }));
        updateUrl(newPage, pagination.limit, filters);
      }
    },
    [pagination.totalPages, pagination.limit, filters, updateUrl],
  );

  // Change limit (reset to page 1)
  const changeLimit = useCallback(
    (newLimit) => {
      setPagination((prev) => ({ ...prev, page: 1, limit: newLimit }));
      updateUrl(1, newLimit, filters);
    },
    [filters, updateUrl],
  );

  // Change sort
  const changeSort = useCallback(
    (sortBy, sortOrder) => {
      const updatedFilters = { ...filters, sortBy, sortOrder };
      setFilters(updatedFilters);
      setPagination((prev) => ({ ...prev, page: 1 }));
      updateUrl(1, pagination.limit, updatedFilters);
    },
    [filters, pagination.limit, updateUrl],
  );

  // Create printer
  const createPrinter = useCallback(
    async (printerData) => {
      try {
        const response = await fetch(`/api/hub/admin/printers`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(printerData),
        });

        const result = await response.json();
        if (result.success) {
          await fetchPrinters();
        }
        return result;
      } catch (err) {
        console.error("❌ Error creating printer:", err);
        return { success: false, error: err.message };
      }
    },
    [token, fetchPrinters],
  );

  // Update printer
  const updatePrinter = useCallback(
    async (printerId, printerData) => {
      try {
        const response = await fetch(`/api/hub/admin/printers/${printerId}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(printerData),
        });

        const result = await response.json();
        if (result.success) {
          await fetchPrinters();
        }
        return result;
      } catch (err) {
        console.error("❌ Error updating printer:", err);
        return { success: false, error: err.message };
      }
    },
    [token, fetchPrinters],
  );

  // Delete printer
  const deletePrinter = useCallback(
    async (printerId) => {
      try {
        const response = await fetch(`/api/hub/admin/printers/${printerId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        const result = await response.json();
        if (result.success) {
          await fetchPrinters();
        }
        return result;
      } catch (err) {
        console.error("❌ Error deleting printer:", err);
        return { success: false, error: err.message };
      }
    },
    [token, fetchPrinters],
  );

  // Helper: Mendapatkan status badge untuk printer
  const getPrinterStatusBadge = (status, paperMode, paperCount) => {
    if (status === "online") {
      return { class: "bg-green-100 text-green-700", text: "🟢 Online" };
    }
    if (status === "offline") {
      return { class: "bg-red-100 text-red-700", text: "🔴 Offline" };
    }
    return { class: "bg-yellow-100 text-yellow-700", text: "🟡 Maintenance" };
  };

  // Helper: Mendapatkan status kertas badge
  const getPaperStatusBadge = (paperCount, paperMode) => {
    if (paperMode === "unlimited") {
      return { class: "bg-purple-100 text-purple-700", text: "♾️ Unlimited" };
    }
    if (paperCount === 0) {
      return { class: "bg-red-100 text-red-700", text: "❌ Habis" };
    }
    if (paperCount < 20) {
      return { class: "bg-orange-100 text-orange-700", text: "⚠️ Menipis" };
    }
    return { class: "bg-green-100 text-green-700", text: "✅ Tersedia" };
  };

  // Initial load
  useEffect(() => {
    if (token) {
      fetchPrinters();
    }
  }, [token]);

  // Re-fetch when pagination changes
  useEffect(() => {
    if (token && pagination.page && pagination.limit) {
      fetchPrinters();
    }
  }, [token, filters, pagination.page, pagination.limit]);

  return {
    // Data
    printers,
    stats,
    filterOptions,
    loading,
    error,
    pagination,

    // Filters
    filters,
    applyFilters,
    resetFilters,

    // Pagination actions
    changePage,
    changeLimit,

    // Sort actions
    changeSort,

    // CRUD actions
    createPrinter,
    updatePrinter,
    deletePrinter,

    // Helpers
    formatDate,
    getPrinterStatusBadge,
    getPaperStatusBadge,
    getPaperStatus,
    refresh: fetchPrinters,
  };
};
