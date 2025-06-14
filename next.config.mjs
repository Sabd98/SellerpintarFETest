/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      new URL("https://s3.sellerpintar.com/articles/articles/**"),
      new URL("https://res.cloudinary.com/dqx7esttu/image/upload/**"),
      new URL(
        "http://res.cloudinary.com/naliverse/image/upload/v1749915097/ImageTesting/**"
      ),
    ],
  },
};

export default nextConfig;
