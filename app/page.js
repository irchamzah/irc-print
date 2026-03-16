import Link from "next/link";
import TopBar from "./components/TopBar";
import BottomBar from "./components/BottomBar";
import CustomLink from "./components/CustomLink";

export default function HomePage() {
  return (
    <>
      <TopBar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Halaman Beranda
            </h1>
            <span className="text-gray-600">
              Klik{" "}
              <CustomLink href="/printers" className="text-blue-600 underline">
                disini
              </CustomLink>{" "}
              untuk pilih printer
            </span>
          </div>
        </div>
      </div>
      <BottomBar />
    </>
  );
}
