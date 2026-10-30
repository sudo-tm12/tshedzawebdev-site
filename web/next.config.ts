import type { NextConfig } from 'next'

// Static export: the site is plain files, so it can be hosted on GitHub Pages,
// Cloudflare Pages or cPanel. Server work (quotes, email) lives in ../api.
// NEXT_PUBLIC_BASE_PATH is empty on our own domain and "/tshedzawebdev-site" for the
// GitHub Pages preview (served from a sub-folder). Next adds it to every <Link>;
// plain asset URLs go through asset() in src/lib/site.ts.
const config: NextConfig = {
  output: 'export',
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || undefined,
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  poweredByHeader: false,
}

export default config
