import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.b-cdn.net' }, // Bunny.net CDN
      { protocol: 'https', hostname: 'vz-*.b-cdn.net' },
      { protocol: 'https', hostname: '*.supabase.co' }
    ]
  }
};

export default withNextIntl(nextConfig);
