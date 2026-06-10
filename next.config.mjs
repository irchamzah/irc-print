/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "your-vps-domain.com",
        port: "",
        pathname: "/storage/printer-images/**",
      },
      // Untuk development/local
      {
        protocol: "http",
        hostname: "103.150.90.67",
        port: "3002",
        pathname: "/storage/printer-images/**",
      },
      {
        protocol: "http",
        hostname: "103.150.90.67",
        port: "3001",
        pathname: "/storage/printer-images/**",
      },
    ],
  },
};

export default nextConfig;
