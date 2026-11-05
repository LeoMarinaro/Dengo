import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    serverActions: {
      // Fotos são enviadas uma por vez, até 4 MB (limite de requisição da Vercel é 4,5 MB).
      bodySizeLimit: "4mb",
    },
  },
  images: {
    // Fotos enviadas pelo painel ficam no Vercel Blob.
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
