"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const PDFPreview = dynamic(() => import("./PDFPreview"), {
  ssr: false,
  loading: () => (
    <div
      className="bg-gray-100 rounded flex items-center justify-center"
      style={{ width: 100, height: 140 }}
    >
      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
    </div>
  ),
});

const PageSelector = ({
  totalPages,
  onSettingsChange,
  initialSettings,
  file,
}) => {
  const [selections, setSelections] = useState([]);
  const [visiblePages, setVisiblePages] = useState(6);
  const [renderErrors, setRenderErrors] = useState({});

  useEffect(() => {
    const initialSelections = Array.from({ length: totalPages }, (_, i) => ({
      page: i + 1,
      type: initialSettings?.colorPages?.includes(i + 1)
        ? "color"
        : initialSettings?.bwPages?.includes(i + 1)
        ? "bw"
        : "bw",
    }));
    setSelections(initialSelections);
  }, [totalPages, initialSettings]);

  const handlePageTypeChange = (pageNumber, type) => {
    const newSelections = selections.map((sel) =>
      sel.page === pageNumber ? { ...sel, type } : sel
    );
    setSelections(newSelections);

    const colorPages = newSelections
      .filter((s) => s.type === "color")
      .map((s) => s.page);
    const bwPages = newSelections
      .filter((s) => s.type === "bw")
      .map((s) => s.page);

    onSettingsChange({
      colorPages,
      bwPages,
      copies: initialSettings.copies || 1,
    });
  };

  const handleRenderError = (pageNumber) => {
    setRenderErrors((prev) => ({ ...prev, [pageNumber]: true }));
  };

  const loadMorePages = () => {
    setVisiblePages((prev) => prev + 6);
  };

  const groupConsecutive = (pages) => {
    if (pages.length === 0) return [];
    pages.sort((a, b) => a - b);
    const result = [];
    let start = pages[0];
    let end = pages[0];

    for (let i = 1; i < pages.length; i++) {
      if (pages[i] === end + 1) {
        end = pages[i];
      } else {
        result.push(start === end ? `${start}` : `${start}-${end}`);
        start = end = pages[i];
      }
    }
    result.push(start === end ? `${start}` : `${start}-${end}`);
    return result;
  };

  const getTelegramFormat = () => {
    const colorPages = selections
      .filter((s) => s.type === "color")
      .map((s) => s.page);
    const bwPages = selections
      .filter((s) => s.type === "bw")
      .map((s) => s.page);

    return `color:${groupConsecutive(colorPages).join(
      ","
    )} bw:${groupConsecutive(bwPages).join(",")} copies:${
      initialSettings.copies || 1
    }`;
  };

  if (totalPages === 0) return null;

  const pagesToShow = selections.slice(0, visiblePages);

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium text-gray-800 mb-4">
        Atur Jenis Print per Halaman:
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {pagesToShow.map(({ page, type }) => (
          <div
            key={page}
            className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
          >
            <div className="text-center mb-3">
              <div className="text-sm font-medium text-gray-700 mb-2">
                Halaman {page}
              </div>

              {/* PDF Preview dengan error handling */}
              <div className="mx-auto mb-3" style={{ width: 100, height: 140 }}>
                {renderErrors[page] ? (
                  <div className="w-full h-full bg-red-50 flex items-center justify-center rounded border border-red-200">
                    <span className="text-red-600 text-xs">Gagal memuat</span>
                  </div>
                ) : (
                  <PDFPreview
                    file={file}
                    pageNumber={page}
                    onRender={() => {}}
                  />
                )}
              </div>

              <select
                value={type}
                onChange={(e) => handlePageTypeChange(page, e.target.value)}
                className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-700"
              >
                <option value="bw">Hitam Putih</option>
                <option value="color">Warna</option>
              </select>
            </div>

            <div
              className={`text-xs text-center ${
                type === "color" ? "text-blue-600" : "text-gray-600"
              }`}
            >
              {type === "color" ? "🟡 Warna" : "⚫ Hitam-Putih"}
            </div>
          </div>
        ))}
      </div>

      {visiblePages < totalPages && (
        <div className="text-center mb-6">
          <button
            onClick={loadMorePages}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
          >
            Muat Lebih Banyak ({totalPages - visiblePages} halaman tersisa)
          </button>
        </div>
      )}

      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="font-medium text-blue-800 mb-2">
          Format untuk Telegram:
        </h4>
        <code className="text-sm bg-white p-3 rounded border border-blue-200 block font-mono text-gray-700">
          /setprint {getTelegramFormat()}
        </code>
        <p className="text-xs text-blue-600 mt-2">
          Format ini akan otomatis dikirim ke bot Telegram
        </p>
      </div>
    </div>
  );
};

export default PageSelector;
