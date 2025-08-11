import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  env: {},
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api/v2/:path*',
        destination: `${process.env.APP_API_PROXY}/:path*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
