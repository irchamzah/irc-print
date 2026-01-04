import { useState } from "react";

export const useRefreshData = (
  userSession,
  setUserPoints,
  setUserSession,
  setPendingTransactions,
  setRefreshingPoints, // ✅ Ini setter untuk refreshingPoints
  setRefreshingTransactions,
  setCooldownTimers
) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Unified refresh function
  const refreshAllData = async () => {
    if (!userSession?.phone) {
      return;
    }

    if (isRefreshing) {
      return;
    }

    setIsRefreshing(true);
    setRefreshingPoints(true); // ✅ Ini berjalan untuk modal close
    setRefreshingTransactions(true);
    setCooldownTimers((prev) => ({ ...prev, refresh: true }));

    try {
      // Refresh points and transactions concurrently
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

      // Reset cooldown after 3 seconds
      setTimeout(() => {
        setCooldownTimers((prev) => ({ ...prev, refresh: false }));
      }, 3000);
    }
  };

  // Refresh user points only - PERBAIKI INI
  const refreshUserPoints = async () => {
    if (!userSession) return;

    try {
      // ✅ TAMBAHKAN: Set refreshing state untuk points
      setRefreshingPoints(true);

      const response = await fetch(`/api/users/${userSession.phone}/points`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.user) {
        const newPoints = result.points || 0;
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

  // Refresh pending transactions only
  const refreshPendingTransactions = async () => {
    if (!userSession?.phone) return;

    try {
      setRefreshingTransactions(true);

      const response = await fetch(
        `/api/transactions/pending/sync?phoneNumber=${userSession.phone}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
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
