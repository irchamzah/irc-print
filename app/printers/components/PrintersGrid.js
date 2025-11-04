import PrinterCard from "./PrinterCard";

export default function PrintersGrid({ printers, userLocation, onRefresh }) {
  if (printers.length === 0) {
    return (
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
            onClick={onRefresh}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            🔄 Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {printers.map((printer) => (
        <PrinterCard
          key={printer.id || printer.printerId || printer._id}
          printer={printer}
          userLocation={userLocation}
        />
      ))}
    </div>
  );
}
