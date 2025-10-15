"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaWhatsapp } from "react-icons/fa";

export default function PrintersPage() {
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
    if (!userLocation || !printerLocation) {
      return null;
    }

    let printerLat, printerLng;

    if (
      printerLocation.type === "Point" &&
      Array.isArray(printerLocation.coordinates)
    ) {
      [printerLng, printerLat] = printerLocation.coordinates;
    } else if (Array.isArray(printerLocation)) {
      [printerLng, printerLat] = printerLocation;
    } else if (printerLocation.lat && printerLocation.lng) {
      printerLat = printerLocation.lat;
      printerLng = printerLocation.lng;
    } else {
      return null;
    }

    if (
      typeof printerLat !== "number" ||
      typeof printerLng !== "number" ||
      isNaN(printerLat) ||
      isNaN(printerLng) ||
      typeof userLocation.lat !== "number" ||
      typeof userLocation.lng !== "number" ||
      isNaN(userLocation.lat) ||
      isNaN(userLocation.lng)
    ) {
      return null;
    }

    const R = 6371;
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

    return distance < 1 ? distance.toFixed(2) : distance.toFixed(1);
  };

  const handlePrinterSelect = (printerId) => {
    router.push(`/${printerId}`);
  };

  const getMapsLink = (location) => {
    if (!location) return "#";

    const coordinates = location.coordinates;
    if (!coordinates) return "#";

    let lat, lng;

    if (
      coordinates.type === "Point" &&
      Array.isArray(coordinates.coordinates)
    ) {
      [lng, lat] = coordinates.coordinates;
    } else if (Array.isArray(coordinates)) {
      [lng, lat] = coordinates;
    } else if (coordinates.lat && coordinates.lng) {
      lat = coordinates.lat;
      lng = coordinates.lng;
    } else {
      return "#";
    }

    if (typeof lat !== "number" || typeof lng !== "number") {
      return "#";
    }

    const label = encodeURIComponent(location.address || "Printer Location");
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place=${label}`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "online":
        return "🟢";
      case "offline":
        return "🔴";
      case "maintenance":
        return "🟡";
      default:
        return "⚪";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "offline":
        return "bg-red-500";
      case "maintenance":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat printer...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">
              🖨️ Pilih Printer
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Temukan printer terdekat untuk mencetak dokumen Anda
            </p>

            {/* Location Status */}
            <div className="mt-4 flex items-center justify-center">
              <div
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                  userLocation
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-current mr-2"></span>
                {userLocation
                  ? "Lokasi terdeteksi"
                  : "Izinkan akses lokasi untuk jarak terdekat"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Printers Grid */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {printers.map((printer) => {
            const normalizedPrinter = {
              ...printer,
              id: printer.id || printer.printerId || printer._id,
              location: {
                ...printer.location,
                coordinates: Array.isArray(printer.location?.coordinates)
                  ? {
                      lng: printer.location.coordinates[0],
                      lat: printer.location.coordinates[1],
                    }
                  : printer.location?.coordinates,
              },
              paperStatus: printer.paperStatus || {
                available: false,
                paperCount: 0,
              },
            };

            const distance = calculateDistance(
              normalizedPrinter.location?.coordinates
            );

            return (
              <div
                key={normalizedPrinter.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 overflow-hidden hover:scale-105 group"
              >
                {/* Status Header */}
                <div
                  className={`${getStatusColor(
                    normalizedPrinter.status
                  )} px-4 py-3`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium text-sm">
                      {getStatusIcon(normalizedPrinter.status)}{" "}
                      {normalizedPrinter.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Printer Content */}
                <div className="p-5 sm:p-6">
                  {/* Printer Name */}
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {normalizedPrinter.name}
                  </h3>

                  {/* Location Info */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-start">
                      <span className="text-gray-500 mr-2 mt-0.5 flex-shrink-0">
                        📍
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {normalizedPrinter.location?.address ||
                            normalizedPrinter.location}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          {distance && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                              {distance} km
                            </span>
                          )}
                          <a
                            href={normalizedPrinter.location.mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700 text-xs flex items-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Buka Maps
                            <svg
                              className="w-3 h-3 ml-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Paper Status */}
                    <div className="flex items-center">
                      <span className="text-gray-500 mr-2">📄</span>
                      <span
                        className={`text-sm ${
                          normalizedPrinter.paperStatus?.available
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {normalizedPrinter.paperStatus?.available
                          ? `${normalizedPrinter.paperStatus.paperCount} kertas tersedia`
                          : "Kertas habis"}
                      </span>
                    </div>
                  </div>

                  {/* Select Button */}
                  <button
                    onClick={() => handlePrinterSelect(normalizedPrinter.id)}
                    className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 group-hover:shadow-2xl cursor-pointer"
                  >
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
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
              <div className="text-6xl mb-4">🖨️</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Tidak ada printer tersedia
              </h3>
              <p className="text-gray-600 mb-6">
                Silakan coba lagi nanti atau hubungi administrator.
              </p>
              <button
                onClick={fetchPrinters}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                🔄 Coba Lagi
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <h4 className="text-lg font-semibold text-gray-800 mb-2">
            Butuh Bantuan?
          </h4>
          <p className="text-gray-600 mb-4">
            Hubungi kami jika mengalami kendala
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://wa.me/6285117038583"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FaWhatsapp className="mr-1" /> Hubungi Admin
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
