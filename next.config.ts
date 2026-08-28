import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the root-deployable build independent of a paid image-transform binding.
  // Source images are already web-sized and served as immutable static assets.
  images: { unoptimized: true },
};

export default nextConfig;
