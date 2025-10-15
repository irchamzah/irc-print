// "use client";
// import { useState, useEffect } from "react";
import Link from "next/link";

export default function HomePage() {
  // const [printers, setPrinters] = useState([]);
  // const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   fetchPrinters();
  // }, []);

  // const fetchPrinters = async () => {
  //   try {
  //     const response = await fetch("/api/printers");
  //     const result = await response.json();

  //     console.log("Printers:", result.printers);

  //     if (result.success) {
  //       setPrinters(result.printers);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching printers:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // if (loading) {
  //   return (
  //     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
  //         <p className="mt-4 text-gray-600">Memuat printer...</p>
  //       </div>
  //     </div>
  //   );
  // }

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
