/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  images: { qualities: [75, 85] },
  turbopack: { root: import.meta.dirname },
};
export default nextConfig;
