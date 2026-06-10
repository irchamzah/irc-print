// app/hub/admin/hooks/useAdminPaperRefills.js SUDAH DIUPDATE
"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useHubAuth } from "../../auth/hooks/useHubAuth";

export const useAdminPaperRefills = () => {
  const { token } = useHubAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  // State
  const [refills, setRefills] = useState([]);
  const [stats, setStats] = useState({
    total: {
      totalRefills: 0,
      totalRevenue: 0,
      totalPartnerProfit: 0, // ✅ Ganti totalProfit → totalPartnerProfit
      totalPlatformProfit: 0, // ✅ Tambah totalPlatformProfit
      totalSheets: 0,
    },
    active: { count: 0, partnerAmount: 0, platformAmount: 0 }, // ✅ Ganti pending → active
    completed: { count: 0, partnerAmount: 0, platformAmount: 0 },
    paid: { count: 0, partnerAmount: 0, platformAmount: 0 },
  });
  const [filterOptions, setFilterOptions] = useState({
    printers: [],
    partners: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter state - UPDATED
  const [filters, setFilters] = useState({
    status: searchParams.get("status") || "",
    printerId: searchParams.get("printerId") || "",
    partnerName: searchParams.get("partnerName") || "",
    startDate: searchParams.get("startDate") || "",
    endDate: searchParams.get("endDate") || "",
    startCompletedDate: searchParams.get("startCompletedDate") || "",
    endCompletedDate: searchParams.get("endCompletedDate") || "",
    startPaidDate: searchParams.get("startPaidDate") || "",
    endPaidDate: searchParams.get("endPaidDate") || "",
    minPartnerProfit: searchParams.get("minPartnerProfit") || "", // ✅ Ganti minProfit
    maxPartnerProfit: searchParams.get("maxPartnerProfit") || "", // ✅ Ganti maxProfit
    minSheets: searchParams.get("minSheets") || "",
    maxSheets: searchParams.get("maxSheets") || "",
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

  // Helper: Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return { class: "bg-green-100 text-green-700", text: "Aktif" };
      case "completed":
        return { class: "bg-blue-100 text-blue-700", text: "Selesai" };
      case "paid":
        return { class: "bg-purple-100 text-purple-700", text: "Dibayar" };
      default:
        return {
          class: "bg-gray-100 text-gray-700",
          text: status || "Unknown",
        };
    }
  };

  // Helper: Build query params
  const buildQueryParams = useCallback(
    (extraParams = {}) => {
      const params = new URLSearchParams();
      params.set("page", extraParams.page || pagination.page.toString());
      params.set("limit", extraParams.limit || pagination.limit.toString());

      if (filters.status) params.set("status", filters.status);
      if (filters.printerId) params.set("printerId", filters.printerId);
      if (filters.partnerName) params.set("partnerName", filters.partnerName);
      if (filters.startDate) params.set("startDate", filters.startDate);
      if (filters.endDate) params.set("endDate", filters.endDate);
      if (filters.startCompletedDate)
        params.set("startCompletedDate", filters.startCompletedDate);
      if (filters.endCompletedDate)
        params.set("endCompletedDate", filters.endCompletedDate);
      if (filters.startPaidDate)
        params.set("startPaidDate", filters.startPaidDate);
      if (filters.endPaidDate) params.set("endPaidDate", filters.endPaidDate);
      if (filters.minPartnerProfit)
        params.set("minPartnerProfit", filters.minPartnerProfit);
      if (filters.maxPartnerProfit)
        params.set("maxPartnerProfit", filters.maxPartnerProfit);
      if (filters.minSheets) params.set("minSheets", filters.minSheets);
      if (filters.maxSheets) params.set("maxSheets", filters.maxSheets);
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
      if (newFilters.printerId) params.set("printerId", newFilters.printerId);
      if (newFilters.partnerName)
        params.set("partnerName", newFilters.partnerName);
      if (newFilters.startDate) params.set("startDate", newFilters.startDate);
      if (newFilters.endDate) params.set("endDate", newFilters.endDate);
      if (newFilters.startCompletedDate)
        params.set("startCompletedDate", newFilters.startCompletedDate);
      if (newFilters.endCompletedDate)
        params.set("endCompletedDate", newFilters.endCompletedDate);
      if (newFilters.startPaidDate)
        params.set("startPaidDate", newFilters.startPaidDate);
      if (newFilters.endPaidDate)
        params.set("endPaidDate", newFilters.endPaidDate);
      if (newFilters.minPartnerProfit)
        params.set("minPartnerProfit", newFilters.minPartnerProfit);
      if (newFilters.maxPartnerProfit)
        params.set("maxPartnerProfit", newFilters.maxPartnerProfit);
      if (newFilters.minSheets) params.set("minSheets", newFilters.minSheets);
      if (newFilters.maxSheets) params.set("maxSheets", newFilters.maxSheets);
      if (newFilters.sortBy) params.set("sortBy", newFilters.sortBy);
      if (newFilters.sortOrder) params.set("sortOrder", newFilters.sortOrder);

      router.push(`/hub/admin/paper-refills?${params.toString()}`);
    },
    [router],
  );

  // Fetch refills data
  const fetchRefills = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    try {
      const params = buildQueryParams();
      const url = `/api/hub/admin/paper-refills?${params.toString()}`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      if (data.success) {
        setRefills(data.data || []);
        setStats(
          data.stats || {
            total: {
              totalRefills: 0,
              totalRevenue: 0,
              totalPartnerProfit: 0,
              totalPlatformProfit: 0,
              totalSheets: 0,
            },
            active: { count: 0, partnerAmount: 0, platformAmount: 0 },
            completed: { count: 0, partnerAmount: 0, platformAmount: 0 },
            paid: { count: 0, partnerAmount: 0, platformAmount: 0 },
          },
        );
        setFilterOptions(data.filters || { printers: [], partners: [] });
        setPagination((prev) => ({
          ...prev,
          total: data.pagination?.total || 0,
          totalPages: data.pagination?.totalPages || 0,
        }));
      }
    } catch (err) {
      console.error("❌ Error fetching refills:", err);
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
      printerId: "",
      partnerName: "",
      startDate: "",
      endDate: "",
      startCompletedDate: "",
      endCompletedDate: "",
      startPaidDate: "",
      endPaidDate: "",
      minPartnerProfit: "",
      maxPartnerProfit: "",
      minSheets: "",
      maxSheets: "",
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

  // Di dalam useAdminPaperRefills.js, update fungsi markAsPaid
  const markAsPaid = useCallback(
    async (paperRefillId) => {
      try {
        const response = await fetch(
          `/api/hub/admin/paper-refills/${paperRefillId}/pay`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({}), // ✅ Kosongkan body, tanpa formData
          },
        );

        const result = await response.json();
        if (result.success) {
          await fetchRefills();
        }
        return result;
      } catch (err) {
        console.error("❌ Error marking as paid:", err);
        return { success: false, error: err.message };
      }
    },
    [token, fetchRefills],
  );

  // Initial load
  useEffect(() => {
    if (token) {
      fetchRefills();
    }
  }, [token]);

  // Re-fetch when filters change
  useEffect(() => {
    if (token && filters) {
      const timeoutId = setTimeout(() => {
        fetchRefills();
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [token, filters, pagination.page, pagination.limit]);

  return {
    refills,
    stats,
    filterOptions,
    loading,
    error,
    pagination,
    filters,
    applyFilters,
    resetFilters,
    changePage,
    changeLimit,
    changeSort,
    markAsPaid,
    getStatusBadge,
    formatDate,
    formatRupiah,
    formatNumber,
    refresh: fetchRefills,
  };
};
