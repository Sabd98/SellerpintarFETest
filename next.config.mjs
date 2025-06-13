/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      new URL("https://s3.sellerpintar.com/articles/articles/**"),
      new URL("https://res.cloudinary.com/dqx7esttu/image/upload/**"),
    ],
  },
};

export default nextConfig;
