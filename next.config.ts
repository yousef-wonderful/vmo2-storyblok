import type { NextConfig } from 'next';

// Cache Components stays off: every page reads live Storyblok content, and the
// Visual Editor needs draft pages to re-render on each edit.
const nextConfig: NextConfig = {};

export default nextConfig;
