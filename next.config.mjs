/** @type {import('next').NextConfig} */
import withPWA from 'next-pwa';

const nextConfig = {
  reactStrictMode: true,
  env: {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || "AIzaSyB7B6681pEsgWq9mFkJNVqo3viGty2KiRw",
  },
  webpack: (config, { isServer }) => {
    // Handle browser-only modules when server-side rendering
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,  // Needed for vega-canvas
      };
    }
    
    return config;
  },
  // Disable Server Components during initial development to prevent serialization issues
  experimental: {
    // This prevents the error with Set objects
    serverComponentsExternalPackages: ['lodash', 'vega', 'vega-lite'],
  },
};

// Wrap the Next.js config with PWA configuration
const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

export default pwaConfig(nextConfig); 