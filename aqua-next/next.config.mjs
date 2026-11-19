const staticExport = process.env.STATIC_EXPORT === 'true';

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(staticExport ? { output: 'export', trailingSlash: true } : {}),
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  poweredByHeader: false,
  images: { qualities: [75, 85], unoptimized: staticExport },
  turbopack: { root: import.meta.dirname },
};
export default nextConfig;
