/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    // Optimize bundle size and package imports
    optimizePackageImports: ['lucide-react'],
    serverComponentsExternalPackages: [
      'fluent-ffmpeg',
      '@ffmpeg-installer/ffmpeg',
      '@ffprobe-installer/ffprobe',
      'bullmq',
      'ioredis',
      'sharp',
      'libreoffice-convert',
      'adm-zip',
      'archiver',
      '@imgly/background-removal',
      'onnxruntime-web',
      'tesseract.js',
    ],
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'onnxruntime-node$': false,
    };
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        module: false,
      };
    }
    return config;
  },
  async headers() {
    return [
      {
        source: '/((?!embed).*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'X-Robots-Tag',
            value: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
          },
        ],
      },
      {
        source: '/embed/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors *",
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
