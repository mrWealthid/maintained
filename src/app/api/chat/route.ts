// app/api/completion/route.ts
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export const maxDuration = 30;
export async function POST(req: Request) {
	try {
		const { messages } = await req.json();

		const result = await streamText({
			model: openai('gpt-4o'),
			messages
		});

		return result.toAIStreamResponse(); // ✅ required for streaming
	} catch (error) {
		console.error('❌ API ERROR:', error);
		return new Response('Internal Server Error', { status: 500 });
	}
}
