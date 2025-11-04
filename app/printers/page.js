"use client";
import PrintersHeader from "./components/PrintersHeader";
import PrintersGrid from "./components/PrintersGrid";
import PrintersFooter from "./components/PrintersFooter";
import LoadingState from "./components/LoadingState";
import { usePrinters } from "./hooks/usePrinters";
import { useUserLocation } from "./hooks/useUserLocation";

export default function PrintersPage() {
  const { printers, loading, fetchPrinters } = usePrinters();
  const { userLocation } = useUserLocation();

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <PrintersHeader userLocation={userLocation} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PrintersGrid
          printers={printers}
          userLocation={userLocation}
          onRefresh={fetchPrinters}
        />
      </main>

      <PrintersFooter />
    </div>
  );
}
