const TASK_ADD = /^(?:remind me to|add (?:a )?task(?: to)?|todo:?|task:?)\s+(.+)/i;
const TASK_LIST = /^(?:show|list|what are)(?: my)? tasks\??$/i;
const TASK_DONE_ALL = /^(?:mark|complete|finish)(?: all)?(?: my)? tasks(?: as)?(?: done)?\??$/i;
const TASK_DONE = /^(?:mark|complete|finish|done)(?: with)?(?: task)?:?\s+(.+)/i;
const TASK_DELETE = /^(?:delete|remove|cancel)(?: task)?:?\s+(.+)/i;
const TASK_CLEAR_DONE = /^(?:clear|remove|delete)(?: my)? (?:completed|done|finished) tasks\??$/i;
const CALL = /^(?:call|dial|phone)\s+(.+)/i;

/**
 * Same intent grammar as the mobile client's src/services/intent.ts, kept in
 * sync by hand — this lets the server drive task mutations for any client
 * (Flutter, web, etc.) while "call" stays a client-only action (only the
 * device has contacts + a dialer).
 */
function parseIntent(raw) {
  const text = raw.trim();

  const addMatch = text.match(TASK_ADD);
  if (addMatch) return { type: "task_add", title: addMatch[1].trim() };

  if (TASK_LIST.test(text)) return { type: "task_list" };

  if (TASK_CLEAR_DONE.test(text)) return { type: "task_clear_done" };

  if (TASK_DONE_ALL.test(text)) return { type: "task_done_all" };

  const doneMatch = text.match(TASK_DONE);
  if (doneMatch) return { type: "task_done", title: doneMatch[1].trim() };

  const deleteMatch = text.match(TASK_DELETE);
  if (deleteMatch) return { type: "task_delete", title: deleteMatch[1].trim() };

  const callMatch = text.match(CALL);
  if (callMatch) return { type: "call", target: callMatch[1].trim() };

  return { type: "chat", text };
}

module.exports = { parseIntent };
