// hooks/useRefreshData.js - UPDATED dengan struktur baru
import { useState } from "react";

// useRefreshData - UPDATED dengan struktur baru
export const useRefreshData = (
  userSession,
  setUserPoints,
  setUserSession,
  setPendingTransactions,
  setRefreshingPoints,
  setRefreshingTransactions,
  setCooldownTimers,
) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ============================================
  // refreshAllData - Refresh all data (points & transactions)
  // ============================================
  const refreshAllData = async () => {
    if (!userSession?.phone) {
      return;
    }

    if (isRefreshing) {
      return;
    }

    setIsRefreshing(true);
    setRefreshingPoints(true);
    setRefreshingTransactions(true);
    setCooldownTimers((prev) => ({ ...prev, refresh: true }));

    try {
      await Promise.allSettled([
        refreshUserPoints(),
        refreshPendingTransactions(),
      ]);
    } catch (error) {
      console.error("❌ Error during refresh:", error);
    } finally {
      setIsRefreshing(false);
      setRefreshingPoints(false);
      setRefreshingTransactions(false);

      setTimeout(() => {
        setCooldownTimers((prev) => ({ ...prev, refresh: false }));
      }, 3000);
    }
  };

  // ============================================
  // refreshUserPoints - Refresh user points from API
  // ============================================
  const refreshUserPoints = async () => {
    if (!userSession) return;

    try {
      setRefreshingPoints(true);

      const response = await fetch(`/api/users/${userSession.phone}/points`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // ✅ Ambil points dari berbagai kemungkinan field
        const newPoints = result.points || result.user?.points || 0;
        setUserPoints(newPoints);

        const updatedSession = {
          ...userSession,
          points: newPoints,
          timestamp: Date.now(),
        };
        setUserSession(updatedSession);
        localStorage.setItem("userSession", JSON.stringify(updatedSession));
      }
    } catch (error) {
      console.error("❌ Error refreshing points:", error);
    } finally {
      setRefreshingPoints(false);
    }
  };

  // ============================================
  // refreshPendingTransactions - Refresh pending transactions
  // ============================================
  const refreshPendingTransactions = async () => {
    if (!userSession?.phone) return;

    try {
      setRefreshingTransactions(true);

      const response = await fetch(
        `/api/transactions/pending/sync?phoneNumber=${userSession.phone}`,
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // ✅ Transaksi sudah dalam format terbaru dari VPS
        setPendingTransactions(result.pendingTransactions || []);
      }
    } catch (error) {
      console.error("❌ Error refreshing transactions:", error);
    } finally {
      setRefreshingTransactions(false);
    }
  };

  return {
    isRefreshing,
    refreshAllData,
    refreshUserPoints,
    refreshPendingTransactions,
  };
};
