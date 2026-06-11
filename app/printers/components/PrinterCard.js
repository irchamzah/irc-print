"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  calculateDistance,
  getStatusColor,
  getStatusIcon,
} from "../utils/printerUtils";
import CustomLink from "@/app/components/CustomLink";
import ImageModal from "./ImageModal";


export default function PrinterCard({ printer, userLocation }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [images, setImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(true); // ✅ Mulai sebagai true

  const normalizedPrinter = {
    ...printer,
    id: printer.id || printer.printerId || printer._id,
    location: {
      ...printer.location,
      coordinates: Array.isArray(printer.location?.coordinates)
        ? {
            lng: printer.location.coordinates.coordinates[0],
            lat: printer.location.coordinates.coordinates[1],
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
    userLocation,
  );

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const token = localStorage.getItem("hubToken");
        const response = await fetch(
          `/api/hub/printers/${normalizedPrinter.id}/images`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          },
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.images?.length > 0) {
            // ✅ TAMBAHKAN URL LENGKAP DARI VPS
            const imagesWithFullUrl = data.images.map((img) => ({
              ...img,
              url: `/api/proxy/image?path=${encodeURIComponent(img.url)}`,
            }));
            setImages(imagesWithFullUrl);
          }
        }
      } catch (error) {
        console.error("Error fetching printer images:", error);
      } finally {
        setLoadingImages(false);
      }
    };

    fetchImages();
  }, [normalizedPrinter.id]);

  const handleImageClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsModalOpen(true);
    if (images.length > 0) {
      setSelectedImage(images[0]);
    }
  };

  const handleMapsClick = (e) => {
    e.stopPropagation();

    if (normalizedPrinter.location?.mapsUrl) {
      window.open(
        normalizedPrinter.location.mapsUrl,
        "_blank",
        "noopener,noreferrer",
      );
    } else {
      const { lat, lng } = {
        lat: normalizedPrinter.location?.coordinates?.coordinates?.[1],
        lng: normalizedPrinter.location?.coordinates?.coordinates?.[0],
      };
      if (lat && lng) {
        const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
        window.open(googleMapsUrl, "_blank", "noopener,noreferrer");
      } else {
        console.warn("No maps URL or coordinates available");
        alert("Tautan maps tidak tersedia untuk printer ini");
      }
    }
  };

  const getLocationText = () => {
    if (normalizedPrinter.location?.address) {
      return normalizedPrinter.location.address;
    }
    if (typeof normalizedPrinter.location === "string") {
      return normalizedPrinter.location;
    }
    if (normalizedPrinter.location?.city) {
      return normalizedPrinter.location.city;
    }
    return "Lokasi tidak tersedia";
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 overflow-hidden group">
        {/* Status Header */}
        <div
          className={`${getStatusColor(normalizedPrinter.status)} px-4 py-3`}
        >
          <div className="flex items-center justify-between">
            <span className="text-white font-medium text-sm">
              {getStatusIcon(normalizedPrinter.status)}{" "}
              {normalizedPrinter.status?.toUpperCase() || "OFFLINE"}
            </span>
          </div>
        </div>

        {/* Image Section - Langsung tampil */}
        <div
          onClick={handleImageClick}
          className="relative h-48 bg-gray-100 cursor-pointer group/image overflow-hidden"
        >
          {loadingImages ? (
            // Loading state
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : images.length > 0 ? (
            // ✅ TAMPILKAN GAMBAR ASLI (thumbnail pertama)
            <>
              <img
                src={images[0].url}
                alt={printer.printerName || printer.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover/image:scale-105"
              />
              {/* Badge jumlah gambar */}
              {images.length > 1 && (
                <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                  +{images.length} foto
                </div>
              )}
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m-3-3h6"
                  />
                </svg>
              </div>
            </>
          ) : (
            // Placeholder jika tidak ada gambar
            <>
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-100 to-gray-200">
                <svg
                  className="w-16 h-16 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                  Klik untuk lihat gallery
                </span>
              </div>
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m-3-3h6"
                  />
                </svg>
              </div>
            </>
          )}
        </div>

        {/* Printer Content (sama seperti sebelumnya) */}
        <div className="p-5 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {normalizedPrinter.printerName || normalizedPrinter.name || "unknown printer"}
          </h3>

          <div className="space-y-3 mb-4">
            <div className="flex items-start">
              <span className="text-gray-500 mr-2 mt-0.5 flex-shrink-0">
                📍
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-gray-600 text-sm line-clamp-2">
                  {getLocationText()}
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

            <div className="flex items-center">
              <span className="text-gray-500 mr-2">📄</span>
              {normalizedPrinter.paperStatus?.available ||
              normalizedPrinter.paperMode === "unlimited" ? (
                <span className="text-sm text-green-600">
                  {normalizedPrinter.paperMode === "unlimited"
                    ? "Mode unlimited"
                    : `${normalizedPrinter.paperStatus.paperCount || 0} kertas tersedia`}
                </span>
              ) : (
                <span className="text-sm text-red-600">Kertas habis</span>
              )}
            </div>
          </div>

          <CustomLink
            href={`/printers/${normalizedPrinter.id}`}
            className="flex itemcenter justify-center w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-none group-hover:shadow-2xl cursor-pointer"
          >
            Pilih Printer
          </CustomLink>
        </div>
      </div>

      {/* Image Modal */}
      <ImageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        images={images}
        printerName={normalizedPrinter.name}
        loading={loadingImages}
      />
    </>
  );
}
