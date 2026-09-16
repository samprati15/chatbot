const express = require("express");
const tasks = require("../services/tasks");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ tasks: tasks.getTasks(req.userId) });
});

router.post("/", (req, res) => {
  const { title } = req.body || {};
  if (typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ error: "title is required." });
  }
  res.status(201).json({ task: tasks.addTask(req.userId, title) });
});

router.patch("/:id/toggle", (req, res) => {
  const task = tasks.toggleTask(req.userId, req.params.id);
  if (!task) return res.status(404).json({ error: "Task not found." });
  res.json({ task });
});

router.delete("/:id", (req, res) => {
  const existed = tasks.deleteTask(req.userId, req.params.id);
  if (!existed) return res.status(404).json({ error: "Task not found." });
  res.status(204).end();
});

router.post("/complete-all", (req, res) => {
  const count = tasks.completeAllTasks(req.userId);
  res.json({ count });
});

router.post("/clear-completed", (req, res) => {
  const count = tasks.clearCompletedTasks(req.userId);
  res.json({ count });
});

module.exports = router;
