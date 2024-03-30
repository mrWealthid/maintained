import axios from 'axios';

export async function fetchProfile() {
	const url = `/api/users/me`;
	try {
		const response = await axios(url);

		const { data } = response;
		return data;
	} catch (err) {
		console.log(err);
	}
}
