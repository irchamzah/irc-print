"use client";
import { usePageSelection } from "../hooks/usePageSelection";
import dynamic from "next/dynamic";
import { PRINT_SETTINGS } from "../../../../lib/printConstants";

const PDFPreview = dynamic(() => import("./PDFPreview"), {
  ssr: false,
  loading: () => (
    <div className="bg-gray-100 rounded-lg flex items-center justify-center w-full h-32 sm:h-36">
      <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-blue-600"></div>
    </div>
  ),
});

const PageSelector = ({
  totalPages,
  onSettingsChange,
  initialSettings,
  file,
}) => {
  const {
    pagesToShow,
    hasMorePages,
    renderErrors,
    printSettings,
    currentCost,
    handlePageTypeChange,
    setAllPages,
    handleRenderError,
    loadMorePages,
    handlePrintSettingsChange,
    handleCopiesChange,
  } = usePageSelection(totalPages, initialSettings, onSettingsChange);

  if (totalPages === 0) return null;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="text-center sm:text-left">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
          Atur Jenis Print per Halaman
        </h3>
        <p className="text-gray-600 text-sm">
          Pilih tiap halaman akan dicetak warna atau hitam-putih
        </p>
      </div>

      {/* Bulk Actions */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
        <div className="flex flex-col sm:flex-row gap-3 justify-center sm:justify-start">
          <BulkActionButton
            type="bw"
            label="Set Semua Hitam-Putih"
            onClick={() => setAllPages("bw")}
          />
          <BulkActionButton
            type="color"
            label="Set Semua Warna"
            onClick={() => setAllPages("color")}
          />
        </div>
      </div>

      {/* Pages Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
        {pagesToShow.map(({ page, type }) => (
          <PageCard
            key={page}
            page={page}
            type={type}
            file={file}
            renderError={renderErrors[page]}
            onTypeChange={handlePageTypeChange}
            onRenderError={handleRenderError}
          />
        ))}
      </div>

      {/* Load More Button */}
      {hasMorePages && (
        <LoadMoreButton
          remaining={totalPages - pagesToShow.length}
          onLoadMore={loadMorePages}
        />
      )}

      {/* Advanced Settings */}
      <AdvancedSettings
        printSettings={printSettings}
        copies={initialSettings.copies || 1}
        onPrintSettingsChange={handlePrintSettingsChange}
        onCopiesChange={handleCopiesChange}
      />
    </div>
  );
};

// Sub-components for better organization
const BulkActionButton = ({ type, label, onClick }) => {
  const isColor = type === "color";
  const bgClass = isColor
    ? "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
    : "bg-gray-600 hover:bg-gray-700";

  const icon = isColor ? (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4 mr-2"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
      />
    </svg>
  ) : (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4 mr-2"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  );

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center px-4 py-3 text-white rounded-lg transition-all duration-200 text-sm font-medium shadow-sm ${bgClass}`}
    >
      {icon}
      {label}
    </button>
  );
};

const PageCard = ({
  page,
  type,
  file,
  renderError,
  onTypeChange,
  onRenderError,
}) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 p-4">
    <div className="text-center mb-3">
      <div className="inline-flex items-center px-3 py-1 bg-gray-100 rounded-full">
        <span className="text-sm font-medium text-gray-700">
          Halaman {page}
        </span>
      </div>
    </div>

    <div className="mb-3">
      {renderError ? (
        <ErrorPreview />
      ) : (
        <PDFPreview
          file={file}
          pageNumber={page}
          onRender={() => {}}
          onError={() => onRenderError(page)}
        />
      )}
    </div>

    <div className="space-y-2">
      <select
        value={type}
        onChange={(e) => onTypeChange(page, e.target.value)}
        className="w-full py-2 px-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors text-gray-700"
      >
        <option value="bw">⚫ Hitam Putih</option>
        <option value="color">🟡 Warna</option>
      </select>

      <div
        className={`text-center px-2 py-1 rounded-lg text-xs font-medium ${
          type === "color"
            ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
            : "bg-gray-100 text-gray-800 border border-gray-200"
        }`}
      >
        {type === "color" ? "Warna" : "Hitam-Putih"}
      </div>
    </div>
  </div>
);

const ErrorPreview = () => (
  <div className="w-full h-32 sm:h-36 bg-red-50 flex items-center justify-center rounded-lg border-2 border-dashed border-red-200">
    <div className="text-center">
      <svg
        className="h-8 w-8 text-red-400 mx-auto mb-1"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
        />
      </svg>
      <span className="text-red-600 text-xs block">Gagal memuat</span>
    </div>
  </div>
);

const LoadMoreButton = ({ remaining, onLoadMore }) => (
  <div className="text-center pt-4">
    <button
      onClick={onLoadMore}
      className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
    >
      <svg
        className="w-4 h-4 mr-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
      Muat {Math.min(20, remaining)} Halaman Lagi
      <span className="ml-2 text-blue-200">({remaining} tersisa)</span>
    </button>
  </div>
);

const AdvancedSettings = ({
  printSettings,
  copies,
  onPrintSettingsChange,
  onCopiesChange,
}) => (
  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6">
    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center">
      <SettingsIcon />
      Pengaturan Lanjutan
    </h3>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <PaperSizeSetting
        value={printSettings.paperSize}
        onChange={(value) => onPrintSettingsChange({ paperSize: value })}
      />
      <CopiesSetting value={copies} onChange={onCopiesChange} />
    </div>
  </div>
);

const SettingsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 sm:h-6 sm:w-6 mr-3 text-blue-600"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const PaperSizeSetting = ({ value, onChange }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">
      📄 Ukuran Kertas
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-700"
    >
      {Object.entries(PRINT_SETTINGS.PAPER_SIZES).map(([key, paper]) => (
        <option key={key} value={key}>
          {paper.description}
        </option>
      ))}
    </select>
  </div>
);

const CopiesSetting = ({ value, onChange }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">
      📑 Jumlah Salinan
    </label>
    <input
      type="number"
      min="1"
      max="50"
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value) || 1)}
      className="w-full p-3 border border-gray-300 bg-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-center text-gray-700"
    />
  </div>
);

export default PageSelector;
