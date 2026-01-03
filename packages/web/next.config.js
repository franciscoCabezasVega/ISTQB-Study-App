/** @type {import('next').NextConfig} */
const fs = require('fs');
const path = require('path');

// Leer la versión del package.json raíz
const rootPackageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf8')
);

const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_APP_VERSION: rootPackageJson.version,
    NEXT_PUBLIC_BUILD_DATE: new Date().toISOString().split('T')[0],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  async headers() {
    return [
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/icon.svg',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
