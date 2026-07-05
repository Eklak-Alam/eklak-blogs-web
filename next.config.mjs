/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-64d5ff7e7dce465bb9b49732c05a846b.r2.dev',
        port: '',
        pathname: '/**', // This allows all paths from this domain
      },
    ],
  },
};

export default nextConfig;