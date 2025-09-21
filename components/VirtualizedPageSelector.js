// components/VirtualizedPageSelector.js (opsional untuk PDF besar)
"use client";
import { useState, useEffect } from "react";
import { FixedSizeList as List } from "react-window";
import PDFPreview from "./PDFPreview";

const VirtualizedPageSelector = ({
  totalPages,
  file,
  onSettingsChange,
  initialSettings,
}) => {
  const [selections, setSelections] = useState([]);

  useEffect(() => {
    const initialSelections = Array.from({ length: totalPages }, (_, i) => ({
      page: i + 1,
      type: initialSettings?.colorPages?.includes(i + 1) ? "color" : "bw",
    }));
    setSelections(initialSelections);
  }, [totalPages, initialSettings]);

  const Row = ({ index, style }) => {
    const page = index + 1;
    const selection = selections[index];

    return (
      <div style={style} className="px-2">
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="text-center">
            <div className="text-sm font-medium text-gray-700 mb-2">
              Halaman {page}
            </div>
            <PDFPreview file={file} pageNumber={page} />
            <select
              value={selection.type}
              onChange={(e) => handlePageTypeChange(page, e.target.value)}
              className="mt-2 block w-full py-1 px-2 border border-gray-300 rounded text-sm"
            >
              <option value="bw">Hitam Putih</option>
              <option value="color">Warna</option>
            </select>
          </div>
        </div>
      </div>
    );
  };

  return (
    <List height={400} itemCount={totalPages} itemSize={180} width="100%">
      {Row}
    </List>
  );
};
