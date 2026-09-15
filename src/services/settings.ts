import { getJSON, getSecret, setJSON, setSecret } from "./storage";
import { DEFAULT_MODEL } from "./llm";
import { AssistantSettings } from "../types";

const API_KEY_SECRET = "anthropic_api_key";
const MODEL_KEY = "assistant_model:v1";

export async function loadSettings(): Promise<AssistantSettings> {
  const [apiKey, model] = await Promise.all([
    getSecret(API_KEY_SECRET),
    getJSON<string>(MODEL_KEY, DEFAULT_MODEL),
  ]);
  return { apiKey: apiKey ?? "", model: model || DEFAULT_MODEL };
}

export async function saveSettings(settings: AssistantSettings): Promise<void> {
  await Promise.all([
    setSecret(API_KEY_SECRET, settings.apiKey.trim()),
    setJSON(MODEL_KEY, settings.model.trim() || DEFAULT_MODEL),
  ]);
}
