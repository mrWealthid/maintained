'use client';

import { useChat, useCompletion } from '@ai-sdk/react';
//This is for testing the completion endpoint
// export default function Page() {
// 	const { completion, complete, isLoading, error } = useCompletion({
// 		api: '/api/completion'
// 	});

// 	return (
// 		<div>
// 			<button onClick={() => complete('Why is the sky blue?')}>
// 				Generate
// 			</button>

// 			{isLoading && <p>Loading...</p>}
// 			{error && <p className='text-red-500'>Error: {error.message}</p>}
// 			<div>{completion}</div>
// 		</div>
// 	);
// }

//This is for testing the chat endpoint
// export default function Page() {
// 	const { messages, , isLoading, error } = useChat({
// 		api: '/api/chat'
// 	});

// 	return (
// 		<div>
// 			<button onClick={() => complete('Why is the sky blue?')}>
// 				Generate
// 			</button>

// 			{isLoading && <p>Loading...</p>}
// 			{error && <p className='text-red-500'>Error: {error.message}</p>}
// 			<div>{completion}</div>
// 		</div>
// 	);
// }
