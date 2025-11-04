import { Inter } from "next/font/google";
import "./globals.css";
import TopBar from "@/app/components/TopBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "IRC Print - Layanan Print Online",
  description: "Print dokumen Anda dengan mudah dan cepat",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <TopBar />
          <main className="flex-1 flex flex-col">{children}</main>

          {/* Footer */}
          <footer className="bg-white border-t border-gray-200 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="text-center text-gray-600">
                <p>&copy; 2025 IRC Print. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
