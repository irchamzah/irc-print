import Link from "next/link";

// PrinterHeader - UPDATED dengan paperMode
export const PrinterHeader = ({ printer }) => {
  if (!printer) return null;

  const getStatusInfo = (status) => {
    switch (status) {
      case "online":
        return {
          class: "bg-green-100 text-green-800 border border-green-200",
          text: "🟢 Online",
          dot: "bg-green-500",
        };
      case "offline":
        return {
          class: "bg-red-100 text-red-800 border border-red-200",
          text: "🔴 Offline • Tidak dapat print",
          dot: "bg-red-500",
        };
      default:
        return {
          class: "bg-yellow-100 text-yellow-800 border border-yellow-200",
          text: "🟡 Maintenance",
          dot: "bg-yellow-500",
        };
    }
  };

  const statusInfo = getStatusInfo(printer.status);

  // ✅ Cek mode printer
  const isUnlimitedMode = printer.paperMode === "unlimited";
  const paperCount = printer.paperStatus?.paperCount || 0;

  // Format last seen time
  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return "Tidak diketahui";

    const lastSeenDate = new Date(lastSeen);
    const now = new Date();
    const diffMinutes = Math.floor((now - lastSeenDate) / (1000 * 60));

    if (diffMinutes < 1) return "Baru saja";
    if (diffMinutes < 60) return `${diffMinutes} menit lalu`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} jam lalu`;

    return lastSeenDate.toLocaleDateString("id-ID");
  };

  // ✅ Tampilan status kertas berdasarkan mode
  const getPaperStatusDisplay = () => {
    if (isUnlimitedMode) {
      return {
        icon: "",
        text: "",
        description: "",
        class: "",
      };
      // return {
      //   icon: "♾️",
      //   text: "Unlimited",
      //   description: "Stok kertas tidak terbatas",
      //   class: "text-purple-600",
      // };
    }
    return {
      icon: "📄",
      text: `${paperCount} kertas tersedia`,
      description: paperCount <= 10 ? "⚠️ Stok menipis!" : "",
      class: paperCount <= 10 ? "text-orange-600" : "text-gray-600",
    };
  };

  const paperStatus = getPaperStatusDisplay();

  return (
    <div className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">
              {printer.printerName || printer.name}
            </h1>
            <p className="text-gray-600 text-sm sm:text-base mt-1 truncate">
              {printer.location?.address}
            </p>
          </div>
          <div className="flex flex-col sm:items-end gap-2">
            {/* Status Printer */}
            <div
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${statusInfo.class}`}
            >
              <div
                className={`w-2 h-2 rounded-full mr-2 ${statusInfo.dot}`}
              ></div>
              {statusInfo.text}
            </div>

            {/* Status Kertas - UPDATED untuk unlimited mode */}
            <div className="flex flex-col sm:items-end gap-1">
              <div className="flex items-center gap-1">
                <span className={`text-xs sm:text-sm ${paperStatus.class}`}>
                  {paperStatus.icon} {paperStatus.text}
                </span>
                {paperStatus.description && (
                  <span className="text-xs text-orange-500 ml-1">
                    {paperStatus.description}
                  </span>
                )}
              </div>
              {/* {!isUnlimitedMode && paperCount <= 20 && paperCount > 0 && (
                <p className="text-xs text-orange-500">
                  ⚠️ Segera isi ulang kertas!
                </p>
              )} */}
              {!isUnlimitedMode && paperCount === 0 && (
                <p className="text-xs text-red-500">
                  ❌ Kertas habis! Isi ulang untuk melanjutkan print.
                </p>
              )}
              {printer.lastSeen && (
                <p className="text-gray-500 text-xs">
                  Terakhir aktif: {formatLastSeen(printer.lastSeen)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
