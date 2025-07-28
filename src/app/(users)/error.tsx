'use client';
export default function Error({
	error,
	reset
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<div>
			<h2>Something went wrong! {error.message} </h2>
			<h2>digest! {error.digest} </h2>
		</div>
	);
}
