const express = require("express");
const { parseIntent } = require("../services/intent");
const tasksService = require("../services/tasks");
const messagesService = require("../services/messages");
const { askAssistant, LLMError } = require("../services/anthropic");

const router = express.Router();

router.get("/messages", (req, res) => {
  res.json({ messages: messagesService.getMessages(req.userId) });
});

router.delete("/messages", (req, res) => {
  messagesService.clearMessages(req.userId);
  res.status(204).end();
});

router.post("/chat", async (req, res) => {
  const { text } = req.body || {};
  if (typeof text !== "string" || !text.trim()) {
    return res.status(400).json({ error: "text is required." });
  }

  messagesService.addMessage(req.userId, "user", text);
  const intent = parseIntent(text);

  const respond = (reply, extra = {}) => {
    messagesService.addMessage(req.userId, "assistant", reply);
    res.json({ reply, intent: intent.type, ...extra });
  };

  switch (intent.type) {
    case "task_add": {
      const task = tasksService.addTask(req.userId, intent.title);
      return respond(`Added to your tasks: "${task.title}".`, { task });
    }
    case "task_list": {
      const open = tasksService.getTasks(req.userId).filter((t) => !t.done);
      const reply = open.length
        ? `Open tasks:\n${open.map((t) => `• ${t.title}`).join("\n")}`
        : "You have no open tasks. Nicely done.";
      return respond(reply);
    }
    case "task_done": {
      const task = tasksService.findOpenTaskByTitle(req.userId, intent.title);
      if (!task) return respond(`I couldn't find an open task matching "${intent.title}".`);
      tasksService.toggleTask(req.userId, task.id);
      return respond(`Marked "${task.title}" as done.`);
    }
    case "task_done_all": {
      const count = tasksService.completeAllTasks(req.userId);
      const reply = count > 0 ? `Marked all ${count} open task${count === 1 ? "" : "s"} as done.` : "You had no open tasks to complete.";
      return respond(reply);
    }
    case "task_delete": {
      const task = tasksService.findTaskByTitle(req.userId, intent.title);
      if (!task) return respond(`I couldn't find a task matching "${intent.title}".`);
      tasksService.deleteTask(req.userId, task.id);
      return respond(`Deleted "${task.title}".`);
    }
    case "task_clear_done": {
      const count = tasksService.clearCompletedTasks(req.userId);
      const reply = count > 0 ? `Cleared ${count} completed task${count === 1 ? "" : "s"}.` : "No completed tasks to clear.";
      return respond(reply);
    }
    case "call": {
      // The server has no access to the device's contacts or dialer — it
      // hands the target back to the client, which resolves the contact
      // locally and opens the native dialer for the user to confirm.
      return respond(`Looking up ${intent.target}…`, { target: intent.target });
    }
    case "chat":
    default: {
      try {
        const history = messagesService.getMessages(req.userId);
        const reply = await askAssistant(history);
        return respond(reply);
      } catch (err) {
        const status = err instanceof LLMError ? err.status : 502;
        const message = err instanceof LLMError ? err.message : "Something went wrong answering that.";
        messagesService.addMessage(req.userId, "assistant", message);
        return res.status(status).json({ reply: message, intent: "chat", error: true });
      }
    }
  }
});

module.exports = router;
