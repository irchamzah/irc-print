import { FaWhatsapp } from "react-icons/fa";

export default function PrintersFooter() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
        <h4 className="text-lg font-semibold text-gray-800 mb-2">
          Butuh Bantuan?
        </h4>
        <p className="text-gray-600 mb-4">
          Hubungi kami jika mengalami kendala
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
  );
}
