// app/hub/printers/[printerId]/page.js
"use client";
import { useState, useRef, useEffect } from "react";
import {
  useParams,
  useSearchParams,
  useRouter,
  usePathname,
} from "next/navigation";
import { useHubData } from "./hooks/useHubData";
import { DateRangeFilter } from "./components/DateRangeFilter";
import { PaperStatusCard } from "./components/PaperStatusCard";
import { ProfitOverview } from "./components/ProfitOverview";
import { PaperRefillHistory } from "./components/PaperRefillHistory";
import { RefillDetailModal } from "./components/RefillDetailModal";
import { PrintJobsTable } from "./components/PrintJobsTable";
import { InfoCard } from "./components/InfoCard";
import { useHubAuth } from "../../auth/hooks/useHubAuth";
import { HubLayout } from "../../components/HubLayout";
import CustomLink from "@/app/components/CustomLink";
import LoadingAnimation from "@/app/components/LoadingAnimation";
import { ProofUploadModal } from "../../admin/paper-refills/components/ProofUploadModal";

// 🥸PartnerHubPage /app/hub/printers/[printerId]/page.js TERPAKAI
export default function PartnerHubPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const printerId = params.printerId;
  const { user, token } = useHubAuth();

  const refillsSectionRef = useRef(null);
  const jobsSectionRef = useRef(null);
  const [targetSection, setTargetSection] = useState(null);

  const refillsPage = parseInt(searchParams.get("refillsPage") || "1");
  const jobsPage = parseInt(searchParams.get("jobsPage") || "1");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const router = useRouter();
  const pathname = usePathname();

  const {
    printer,
    initialLoading,
    error,
    filteredJobs,
    filteredRefills,
    filteredTotalRevenue,
    filteredPartnerProfit,
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
    refillsCurrentPage,
    refillsTotalPages,
    refillsTotalItems,
    refillsPageSize,
    jobsCurrentPage,
    jobsTotalPages,
    jobsTotalItems,
    jobsPageSize,
    loadingRefillsPage,
    loadingJobsPage,
  } = useHubData(printerId, refillsPage, jobsPage, startDate, endDate);

  const [showRefillSuccess, setShowRefillSuccess] = useState(false);
  const [selectedRefill, setSelectedRefill] = useState(null);
  const [showRefillModal, setShowRefillModal] = useState(false);
  const [refillLoading, setRefillLoading] = useState(false);
  const [showProofModal, setShowProofModal] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    if (!initialLoading) {
      const activeSection = searchParams.get("refillsPage")
        ? "refills"
        : searchParams.get("jobsPage")
          ? "jobs"
          : null;
      setTargetSection(activeSection);
    }
  }, [searchParams, initialLoading]);

  const handleRefill = async () => {
    setRefillLoading(true);
    const result = await handleRefillPaper();
    setRefillLoading(false);

    if (result.success) {
      setShowRefillSuccess(true);
      setTimeout(() => setShowRefillSuccess(false), 3000);
    } else {
      alert("Gagal mengisi kertas: " + result.error);
    }
  };

  const handleViewRefill = (refill) => {
    const relatedJobs = getJobsByRefill(refill.refillId);
    setSelectedRefill({ ...refill, jobs: relatedJobs });
    setShowRefillModal(true);
  };

  const handleMarkAsPaid = async (refill) => {
    if (refill.status !== "completed") {
      alert('❌ Hanya refill dengan status "Selesai" yang bisa dibayar');
      return;
    }

    if (refill.totalRevenue <= 0) {
      alert("❌ Tidak bisa membayar refill tanpa pendapatan");
      return;
    }

    setSelectedRefill(refill);
    setShowProofModal(true);
  };

  const handleConfirmPayment = async (formData) => {
    if (!selectedRefill) return;

    setProcessingId(selectedRefill.refillId);

    try {
      const response = await fetch(
        `/api/hub/admin/paper-refills/${selectedRefill.refillId}/pay`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`,
        );
      }

      const result = await response.json();

      if (result.success) {
        alert("✅ Pembayaran berhasil");
        setShowProofModal(false);
        setShowRefillModal(false);
        await refreshData();
      } else {
        alert("❌ Gagal: " + result.error);
      }
    } catch (error) {
      alert("❌ Gagal: " + error.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleApplyFilter = (startDate, endDate, filterType = "custom") => {
    setCustomDateRange(startDate, endDate, filterType);

    const params = new URLSearchParams(searchParams.toString());
    params.set("startDate", startDate);
    params.set("endDate", endDate);
    params.set("refillsPage", "1");
    params.set("jobsPage", "1");

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleResetFilter = () => {
    resetDateRange();

    const params = new URLSearchParams(searchParams.toString());
    params.delete("startDate");
    params.delete("endDate");
    params.delete("refillsPage");
    params.delete("jobsPage");

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  if (!user || !token) {
    return (
      <HubLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Silakan login untuk mengakses dashboard
            </p>
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

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <LoadingAnimation />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white rounded-xl border border-red-200 p-6 max-w-md">
          <div className="text-red-600 text-center mb-4">
            <svg
              className="w-12 h-12 mx-auto mb-3"
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
            <p className="font-medium">Gagal memuat data</p>
          </div>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button
            onClick={refreshData}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  if (!printer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Printer tidak ditemukan</p>
        </div>
      </div>
    );
  }

  return (
    <HubLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500 mt-1">{printer.name}</p>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full">
              ID: {printer.printerId.slice(0, 8)}...
            </div>
            <CustomLink
              href="/hub/printers"
              className="text-sm text-gray-600 hover:text-gray-900 border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50"
            >
              ← Kembali
            </CustomLink>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <PaperStatusCard
            paperCount={printer.paperStatus?.paperCount || 0}
            lastRefill={printer.paperStatus?.lastRefill}
            onRefill={handleRefill}
            loading={refillLoading}
            showSuccess={showRefillSuccess}
            formatDate={formatDate}
          />

          <DateRangeFilter
            dateRange={dateRange}
            onApplyFilter={handleApplyFilter}
            onResetFilter={handleResetFilter}
            formatDate={formatDate}
          />

          <ProfitOverview
            totalRevenue={filteredTotalRevenue}
            profitShare={profit.profitShare}
            pendingPayout={profit.pendingPayout}
            totalProfit={profit.partnerProfit}
            formatRupiah={formatRupiah}
            dateRange={dateRange}
          />

          {/* ✅ Tambahkan ref ke section refills */}
          <div ref={refillsSectionRef}>
            <PaperRefillHistory
              refills={filteredRefills}
              onViewRefill={handleViewRefill}
              formatRupiah={formatRupiah}
              formatShortDate={formatShortDate}
              // Props pagination
              currentPage={refillsCurrentPage}
              totalPages={refillsTotalPages}
              totalItems={refillsTotalItems}
              pageSize={refillsPageSize}
              section={"refills"}
              currentJobsPage={jobsCurrentPage}
              currentRefillsPage={refillsCurrentPage}
              startDate={startDate}
              endDate={endDate}
              loading={loadingRefillsPage}
            />
          </div>

          {/* ✅ Tambahkan ref ke section jobs */}
          <div ref={jobsSectionRef} className="mt-8">
            <PrintJobsTable
              jobs={filteredJobs}
              refills={filteredRefills}
              onViewRefill={handleViewRefill}
              formatRupiah={formatRupiah}
              formatDate={formatDate}
              formatShortDate={formatShortDate}
              // Props pagination
              currentPage={jobsCurrentPage}
              totalPages={jobsTotalPages}
              totalItems={jobsTotalItems}
              pageSize={jobsPageSize}
              section={"jobs"}
              currentJobsPage={jobsCurrentPage}
              currentRefillsPage={refillsCurrentPage}
              startDate={startDate}
              endDate={endDate}
              loading={loadingJobsPage}
            />
          </div>

          <InfoCard profitShare={profit.profitShare} />
        </div>

        <RefillDetailModal
          isOpen={showRefillModal}
          refill={selectedRefill}
          jobs={selectedRefill?.jobs}
          onClose={() => setShowRefillModal(false)}
          onMarkAsPaid={user?.role === "super_admin" ? handleMarkAsPaid : null}
          formatRupiah={formatRupiah}
          formatDate={formatDate}
          userRole={user?.role}
        />
        <ProofUploadModal
          isOpen={showProofModal}
          onClose={() => setShowProofModal(false)}
          onConfirm={handleConfirmPayment}
          refill={selectedRefill}
          processing={processingId === selectedRefill?.refillId}
          formatRupiah={formatRupiah}
        />
      </div>
    </HubLayout>
  );
}
