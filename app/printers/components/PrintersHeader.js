export default function PrintersHeader({ userLocation }) {
  return (
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
  );
}
