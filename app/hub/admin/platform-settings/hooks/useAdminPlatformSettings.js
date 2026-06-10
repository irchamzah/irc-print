"use client";
import { useState, useEffect, useCallback } from "react";
import { useHubAuth } from "../../../auth/hooks/useHubAuth";

export const useAdminPlatformSettings = () => {
  const { token } = useHubAuth();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/hub/admin/platform-settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (data.success) setSettings(data.data);
    } catch (err) {
      console.error("❌ Error fetching platform settings:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const updateSettings = useCallback(
    async (formData) => {
      setSaving(true);
      try {
        const response = await fetch(`/api/hub/admin/platform-settings`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
        const result = await response.json();
        if (result.success) {
          await fetchSettings();
        }
        return result;
      } catch (err) {
        return { success: false, error: err.message };
      } finally {
        setSaving(false);
      }
    },
    [token, fetchSettings],
  );

  useEffect(() => {
    if (token) fetchSettings();
  }, [token]);

  return {
    settings,
    loading,
    error,
    saving,
    updateSettings,
    refresh: fetchSettings,
  };
};
