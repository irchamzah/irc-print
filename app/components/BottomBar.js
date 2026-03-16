import { FaWhatsapp } from "react-icons/fa";

const BottomBar = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center text-gray-600">
          <p className="text-gray-600 mb-4">
            Jika mengalami kendala atau ingin memberi masukan, silakan hubungi
            kami.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://wa.me/6285117038583"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FaWhatsapp className="mr-1" /> Hubungi Admin
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default BottomBar;
