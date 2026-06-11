// components/PaperSizeTutorialModal.js
"use client";

const getYouTubeEmbedUrl = (input) => {
  if (!input) return null;

  // Jika hanya video ID (11 karakter: huruf, angka, -, _)
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
    return `https://www.youtube.com/embed/${input}?fs=1&modestbranding=1&rel=0&controls=1&playsinline=1`;
  }

  // Jika URL lengkap YouTube
  const regExp =
    /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = input.match(regExp);
  const videoId = match && match[2].length === 11 ? match[2] : null;
  if (!videoId) return null;
  return `https://www.youtube.com/embed/${videoId}?fs=1&modestbranding=1&rel=0&controls=1&playsinline=1`;
};

const PaperSizeTutorialModal = ({
  isOpen,
  onConfirm,
  detectedSize,
  videoGuides,
}) => {
  if (!isOpen) return null;

  const sizeLabel = detectedSize || "Tidak Diketahui";

  // Pilih video berdasarkan ukuran PDF yang terdeteksi
  const videoUrlMap = { F4: "A4_to_F4", A4: "F4_to_A4" };
  const videoKey = videoUrlMap[detectedSize];
  const rawVideoUrl = videoKey ? videoGuides?.[videoKey] : null;
  const embedUrl = getYouTubeEmbedUrl(rawVideoUrl);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-60 transition-opacity" />

      <div className="flex min-h-full items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="relative bg-white rounded-t-2xl sm:rounded-xl shadow-xl w-full sm:w-full sm:max-w-lg mx-auto">
          {/* Drag indicator (mobile) */}
          <div className="sm:hidden flex justify-center pt-2 pb-1">
            <div className="w-12 h-1 bg-gray-300 rounded-full" />
          </div>

          {/* Header */}
          {/* <div className="flex items-center gap-3 p-4 sm:p-5 border-b border-gray-200">
            <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-blue-600"
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
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                Konfirmasi Ukuran Kertas
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Pastikan kertas yang terpasang sesuai
              </p>
            </div>
          </div> */}

          {/* Body */}
          <div className="p-4 sm:p-5 space-y-4">
            {/* Info message */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-gray-700 text-sm leading-relaxed">
                File PDF anda berukuran{" "}
                <span className="font-bold text-blue-700">{sizeLabel}</span>
                {", "}pastikan bahwa kertas yang terpasang di printer adalah
                kertas{" "}
                <span className="font-bold text-blue-700">{sizeLabel}</span>.
              </p>
            </div>

            {/* Video tutorial */}
            {embedUrl && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">
                  Cara mengganti ukuran kertas di printer:
                </p>
                <div
                  className="relative w-full bg-black rounded-lg overflow-hidden"
                  style={{ minHeight: "220px" }}
                >
                  <iframe
                    src={embedUrl}
                    title={`Tutorial kertas ${sizeLabel}`}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    frameBorder="0"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 rounded-b-2xl sm:rounded-b-xl border-t border-gray-200 p-4 sm:p-5">
            <button
              type="button"
              onClick={onConfirm}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors text-sm"
            >
              ✅ Ukuran kertas sudah sesuai dan dipasang dengan rapih
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaperSizeTutorialModal;
