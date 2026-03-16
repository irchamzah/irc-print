"use client";
import { useState, useEffect } from "react";
import { useHubAuth } from "../../auth/hooks/useHubAuth";

export const useAdminUsers = () => {
  const { token } = useHubAuth();
  const [users, setUsers] = useState([]);
  const [printers, setPrinters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/hub/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setUsers(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchPrinters = async () => {
    try {
      const response = await fetch("/api/hub/admin/printers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setPrinters(data.data);
      }
    } catch (err) {
      console.error("Error fetching printers:", err);
    }
  };

  useEffect(() => {
    if (token) {
      Promise.all([fetchUsers(), fetchPrinters()]).finally(() => {
        setLoading(false);
      });
    }
  }, [token]);

  const createUser = async (userData) => {
    setProcessing(true);
    try {
      const response = await fetch("/api/hub/admin/users", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success) {
        await fetchUsers();
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setProcessing(false);
    }
  };

  const updateUser = async (userId, userData) => {
    setProcessing(true);
    try {
      const response = await fetch(`/api/hub/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success) {
        await fetchUsers();
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setProcessing(false);
    }
  };

  const deleteUser = async (userId) => {
    setProcessing(true);
    try {
      const response = await fetch(`/api/hub/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        await fetchUsers();
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return {
    users,
    printers,
    loading,
    error,
    processing,
    createUser,
    updateUser,
    deleteUser,
    refreshUsers: fetchUsers,
    formatDate,
  };
};
