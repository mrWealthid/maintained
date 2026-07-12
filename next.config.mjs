/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    CLOUDINARY_NAME: process.env.CLOUDINARY_NAME,
    IMG_PRESET: process.env.UPLOAD_IMAGE_PRESET,
    VIDEO_PRESET: process.env.UPLOAD_VIDEO_PRESET,
    DOCUMENT_PRESET: process.env.UPLOAD_DOCUMENT_PRESET,
    NEXT_PUBLIC_PUSHER_KEY: process.env.PUSHER_KEY,
    NEXT_PUBLIC_PUSHER_CLUSTER: process.env.PUSHER_CLUSTER,
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
