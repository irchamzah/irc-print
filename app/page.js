"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [printers, setPrinters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchPrinters();
    getUserLocation();
  }, []);

  const fetchPrinters = async () => {
    try {
      const response = await fetch("/api/printers");
      const result = await response.json();

      console.log("Printers:", result.printers);

      if (result.success) {
        setPrinters(result.printers);
      }
    } catch (error) {
      console.error("Error fetching printers:", error);
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.log("Location access denied:", error);
        }
      );
    }
  };

  const calculateDistance = (printerLocation) => {
    if (!userLocation || !printerLocation) return null;

    // Handle both coordinate formats
    let printerLat, printerLng;

    if (Array.isArray(printerLocation)) {
      // Format: [lng, lat]
      [printerLng, printerLat] = printerLocation;
    } else {
      // Format: { lat, lng }
      printerLat = printerLocation.lat;
      printerLng = printerLocation.lng;
    }

    // Haversine formula
    const R = 6371; // Earth radius in km
    const dLat = ((printerLat - userLocation.lat) * Math.PI) / 180;
    const dLng = ((printerLng - userLocation.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((userLocation.lat * Math.PI) / 180) *
        Math.cos((printerLat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance.toFixed(1);
  };

  const handlePrinterSelect = (printerId) => {
    router.push(`/${printerId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat printer...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🖨️ IRC Print
          </h1>
          <p className="text-gray-600">
            Pilih printer terdekat untuk mulai mencetak
          </p>
        </div>

        {/* Printers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {printers.map((printer) => {
            // Normalisasi data printer
            const normalizedPrinter = {
              ...printer,
              // Pastikan ada id
              id: printer.id || printer.printerId || printer._id,
              // Normalisasi location coordinates
              location: {
                ...printer.location,
                coordinates: Array.isArray(printer.location?.coordinates)
                  ? {
                      lng: printer.location.coordinates[0],
                      lat: printer.location.coordinates[1],
                    }
                  : printer.location?.coordinates,
              },
              // Default values untuk data yang missing
              paperStatus: printer.paperStatus || {
                available: false,
                paperCount: 0,
              },
              capabilities: printer.capabilities || {
                color: false,
                bw: true,
                duplex: false,
                stapling: false,
              },
              pricing: printer.pricing || {
                bw: 0,
                color: 0,
              },
            };

            const distance = calculateDistance(
              normalizedPrinter.location?.coordinates
            );

            return (
              <div
                key={normalizedPrinter.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handlePrinterSelect(normalizedPrinter.id)}
              >
                {/* Printer Status Badge */}
                <div
                  className={`px-3 py-1 rounded-t-lg ${
                    normalizedPrinter.status === "online"
                      ? "bg-green-500"
                      : normalizedPrinter.status === "offline"
                      ? "bg-red-500"
                      : "bg-yellow-500"
                  }`}
                >
                  <span className="text-white text-sm font-medium">
                    {normalizedPrinter.status === "online"
                      ? "🟢 Online"
                      : normalizedPrinter.status === "offline"
                      ? "🔴 Offline"
                      : "🟡 Maintenance"}
                  </span>
                </div>

                <div className="p-6">
                  {/* Printer Name */}
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {normalizedPrinter.name}
                  </h3>

                  {/* Location & Distance */}
                  <div className="flex items-center text-gray-600 mb-2">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="text-sm">
                      {normalizedPrinter.location?.address}
                      {distance && ` • ${distance} km`}
                    </span>
                  </div>

                  {/* Paper Status */}
                  <div className="flex items-center text-gray-600 mb-3">
                    <svg
                      className="w-4 h-4 mr-1"
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
                    <span className="text-sm">
                      {normalizedPrinter.paperStatus.available
                        ? `${normalizedPrinter.paperStatus.paperCount} kertas tersedia`
                        : "Kertas habis"}
                    </span>
                  </div>

                  {/* Capabilities */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {normalizedPrinter.capabilities.color && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        Warna
                      </span>
                    )}
                    {normalizedPrinter.capabilities.duplex && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        Duplex
                      </span>
                    )}
                    {normalizedPrinter.capabilities.stapling && (
                      <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                        Stapling
                      </span>
                    )}
                  </div>

                  {/* Pricing */}
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Hitam Putih:</span>
                      <span className="font-semibold text-gray-600">
                        Rp {normalizedPrinter.pricing.bw.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Warna:</span>
                      <span className="font-semibold text-gray-600">
                        Rp {normalizedPrinter.pricing.color.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Select Button */}
                  <button className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                    Pilih Printer
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {printers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🖨️</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Tidak ada printer tersedia
            </h3>
            <p className="text-gray-600">
              Silakan coba lagi nanti atau hubungi administrator.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
