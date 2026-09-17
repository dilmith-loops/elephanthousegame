import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH !== undefined 
  ? process.env.NEXT_PUBLIC_BASE_PATH 
  : '/ElephantHouseGame';

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  ...(isProd ? { output: "export" } : {}),
  trailingSlash: true,
  basePath: basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  ...(!isProd ? {
    async redirects() {
      return [
        {
          source: '/',
          destination: `${basePath}/`,
          basePath: false,
          permanent: false,
        },
      ];
    },
  } : {}),
};

export default nextConfig;


