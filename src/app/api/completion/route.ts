// app/api/completion/route.ts
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(req: Request) {
	try {
		const { prompt } = await req.json();

		if (!prompt) {
			return new Response('Missing prompt', { status: 400 });
		}

		const result = await streamText({
			model: openai('gpt-4o'),
			system: 'You are a helpful assistant.',
			prompt
		});

		return result.toAIStreamResponse(); // ✅ required for streaming
	} catch (error) {
		console.error('❌ API ERROR:', error);
		return new Response('Internal Server Error', { status: 500 });
	}
}
