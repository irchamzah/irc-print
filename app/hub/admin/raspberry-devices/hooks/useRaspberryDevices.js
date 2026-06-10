// /app/hub/admin/raspberry-devices/hooks/useRaspberryDevices.js
"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useHubAuth } from "../../../auth/hooks/useHubAuth";

export const useRaspberryDevices = () => {
  const { token } = useHubAuth(); // ✅ Ambil token dari hook auth
  const searchParams = useSearchParams();
  const router = useRouter();

  // State
  const [devices, setDevices] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    maintenance: 0,
    totalPrintersAssigned: 0,
  });
  const [filterOptions, setFilterOptions] = useState({
    statuses: ["active", "inactive", "maintenance"],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter state
  const [filters, setFilters] = useState({
    status: searchParams.get("status") || "",
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

  // Helper: Build query params
  const buildQueryParams = useCallback(
    (extraParams = {}) => {
      const params = new URLSearchParams();

      // Pagination
      params.set("page", extraParams.page || pagination.page.toString());
      params.set("limit", extraParams.limit || pagination.limit.toString());

      // Filters
      if (filters.status) params.set("status", filters.status);
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
      if (newFilters.search) params.set("search", newFilters.search);
      if (newFilters.sortBy) params.set("sortBy", newFilters.sortBy);
      if (newFilters.sortOrder) params.set("sortOrder", newFilters.sortOrder);

      router.push(`/hub/admin/raspberry-devices?${params.toString()}`);
    },
    [router],
  );

  // Fetch devices data
  const fetchDevices = useCallback(async () => {
    if (!token) return; // ✅ Jangan fetch jika tidak ada token

    setLoading(true);
    try {
      const params = buildQueryParams();
      const url = `/api/hub/admin/raspberry-devices?${params.toString()}`;

      // ✅ Kirim Authorization header dengan token
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      if (data.success) {
        setDevices(data.data || []);
        setStats(
          data.stats || {
            total: 0,
            active: 0,
            inactive: 0,
            maintenance: 0,
            totalPrintersAssigned: 0,
          },
        );
        setPagination((prev) => ({
          ...prev,
          total: data.pagination?.total || 0,
          totalPages: data.pagination?.totalPages || 0,
        }));
      }
    } catch (err) {
      console.error("❌ Error fetching raspberry devices:", err);
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

  // Create device
  const createDevice = useCallback(
    async (deviceData) => {
      try {
        const response = await fetch(`/api/hub/admin/raspberry-devices`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(deviceData),
        });

        const result = await response.json();
        if (result.success) {
          await fetchDevices();
        }
        return result;
      } catch (err) {
        console.error("❌ Error creating device:", err);
        return { success: false, error: err.message };
      }
    },
    [token, fetchDevices],
  );

  // Update device
  const updateDevice = useCallback(
    async (deviceId, deviceData) => {
      try {
        const response = await fetch(
          `/api/hub/admin/raspberry-devices/${deviceId}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(deviceData),
          },
        );

        const result = await response.json();
        if (result.success) {
          await fetchDevices();
        }
        return result;
      } catch (err) {
        console.error("❌ Error updating device:", err);
        return { success: false, error: err.message };
      }
    },
    [token, fetchDevices],
  );

  // Assign printers to device
  const assignPrinters = useCallback(
    async (deviceId, printerIds) => {
      try {
        const response = await fetch(
          `/api/hub/admin/raspberry-devices/${deviceId}/assign-printers`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ printerIds }),
          },
        );

        const result = await response.json();
        if (result.success) {
          await fetchDevices();
        }
        return result;
      } catch (err) {
        console.error("❌ Error assigning printers:", err);
        return { success: false, error: err.message };
      }
    },
    [token, fetchDevices],
  );

  // Delete device
  const deleteDevice = useCallback(
    async (deviceId) => {
      try {
        const response = await fetch(
          `/api/hub/admin/raspberry-devices/${deviceId}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const result = await response.json();
        if (result.success) {
          await fetchDevices();
        }
        return result;
      } catch (err) {
        console.error("❌ Error deleting device:", err);
        return { success: false, error: err.message };
      }
    },
    [token, fetchDevices],
  );

  // Initial load
  useEffect(() => {
    if (token) {
      fetchDevices();
    }
  }, [token]);

  // Re-fetch when pagination or filters change
  useEffect(() => {
    if (token && pagination.page && pagination.limit) {
      fetchDevices();
    }
  }, [token, filters, pagination.page, pagination.limit]);

  return {
    // Data
    devices,
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
    createDevice,
    updateDevice,
    deleteDevice,
    assignPrinters,

    // Helpers
    formatDate,
    refresh: fetchDevices,
  };
};
