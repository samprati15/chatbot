export type MessageRole = "user" | "assistant" | "system";

export interface Message {
  id: string;
  role: MessageRole;
  text: string;
  createdAt: number;
}

export interface Task {
  id: string;
  title: string;
  done: boolean;
  createdAt: number;
}

export interface AssistantSettings {
  apiKey: string;
  model: string;
}
