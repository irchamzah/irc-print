import { useRouter } from "next/navigation";
import {
  calculateDistance,
  getStatusColor,
  getStatusIcon,
} from "../utils/printerUtils";

export default function PrinterCard({ printer, userLocation }) {
  const router = useRouter();

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
    normalizedPrinter.location?.coordinates,
    userLocation
  );

  const handlePrinterSelect = () => {
    router.push(`/printers/${normalizedPrinter.id}`);
  };

  const handleMapsClick = (e) => {
    e.stopPropagation();

    // Cek jika mapsUrl tersedia
    if (normalizedPrinter.location?.mapsUrl) {
      window.open(
        normalizedPrinter.location.mapsUrl,
        "_blank",
        "noopener,noreferrer"
      );
    } else {
      // Fallback: buka Google Maps dengan koordinat jika ada
      const { lat, lng } = normalizedPrinter.location?.coordinates || {};
      if (lat && lng) {
        const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
        window.open(googleMapsUrl, "_blank", "noopener,noreferrer");
      } else {
        console.warn("No maps URL or coordinates available");
        alert("Tautan maps tidak tersedia untuk printer ini");
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 overflow-hidden hover:scale-105 group">
      {/* Status Header */}
      <div className={`${getStatusColor(normalizedPrinter.status)} px-4 py-3`}>
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
            <span className="text-gray-500 mr-2 mt-0.5 flex-shrink-0">📍</span>
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
                <button
                  onClick={handleMapsClick}
                  className="text-blue-500 hover:text-blue-700 text-xs flex items-center transition-colors cursor-pointer"
                  title="Buka di Google Maps"
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
                </button>
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
          onClick={handlePrinterSelect}
          className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 group-hover:shadow-2xl cursor-pointer"
        >
          Pilih Printer
        </button>
      </div>
    </div>
  );
}
