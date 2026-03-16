// app/hub/auth/hooks/useHubAuth.js
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.VPS_API_URL;

export const useHubAuth = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("hubToken");
    const storedUser = localStorage.getItem("hubUser");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Login function
  const login = async (phone, password) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/hub/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone, password }),
      });

      const data = await response.json();

      if (data.success) {
        const { user, token, accessiblePrinters } = data.data;

        setUser(user);
        setToken(token);

        localStorage.setItem("hubToken", token);
        localStorage.setItem("hubUser", JSON.stringify(user));
        localStorage.setItem(
          "accessiblePrinters",
          JSON.stringify(accessiblePrinters),
        );

        return { success: true };
      } else {
        setError(data.error || "Login failed");
        return { success: false, error: data.error };
      }
    } catch (err) {
      setError("Network error. Please try again.");
      return { success: false, error: "Network error" };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      if (token) {
        await fetch(`/api/hub/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem("hubToken");
      localStorage.removeItem("hubUser");
      localStorage.removeItem("accessiblePrinters");
      router.push("/hub/auth");
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!token && !!user;
  };

  // Check if user is super admin
  const isSuperAdmin = () => {
    return user?.role === "super_admin";
  };

  // Get accessible printers
  const getAccessiblePrinters = async () => {
    if (!user || !token) return [];

    try {
      const response = await fetch(
        `${API_URL}/api/users/${user.userId}/printers`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error("Error fetching printers:", error);
      return [];
    }
  };

  return {
    user,
    token,
    loading,
    error,
    login,
    logout,
    isAuthenticated,
    isSuperAdmin,
    getAccessiblePrinters,
  };
};
