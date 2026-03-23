import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "IRC Print - Layanan Print Online",
  description: "Print dokumen Anda dengan mudah dan cepat",
};

// RootLayout TERPAKAI
export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          {/* <TopBar /> */}
          <main className="flex-1 flex flex-col">{children}</main>
          {/* <BottomBar /> */}
        </div>
      </body>
    </html>
  );
}
