export function mapToObject(map: Map<string, any>): { [key: string]: any } {
	const obj: { [key: string]: any } = {};
	for (let [key, value] of Array.from(map)) {
		// Checking if the value is a string representation of a number
		if (typeof value === 'string' && !isNaN(Number(value))) {
			value = Number(value);
		}
		obj[key] = value;
	}
	return obj;
}

/**
 * Converts a File object to a Base64-encoded string.
 * @param file The File object to convert.
 * @returns A promise that resolves with the Base64-encoded string.
 */
export function fileToBase64(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = () => {
			// The result attribute contains the data as a base64-encoded string
			resolve(reader.result as string);

			console.log(reader.result);
		};

		reader.onerror = (error) => {
			reject(error);
		};

		// Read the file as a data URL (base64-encoded string)
		reader.readAsDataURL(file);
	});
}

export default fileToBase64;

// --- Add this helper at the top or in a utils file ---
export function buildQueryString(params: Record<string, any>): string {
	return Object.entries(params)
		.filter(
			([_, value]) =>
				value !== undefined && value !== null && value !== ''
		)
		.map(
			([key, value]) =>
				`${encodeURIComponent(key)}=${encodeURIComponent(value)}`
		)
		.join('&');
}
