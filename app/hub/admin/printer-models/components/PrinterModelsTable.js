"use client";

export const PrinterModelsTable = ({ printerModels, onEdit, onDelete }) => {
  const getStatusBadge = (isActive) => {
    if (isActive) {
      return (
        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
          Aktif
        </span>
      );
    }
    return (
      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
        Tidak Aktif
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  if (printerModels.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="w-16 h-16 text-gray-300 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 13h6m-3-3v6m-9 5h18a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
        <p className="text-gray-500">Tidak ada model printer</p>
        <p className="text-sm text-gray-400 mt-1">
          Klik &quot;Tambah Model&quot; untuk menambahkan
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Brand
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Model
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Display Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Paper Sizes
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Duplex
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Dibuat
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {printerModels.map((model) => (
            <tr
              key={model.printerModelId || model._id}
              className="hover:bg-gray-50"
            >
              <td className="px-4 py-3 text-sm font-medium text-gray-800">
                {model.brand}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">{model.model}</td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {model.displayName}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                <div className="flex flex-wrap gap-1">
                  {model.capabilities?.paperSizes?.defaultEnabled
                    ?.slice(0, 3)
                    .map((size) => (
                      <span
                        key={size}
                        className="px-1.5 py-0.5 bg-gray-100 rounded text-xs"
                      >
                        {size}
                      </span>
                    ))}
                  {(model.capabilities?.paperSizes?.defaultEnabled?.length ||
                    0) > 3 && (
                    <span className="px-1.5 py-0.5 text-xs text-gray-400">
                      +{model.capabilities.paperSizes.defaultEnabled.length - 3}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {model.capabilities?.duplex?.supported ? (
                  <span className="text-green-600">✓ Ya</span>
                ) : (
                  <span className="text-gray-400">✗ Tidak</span>
                )}
              </td>
              <td className="px-4 py-3">{getStatusBadge(model.isActive)}</td>
              <td className="px-4 py-3 text-sm text-gray-500">
                {formatDate(model.createdAt)}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onEdit(model)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Edit"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDelete(model)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Hapus"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
