export const FileUploadSection = ({ file, onFileUpload, isLoading }) => {
  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type === "application/pdf") {
        const success = await onFileUpload(selectedFile);
        if (!success) {
          e.target.value = "";
        }
      } else {
        alert("Hanya file PDF yang diperbolehkan!");
        e.target.value = "";
      }
    }
  };

  return (
    <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-blue-600 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        Upload File
      </h2>

      <div className="flex items-center justify-center w-full">
        <label className="flex flex-col items-center justify-center w-full h-32 sm:h-40 border-2 border-dashed border-blue-300 rounded-xl cursor-pointer bg-white hover:bg-blue-50 transition-all duration-200">
          <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 sm:h-12 sm:w-12 text-blue-500 mb-2 sm:mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-sm sm:text-base text-gray-600 mb-1">
              <span className="font-semibold">Klik untuk upload</span>
            </p>
            <p className="text-xs sm:text-sm text-gray-500">
              PDF saja (Maks. 10MB)
            </p>
          </div>
          <input
            type="file"
            className="opacity-0"
            accept=".pdf"
            onChange={handleFileChange}
            required
            disabled={isLoading}
          />
        </label>
      </div>

      {file && (
        <div className="mt-3 flex items-center justify-center sm:justify-start">
          <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-green-600 mr-2 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-green-700 text-sm truncate max-w-[200px] sm:max-w-none">
              {file.name}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
