// app/hub/admin/hooks/useAdminUsers.js SUDAH DIUPDATE
"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useHubAuth } from "../../auth/hooks/useHubAuth";

export const useAdminUsers = () => {
  const { token } = useHubAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  // State
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    super_admin: 0,
    partner: 0,
    user: 0,
    customer: 0, // ✅ Tambah customer count
    hasBankAccount: 0,
    totalPoints: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter state
  const [filters, setFilters] = useState({
    role: searchParams.get("role") || "",
    search: searchParams.get("search") || "",
    minPoints: searchParams.get("minPoints") || "",
    maxPoints: searchParams.get("maxPoints") || "",
    minTotalSpent: searchParams.get("minTotalSpent") || "",
    maxTotalSpent: searchParams.get("maxTotalSpent") || "",
    hasBankAccount: searchParams.get("hasBankAccount") || "",
    startDate: searchParams.get("startDate") || "",
    endDate: searchParams.get("endDate") || "",
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

  // Helper: Format poin
  const formatPoints = (points) => {
    return new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(points || 0);
  };

  // Helper: Mendapatkan badge role
  const getRoleBadge = (role) => {
    switch (role) {
      case "super_admin":
        return { class: "bg-purple-100 text-purple-700", text: "Super Admin" };
      case "admin":
        return { class: "bg-blue-100 text-blue-700", text: "Admin" };
      case "partner":
        return { class: "bg-green-100 text-green-700", text: "Partner" };
      case "customer":
        return { class: "bg-gray-100 text-gray-700", text: "Customer" };
      default:
        return { class: "bg-gray-100 text-gray-700", text: role || "User" };
    }
  };

  // Helper: Mendapatkan jumlah printer yang diakses (untuk partner)
  const getAccessPrinterCount = (user) => {
    if (user.role !== "partner") return null;
    return user.accessPrinterIds?.length || 0;
  };

  // Helper: Build query params
  const buildQueryParams = useCallback(
    (extraParams = {}) => {
      const params = new URLSearchParams();

      // Pagination
      params.set("page", extraParams.page || pagination.page.toString());
      params.set("limit", extraParams.limit || pagination.limit.toString());

      // Filters
      if (filters.role) params.set("role", filters.role);
      if (filters.search) params.set("search", filters.search);
      if (filters.minPoints) params.set("minPoints", filters.minPoints);
      if (filters.maxPoints) params.set("maxPoints", filters.maxPoints);
      if (filters.minTotalSpent)
        params.set("minTotalSpent", filters.minTotalSpent);
      if (filters.maxTotalSpent)
        params.set("maxTotalSpent", filters.maxTotalSpent);
      if (filters.hasBankAccount)
        params.set("hasBankAccount", filters.hasBankAccount);
      if (filters.startDate) params.set("startDate", filters.startDate);
      if (filters.endDate) params.set("endDate", filters.endDate);
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

      if (newFilters.role) params.set("role", newFilters.role);
      if (newFilters.search) params.set("search", newFilters.search);
      if (newFilters.minPoints) params.set("minPoints", newFilters.minPoints);
      if (newFilters.maxPoints) params.set("maxPoints", newFilters.maxPoints);
      if (newFilters.minTotalSpent)
        params.set("minTotalSpent", newFilters.minTotalSpent);
      if (newFilters.maxTotalSpent)
        params.set("maxTotalSpent", newFilters.maxTotalSpent);
      if (newFilters.hasBankAccount)
        params.set("hasBankAccount", newFilters.hasBankAccount);
      if (newFilters.startDate) params.set("startDate", newFilters.startDate);
      if (newFilters.endDate) params.set("endDate", newFilters.endDate);
      if (newFilters.sortBy) params.set("sortBy", newFilters.sortBy);
      if (newFilters.sortOrder) params.set("sortOrder", newFilters.sortOrder);

      router.push(`/hub/admin/users?${params.toString()}`);
    },
    [router],
  );

  // Fetch users data
  const fetchUsers = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    try {
      const params = buildQueryParams();
      const url = `/api/hub/admin/users?${params.toString()}`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      if (data.success) {
        // ✅ Transform data user sesuai struktur baru
        const transformedUsers = (data.data || []).map((user) => ({
          ...user,
          // Pastikan field yang benar ada
          accessPrinterIds: user.accessPrinterIds || [],
          // Hapus printHistory jika masih ada (redundant)
          printHistory: undefined,
        }));

        setUsers(transformedUsers);
        setStats(
          data.stats || {
            total: 0,
            super_admin: 0,
            partner: 0,
            user: 0,
            customer: 0,
            hasBankAccount: 0,
            totalPoints: 0,
          },
        );
        setPagination((prev) => ({
          ...prev,
          total: data.pagination?.total || 0,
          totalPages: data.pagination?.totalPages || 0,
        }));
      }
    } catch (err) {
      console.error("❌ Error fetching users:", err);
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
      role: "",
      search: "",
      minPoints: "",
      maxPoints: "",
      minTotalSpent: "",
      maxTotalSpent: "",
      hasBankAccount: "",
      startDate: "",
      endDate: "",
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

  // Create user
  const createUser = useCallback(
    async (userData) => {
      try {
        // ✅ Transform data sesuai struktur baru
        const payload = {
          name: userData.name,
          phone: userData.phone,
          password: userData.password,
          role: userData.role,
          accessPrinterIds: userData.accessPrinterIds || [], // ✅ Gunakan accessPrinterIds
          bankAccount: userData.bankAccount,
          points: userData.points || 0,
          totalSpent: userData.totalSpent || 0,
        };

        const response = await fetch(`/api/hub/admin/users`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json();
        if (result.success) {
          await fetchUsers();
        }
        return result;
      } catch (err) {
        console.error("❌ Error creating user:", err);
        return { success: false, error: err.message };
      }
    },
    [token, fetchUsers],
  );

  // Update user
  const updateUser = useCallback(
    async (userId, userData) => {
      try {
        // ✅ Transform data sesuai struktur baru
        const payload = {
          name: userData.name,
          phone: userData.phone,
          role: userData.role,
          accessPrinterIds: userData.accessPrinterIds || [], // ✅ Gunakan accessPrinterIds
          bankAccount: userData.bankAccount,
          points: userData.points,
          totalSpent: userData.totalSpent,
        };

        // Only include password if provided
        if (userData.password) {
          payload.password = userData.password;
        }

        const response = await fetch(`/api/hub/admin/users/${userId}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json();
        if (result.success) {
          await fetchUsers();
        }
        return result;
      } catch (err) {
        console.error("❌ Error updating user:", err);
        return { success: false, error: err.message };
      }
    },
    [token, fetchUsers],
  );

  // Delete user
  const deleteUser = useCallback(
    async (userId) => {
      try {
        const response = await fetch(`/api/hub/admin/users/${userId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        const result = await response.json();
        if (result.success) {
          await fetchUsers();
        }
        return result;
      } catch (err) {
        console.error("❌ Error deleting user:", err);
        return { success: false, error: err.message };
      }
    },
    [token, fetchUsers],
  );

  // Initial load
  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  // Re-fetch when pagination changes
  useEffect(() => {
    if (token && pagination.page && pagination.limit) {
      fetchUsers();
    }
  }, [token, filters, pagination.page, pagination.limit]);

  return {
    // Data
    users,
    stats,
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
    createUser,
    updateUser,
    deleteUser,

    // Helpers
    formatDate,
    formatRupiah,
    formatPoints,
    getRoleBadge,
    getAccessPrinterCount,
    refresh: fetchUsers,
  };
};
