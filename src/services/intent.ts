export type Intent =
  | { type: "task_add"; title: string }
  | { type: "task_list" }
  | { type: "task_done"; title: string }
  | { type: "call"; target: string }
  | { type: "chat"; text: string };

const TASK_ADD = /^(?:remind me to|add (?:a )?task(?: to)?|todo:?|task:?)\s+(.+)/i;
const TASK_LIST = /^(?:show|list|what are)(?: my)? tasks\??$/i;
const TASK_DONE = /^(?:mark|complete|finish|done)(?: with)?(?: task)?:?\s+(.+)/i;
const CALL = /^(?:call|dial|phone)\s+(.+)/i;

export function parseIntent(raw: string): Intent {
  const text = raw.trim();

  const addMatch = text.match(TASK_ADD);
  if (addMatch) return { type: "task_add", title: addMatch[1].trim() };

  if (TASK_LIST.test(text)) return { type: "task_list" };

  const doneMatch = text.match(TASK_DONE);
  if (doneMatch) return { type: "task_done", title: doneMatch[1].trim() };

  const callMatch = text.match(CALL);
  if (callMatch) return { type: "call", target: callMatch[1].trim() };

  return { type: "chat", text };
}
