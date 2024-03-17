/** @type {import('next').NextConfig} */
const nextConfig = {
	env: {
		CLOUDINARY_NAME: process.env.CLOUDINARY_NAME
	}
};

export default nextConfig;
