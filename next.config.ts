import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // https://nextjs.org/docs/messages/next-image-unconfigured-host
  images: {
    remotePatterns: [new URL("https://lh3.googleusercontent.com/a/**")],
  },
};

export default nextConfig;

// Enable calling `getCloudflareContext()` in `next dev`.
// See https://opennext.js.org/cloudflare/bindings#local-access-to-bindings.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
