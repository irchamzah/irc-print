// app/hub/printers/page.js
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useHubAuth } from "../auth/hooks/useHubAuth";
import { PrinterGrid } from "./components/PrinterGrid";
import { HubLayout } from "../components/HubLayout";
import CustomLink from "@/app/components/CustomLink";
import LoadingAnimation from "@/app/components/LoadingAnimation";

const API_URL = process.env.NEXT_PUBLIC_VPS_API_URL;

// PrintersPage TERPAKAI
export default function PrintersPage() {
  const { user, token, isAuthenticated } = useHubAuth();
  const [printers, setPrinters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated() && token) {
      fetchPrinters();
    }
  }, [token]);

  const fetchPrinters = async () => {
    setLoading(true);
    setError(null);

    try {
      // ✅ Ganti dengan internal API route
      const response = await fetch("/api/hub/printers", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setPrinters(data.data);
      } else {
        setError(data.error || "Failed to fetch printers");
      }
    } catch (err) {
      console.error("❌ Error fetching printers:", err);
      setError(err.message || "Failed to fetch printers");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat("id-ID").format(num || 0);
  };

  if (!isAuthenticated()) {
    return (
      <HubLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Silakan login terlebih dahulu</p>
            <CustomLink
              href="/hub/auth"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Login
            </CustomLink>
          </div>
        </div>
      </HubLayout>
    );
  }

  if (loading) {
    return (
      <HubLayout>
        <LoadingAnimation />
      </HubLayout>
    );
  }

  if (error) {
    return (
      <HubLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-red-200 p-6 max-w-md text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Gagal Memuat Data
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchPrinters}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </HubLayout>
    );
  }

  return (
    <HubLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Daftar Printer
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Anda memiliki akses ke {printers.length} printer
              </p>
            </div>
            <CustomLink
              href="/hub"
              className="text-sm text-gray-600 hover:text-gray-900 border border-gray-300 px-3 py-1.5 rounded-lg"
            >
              ← Kembali
            </CustomLink>
          </div>

          {printers.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <svg
                className="w-16 h-16 text-gray-300 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Belum Ada Printer
              </h3>
              <p className="text-sm text-gray-500">
                Anda belum memiliki akses ke printer manapun.
              </p>
            </div>
          ) : (
            <PrinterGrid
              printers={printers}
              formatDate={formatDate}
              formatNumber={formatNumber}
            />
          )}
        </div>
      </div>
    </HubLayout>
  );
}
