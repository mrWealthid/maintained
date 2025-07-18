/** @type {import('next').NextConfig} */
const nextConfig = {
	env: {
		CLOUDINARY_NAME: process.env.CLOUDINARY_NAME,
		IMG_PRESET: process.env.UPLOAD_IMAGE_PRESET,
		VIDEO_PRESET: process.env.UPLOAD_VIDEO_PRESET
	},
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'res.cloudinary.com',
				pathname: '/dw9grhu99/image/upload/**'
			}
		]
	}
};

export default nextConfig;
