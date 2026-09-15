import { Message } from "../types";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";

export const DEFAULT_MODEL = "claude-sonnet-5";

export class LLMError extends Error {}

/**
 * Sends the conversation to the Anthropic Messages API and returns the
 * assistant's reply text. Requires the user's own Anthropic API key,
 * configured in Settings — this app never ships a bundled key.
 */
export async function askAssistant(
  history: Message[],
  apiKey: string,
  model: string
): Promise<string> {
  if (!apiKey) {
    throw new LLMError(
      "No API key set. Open Settings and add your Anthropic API key to enable Q&A."
    );
  }

  const messages = history
    .filter((m) => m.role !== "system")
    .map((m) => ({ role: m.role, content: m.text }));

  let response: Response;
  try {
    response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: model || DEFAULT_MODEL,
        max_tokens: 1024,
        system:
          "You are a concise, helpful assistant embedded in a mobile app. Keep answers short and direct unless asked for detail.",
        messages,
      }),
    });
  } catch (err) {
    throw new LLMError(
      "Couldn't reach the AI service. Check your internet connection and try again."
    );
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    if (response.status === 401) {
      throw new LLMError("That API key was rejected. Double-check it in Settings.");
    }
    throw new LLMError(`AI request failed (${response.status}). ${body.slice(0, 200)}`);
  }

  const data = await response.json();
  const text = data?.content?.map((block: any) => block?.text ?? "").join("").trim();
  return text || "I didn't get a response back — try rephrasing that.";
}
