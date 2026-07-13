/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', 'react-icons', 'recharts'],
  },
};

export default nextConfig;