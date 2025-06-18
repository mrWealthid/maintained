export async function fetchProfile<T>(): Promise<T | undefined> {
	const url = `/api/users/me`;
	try {
		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}
		const data = await response.json();
		return data;
	} catch (err) {
		console.log(err);
	}
}
