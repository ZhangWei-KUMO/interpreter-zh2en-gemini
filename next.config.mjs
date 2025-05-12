/** @type {import('next').NextConfig} */
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

export default nextConfig; 