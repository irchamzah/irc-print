"use client";
import { useState, useEffect } from "react";
import { useHubAuth } from "../../auth/hooks/useHubAuth";

export const useAdminPrinters = () => {
  const { token } = useHubAuth();
  const [printers, setPrinters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

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
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (token) {
      fetchPrinters().finally(() => {
        setLoading(false);
      });
    }
  }, [token]);

  const createPrinter = async (printerData) => {
    setProcessing(true);
    try {
      const response = await fetch("/api/hub/admin/printers", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(printerData),
      });

      const data = await response.json();

      if (data.success) {
        await fetchPrinters();
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

  const updatePrinter = async (printerId, printerData) => {
    setProcessing(true);
    try {
      const response = await fetch(`/api/hub/admin/printers/${printerId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(printerData),
      });

      const data = await response.json();

      if (data.success) {
        await fetchPrinters();
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

  const deletePrinter = async (printerId) => {
    setProcessing(true);
    try {
      const response = await fetch(`/api/hub/admin/printers/${printerId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        await fetchPrinters();
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
    printers,
    loading,
    error,
    processing,
    createPrinter,
    updatePrinter,
    deletePrinter,
    refreshPrinters: fetchPrinters,
    formatDate,
  };
};
