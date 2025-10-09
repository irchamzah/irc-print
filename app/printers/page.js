"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
    console.log("🔍 calculateDistance debug:");
    console.log("userLocation:", userLocation);
    console.log("printerLocation:", printerLocation);

    if (!userLocation || !printerLocation) {
      console.log("❌ Missing location data");
      return null;
    }

    // Handle different coordinate formats
    let printerLat, printerLng;

    if (
      printerLocation.type === "Point" &&
      Array.isArray(printerLocation.coordinates)
    ) {
      // Format GeoJSON: { type: "Point", coordinates: [longitude, latitude] }
      [printerLng, printerLat] = printerLocation.coordinates;
      console.log("✅ GeoJSON format - Lat:", printerLat, "Lng:", printerLng);
    } else if (Array.isArray(printerLocation)) {
      // Format array: [longitude, latitude]
      [printerLng, printerLat] = printerLocation;
      console.log("✅ Array format - Lat:", printerLat, "Lng:", printerLng);
    } else if (printerLocation.lat && printerLocation.lng) {
      // Format object: { lat, lng }
      printerLat = printerLocation.lat;
      printerLng = printerLocation.lng;
      console.log("✅ Object format - Lat:", printerLat, "Lng:", printerLng);
    } else {
      console.log("❌ Unknown printer location format");
      return null;
    }

    // Validate coordinates
    if (
      typeof printerLat !== "number" ||
      typeof printerLng !== "number" ||
      isNaN(printerLat) ||
      isNaN(printerLng)
    ) {
      console.log("❌ Invalid printer coordinates:", printerLat, printerLng);
      return null;
    }

    if (
      typeof userLocation.lat !== "number" ||
      typeof userLocation.lng !== "number" ||
      isNaN(userLocation.lat) ||
      isNaN(userLocation.lng)
    ) {
      console.log(
        "❌ Invalid user coordinates:",
        userLocation.lat,
        userLocation.lng
      );
      return null;
    }

    console.log("📍 Calculating distance between:");
    console.log("   User:", userLocation.lat, userLocation.lng);
    console.log("   Printer:", printerLat, printerLng);

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

    console.log("📏 Calculated distance:", distance.toFixed(1), "km");

    return distance.toFixed(1);
  };

  const handlePrinterSelect = (printerId) => {
    router.push(`/${printerId}`);
  };

  // Atau untuk link yang lebih user-friendly dengan label:
  const getMapsLink = (location) => {
    if (!location) return "#";

    // Priority 1: Use manual mapsUrl if provided
    if (location.mapsUrl && location.mapsUrl !== "#") {
      return location.mapsUrl;
    }

    // Priority 2: Fallback to coordinates-based Google Maps link
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

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat printer...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🖨️ Daftar Printer
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Pilih printer terdekat untuk mulai mencetak dokumen Anda
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
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 overflow-hidden hover:scale-105"
              >
                {/* Status Badge */}
                <div
                  className={`px-4 py-2 ${
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
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {normalizedPrinter.name}
                  </h3>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center flex-1">
                        <span className="mr-2">📍</span>
                        <span className="flex-1">
                          {normalizedPrinter.location?.address ||
                            normalizedPrinter.location}
                          {distance && ` • ${distance} km`} •{" "}
                          <a
                            href={getMapsLink(normalizedPrinter.location)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                            title="Buka di Google Maps"
                          >
                            Buka di Google Maps
                          </a>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <span className="mr-2">📄</span>
                      <span>
                        {normalizedPrinter.paperStatus?.available
                          ? `${normalizedPrinter.paperStatus.paperCount} kertas tersedia`
                          : "Kertas habis"}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handlePrinterSelect(normalizedPrinter.id)}
                    className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium cursor-pointer"
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
