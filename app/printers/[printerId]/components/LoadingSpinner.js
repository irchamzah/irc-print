export const LoadingSpinner = ({ message = "Memuat printer..." }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
};

export const FullPageLoader = ({ message = "Memproses..." }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-sm w-full">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mr-4"></div>
          <div>
            <p className="font-semibold text-gray-800">{message}</p>
            <p className="text-gray-600 text-sm mt-1">Harap tunggu sebentar</p>
          </div>
        </div>
      </div>
    </div>
  );
};
