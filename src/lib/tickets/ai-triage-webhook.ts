type TriggerAiTriageWebhookArgs = {
  ticketId: string;
  title: string;
  description: string;
  area: string;
  category?: string;
  property?: string;
  unit?: string;
  images?: string[];
  videos?: string[];
  documents?: string[];
};

type TriggerAiTriageWebhookResult =
  | { sent: true }
  | { sent: false; skippedReason: "missing-webhook-url" }
  | { sent: false; error: string };

export async function triggerAiTriageWebhook(
  payload: TriggerAiTriageWebhookArgs,
): Promise<TriggerAiTriageWebhookResult> {
  const webhookUrl = process.env.N8N_MAINTENANCE_TRIAGE_WEBHOOK_URL;
  if (!webhookUrl) {
    return { sent: false, skippedReason: "missing-webhook-url" };
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (process.env.N8N_WEBHOOK_SECRET) {
    headers.Authorization = `Bearer ${process.env.N8N_WEBHOOK_SECRET}`;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return {
        sent: false,
        error: `n8n webhook responded with ${response.status}`,
      };
    }

    return { sent: true };
  } catch (error) {
    return {
      sent: false,
      error: error instanceof Error ? error.message : "Unknown n8n webhook error",
    };
  }
}
