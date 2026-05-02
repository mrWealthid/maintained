// app/api/chat/route.ts
// This endpoint returns an AI stream response. It intentionally uses the AI SDK
// stream response shape instead of the app-wide JSON success envelope.
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from "zod";
import { ApiError, errorToNextResponse, parseOrThrow } from "@/lib/errors/apiError";
import { getUserFromCookies } from "@/lib/auth/getUserFromCookies";
import { assertLegacyWorkspacePermission } from "@/lib/auth/permission-guards";
import { PERMISSION } from "@/shared/auth/permission-registry";

export const maxDuration = 30;

const chatCompletionBodySchema = z.object({
	messages: z.array(z.unknown()).min(1, "Messages are required"),
});

export async function POST(req: Request) {
	try {
		const verify = await getUserFromCookies();
		if (!verify) throw ApiError.unauthorized();
		await assertLegacyWorkspacePermission(verify, PERMISSION.CHAT_SEND);

		const { messages } = parseOrThrow(chatCompletionBodySchema, await req.json());

		const result = await streamText({
			model: openai('gpt-4o'),
			messages: messages as any
		});

		return result.toAIStreamResponse(); // ✅ required for streaming
	} catch (error) {
		return errorToNextResponse(
			error instanceof ApiError ? error : ApiError.internal("Chat completion failed", error),
		);
	}
}
