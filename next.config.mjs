/** @type {import('next').NextConfig} */
const nextConfig = {
	env: {
		CLOUDINARY_NAME: process.env.CLOUDINARY_NAME,
		IMG_PRESET: process.env.UPLOAD_IMAGE_PRESET,
		VIDEO_PRESET: process.env.UPLOAD_VIDEO_PRESET
	},
	images: {
		domains: ['res.cloudinary.com']
	}
};

export default nextConfig;
