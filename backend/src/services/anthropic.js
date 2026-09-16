const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const DEFAULT_MODEL = "claude-sonnet-5";

class LLMError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status || 502;
  }
}

/**
 * Calls the Anthropic Messages API using the server's own key
 * (process.env.ANTHROPIC_API_KEY) — the key never reaches the client.
 */
async function askAssistant(history) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new LLMError(
      "The server has no ANTHROPIC_API_KEY configured. Set it in backend/.env to enable Q&A.",
      500
    );
  }

  const messages = history
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({ role: m.role, content: m.text }));

  let response;
  try {
    response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || DEFAULT_MODEL,
        max_tokens: 1024,
        system:
          "You are a concise, helpful assistant embedded in a mobile app. Keep answers short and direct unless asked for detail.",
        messages,
      }),
    });
  } catch (err) {
    throw new LLMError("Couldn't reach the AI service. Try again in a moment.", 502);
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    if (response.status === 401) {
      throw new LLMError("The server's Anthropic API key was rejected.", 502);
    }
    throw new LLMError(`AI request failed (${response.status}). ${body.slice(0, 200)}`, 502);
  }

  const data = await response.json();
  const text = (data.content || []).map((block) => block.text || "").join("").trim();
  return text || "I didn't get a response back — try rephrasing that.";
}

module.exports = { askAssistant, LLMError, DEFAULT_MODEL };
