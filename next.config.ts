import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Aman di Vercel, dan jadi syarat siap-pakai kalau nanti self-host di
  // server fisik (docker/node server.js) tanpa ubah config lagi saat itu.
  output: "standalone",
};

export default nextConfig;
