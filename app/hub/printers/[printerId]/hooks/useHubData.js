// app/hub/printers/[printerId]/hooks/useHubData.js - SUDAH DIUPDATE
"use client";
import { useState, useEffect, useCallback } from "react";
import { useHubAuth } from "../../../auth/hooks/useHubAuth";

// useHubData - UPDATED dengan struktur baru
export const useHubData = (
  printerId,
  initialRefillsPage = 1,
  initialJobsPage = 1,
  initialStartDate = null,
  initialEndDate = null,
) => {
  const { token, user } = useHubAuth();

  const [printer, setPrinter] = useState(null);
  const [printJobs, setPrintJobs] = useState([]);
  const [paperRefills, setPaperRefills] = useState([]);

  // Semua data tanggal aktif untuk perhitungan profit-total tidak terikat page
  const [allPrintJobs, setAllPrintJobs] = useState([]);
  const [allPaperRefills, setAllPaperRefills] = useState([]);

  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination untuk Paper Refills
  const [refillsCurrentPage, setRefillsCurrentPage] =
    useState(initialRefillsPage);
  const [refillsTotalPages, setRefillsTotalPages] = useState(1);
  const [refillsTotalItems, setRefillsTotalItems] = useState(0);
  const [refillsPageSize, setRefillsPageSize] = useState(10);
  const [loadingRefillsPage, setLoadingRefillsPage] = useState(false);

  // Pagination untuk Print Jobs
  const [jobsCurrentPage, setJobsCurrentPage] = useState(initialJobsPage);
  const [jobsTotalPages, setJobsTotalPages] = useState(1);
  const [jobsTotalItems, setJobsTotalItems] = useState(0);
  const [jobsPageSize, setJobsPageSize] = useState(10);
  const [loadingJobsPage, setLoadingJobsPage] = useState(false);

  // Date range
  const [dateRange, setDateRange] = useState({
    startDate: initialStartDate,
    endDate: initialEndDate,
    filterType: initialStartDate && initialEndDate ? "custom" : "all",
  });

  useEffect(() => {
    setRefillsCurrentPage(initialRefillsPage);
  }, [initialRefillsPage]);

  useEffect(() => {
    setJobsCurrentPage(initialJobsPage);
  }, [initialJobsPage]);

  useEffect(() => {
    setDateRange({
      startDate: initialStartDate,
      endDate: initialEndDate,
      filterType: initialStartDate && initialEndDate ? "custom" : "all",
    });
  }, [initialStartDate, initialEndDate]);

  // Detect mobile for page size
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 640;
      setRefillsPageSize(isMobile ? 3 : 8);
      setJobsPageSize(isMobile ? 6 : 10);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchAllData = useCallback(async () => {
    if (!token || !printerId) return;

    setLoadingRefillsPage(true);
    setError(null);

    try {
      if (!printer) {
        const printerRes = await fetch(`/api/hub/printers/${printerId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!printerRes.ok)
          throw new Error(`Failed to fetch printer: ${printerRes.status}`);
        const printerData = await printerRes.json();
        if (printerData.success) setPrinter(printerData.data);
      }

      // Fetch refills dengan pagination
      let refillsUrl = `/api/hub/printers/${printerId}/refills?page=${refillsCurrentPage}&limit=${refillsPageSize}`;

      if (dateRange.startDate && dateRange.endDate) {
        refillsUrl += `&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
      }

      const refillsRes = await fetch(refillsUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!refillsRes.ok)
        throw new Error(`Failed to fetch refills: ${refillsRes.status}`);

      const refillsData = await refillsRes.json();

      if (refillsData.success) {
        setPaperRefills(refillsData.data);
        const total = refillsData.pagination?.total || 0;
        setRefillsTotalItems(total);
        setRefillsTotalPages(Math.ceil(total / refillsPageSize) || 1);
      }

      // Fetch print jobs dengan pagination
      let jobsUrl = `/api/hub/printers/${printerId}/jobs?page=${jobsCurrentPage}&limit=${jobsPageSize}`;

      if (dateRange.startDate && dateRange.endDate) {
        jobsUrl += `&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
      }

      setLoadingJobsPage(true);
      const jobsRes = await fetch(jobsUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        if (jobsData.success) {
          setPrintJobs(jobsData.data);

          const jobsTotal = jobsData.pagination?.total || 0;
          setJobsTotalItems(jobsTotal);
          setJobsTotalPages(Math.ceil(jobsTotal / jobsPageSize) || 1);
        }
      }

      // Fetch semua data untuk periode terpilih
      const allRefillsUrl = `/api/hub/printers/${printerId}/refills?page=1&limit=100000${
        dateRange.startDate && dateRange.endDate
          ? `&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
          : ""
      }`;
      const allRefillsRes = await fetch(allRefillsUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (allRefillsRes.ok) {
        const allRefillsData = await allRefillsRes.json();
        if (allRefillsData.success) {
          setAllPaperRefills(allRefillsData.data);

          const allFilteredRefills = filterRefillsByDateRange(
            allRefillsData.data,
          );
          setRefillsTotalItems(allFilteredRefills.length);
          setRefillsTotalPages(
            Math.max(Math.ceil(allFilteredRefills.length / refillsPageSize), 1),
          );
        }
      }

      const allJobsUrl = `/api/hub/printers/${printerId}/jobs?page=1&limit=100000${
        dateRange.startDate && dateRange.endDate
          ? `&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
          : ""
      }`;
      const allJobsRes = await fetch(allJobsUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (allJobsRes.ok) {
        const allJobsData = await allJobsRes.json();
        if (allJobsData.success) {
          setAllPrintJobs(allJobsData.data);
        }
      }

      setLoadingJobsPage(false);
    } catch (error) {
      console.error("❌ Error fetching data:", error);
      setError(error.message);
    } finally {
      setInitialLoading(false);
      setLoadingRefillsPage(false);
    }
  }, [
    token,
    printerId,
    refillsCurrentPage,
    jobsCurrentPage,
    dateRange,
    refillsPageSize,
    jobsPageSize,
    printer,
  ]);

  // Initial fetch
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const refreshData = useCallback(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Reset ketika printerId berubah
  useEffect(() => {
    setRefillsCurrentPage(1);
    setJobsCurrentPage(1);
  }, [printerId]);

  const handleRefillPaper = async (sheetsAdded = 80) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_VPS_API_URL}/api/hub/printers/${printerId}/refills`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ sheetsAdded }),
        },
      );

      const result = await response.json();

      if (result.success) {
        window.location.reload();
        return { success: true };
      } else {
        return {
          success: false,
          error: result.error || "Gagal mengisi kertas",
        };
      }
    } catch (error) {
      console.error("Error refilling paper:", error);
      return { success: false, error: error.message };
    }
  };

  // ✅ Update markRefillAsPaid menggunakan paperRefillId
  const markRefillAsPaid = async (paperRefillId) => {
    if (user?.role !== "super_admin") {
      return {
        success: false,
        error: "Hanya super admin yang dapat menandai pembayaran",
      };
    }

    try {
      const response = await fetch(
        `/api/hub/admin/paper-refills/${paperRefillId}/pay`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        },
      );

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();

      if (result.success) {
        await fetchAllData();
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // ✅ Update getJobsByRefill menggunakan paperRefillId
  const getJobsByRefill = (paperRefillId) => {
    return printJobs.filter((job) => job.paperRefillId === paperRefillId);
  };

  // Filter functions untuk profit calculation
  const filterJobsByDateRange = (jobs) => {
    if (!dateRange.startDate || !dateRange.endDate) return jobs;

    const start = new Date(dateRange.startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(dateRange.endDate);
    end.setHours(23, 59, 59, 999);

    return jobs.filter((job) => {
      const jobDate = new Date(job.createdAt);
      return jobDate >= start && jobDate <= end;
    });
  };

  const filterRefillsByDateRange = (refills) => {
    if (!dateRange.startDate || !dateRange.endDate) return refills;

    const start = new Date(dateRange.startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(dateRange.endDate);
    end.setHours(23, 59, 59, 999);

    return refills.filter((refill) => {
      const refillDate = new Date(refill.createdAt);
      return refillDate >= start && refillDate <= end;
    });
  };

  const setCustomDateRange = (startDate, endDate, filterType = "custom") => {
    setDateRange({
      startDate,
      endDate,
      filterType,
    });
  };

  const resetDateRange = () => {
    setDateRange({
      startDate: null,
      endDate: null,
      filterType: "all",
    });
  };

  // Data yang sudah difilter untuk page table
  const filteredJobs = filterJobsByDateRange(printJobs);
  const filteredRefills = filterRefillsByDateRange(paperRefills);

  // Data yang sudah difilter untuk total (semua record dalam periode)
  const filteredAllRefills = filterRefillsByDateRange(allPaperRefills);

  // ✅ Hitung profit dari data semua periode terfilter
  const totalRevenue = filteredAllRefills.reduce(
    (sum, refill) => sum + (refill.totalRevenue || 0),
    0,
  );

  // ✅ Partner profit dari semua refills
  const totalPartnerProfit = filteredAllRefills.reduce(
    (sum, refill) => sum + (refill.partnerProfit || 0),
    0,
  );

  // ✅ Platform profit dari semua refills
  const totalPlatformProfit = filteredAllRefills.reduce(
    (sum, refill) => sum + (refill.platformProfit || 0),
    0,
  );

  // ✅ Pending payout (active refills) - partner profit
  const pendingPayout = filteredAllRefills
    .filter((r) => r.status === "active" || r.status === "completed")
    .reduce((sum, r) => sum + (r.partnerProfit || 0), 0);

  const paidProfit = filteredAllRefills
    .filter((r) => r.status === "paid")
    .reduce((sum, r) => sum + (r.partnerProfit || 0), 0);

  const profit = {
    totalRevenue,
    partnerProfit: totalPartnerProfit,
    platformProfit: totalPlatformProfit,
    pendingPayout,
    paidProfit,
  };

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatShortDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return {
    printer,
    printJobs,
    paperRefills,
    initialLoading,
    error,

    // Pagination untuk Refills
    refillsCurrentPage,
    refillsTotalPages,
    refillsTotalItems,
    refillsPageSize,
    loadingRefillsPage,

    // Pagination untuk Jobs
    jobsCurrentPage,
    jobsTotalPages,
    jobsTotalItems,
    jobsPageSize,
    loadingJobsPage,

    // Data terfilter untuk profit (dan untuk ditampilkan)
    filteredJobs,
    filteredRefills,

    // Profit yang sudah dihitung dari data terfilter
    filteredTotalRevenue: totalRevenue,
    filteredPartnerProfit: totalPartnerProfit,
    filteredPlatformProfit: totalPlatformProfit,
    profit,

    dateRange,
    setCustomDateRange,
    resetDateRange,

    formatRupiah,
    formatDate,
    formatShortDate,
    handleRefillPaper,
    markRefillAsPaid,
    getJobsByRefill,
    refreshData,
  };
};
