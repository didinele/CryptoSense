/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@cryptosense/core"],
  experimental: {
    reactCompiler: true,
  },
};

export default nextConfig;
