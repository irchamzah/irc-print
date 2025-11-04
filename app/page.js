import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Halaman Beranda
          </h1>
          <p className="text-gray-600">
            Klik{" "}
            <Link href="/printers" className="text-blue-600 underline">
              disini
            </Link>{" "}
            untuk pilih printer
          </p>
        </div>
      </div>
    </div>
  );
}
