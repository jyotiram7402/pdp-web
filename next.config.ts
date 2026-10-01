import type { NextConfig } from "next";

/**
 * Remote image hosts. Product media currently comes from media.southco.com and
 * video thumbnails from Vimeo. Add inRiver / DAM hosts with IMAGE_REMOTE_HOSTS
 * (comma separated) when the Excel feed points somewhere else.
 */
const imageHosts = [
  "media.southco.com",
  "i.vimeocdn.com",
  ...(process.env.IMAGE_REMOTE_HOSTS ?? "")
    .split(",")
    .map((host) => host.trim())
    .filter(Boolean),
];

/**
 * Image optimization is on by default on Vercel. On other machines images are
 * served straight from their source, which avoids proxy/firewall problems on
 * corporate test machines. Force either way with NEXT_IMAGE_OPTIMIZATION=true|false.
 */
const optimizeImages = process.env.NEXT_IMAGE_OPTIMIZATION
  ? process.env.NEXT_IMAGE_OPTIMIZATION === "true"
  : process.env.VERCEL === "1";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    unoptimized: !optimizeImages,
    formats: ["image/avif", "image/webp"],
    remotePatterns: imageHosts.map((hostname) => ({
      protocol: "https" as const,
      hostname,
      pathname: "/**",
    })),
  },
  outputFileTracingIncludes: {
    "/**": ["./data/**/*"],
  },
};

export default nextConfig;
