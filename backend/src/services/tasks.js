const { v4: uuid } = require("uuid");
const db = require("../db");

function tasksFor(userId) {
  return db.get("tasks").filter({ userId });
}

function getTasks(userId) {
  return tasksFor(userId).sortBy("createdAt").reverse().value();
}

function addTask(userId, title) {
  const task = {
    id: uuid(),
    userId,
    title: title.trim(),
    done: false,
    createdAt: Date.now(),
  };
  db.get("tasks").push(task).write();
  return task;
}

function toggleTask(userId, id) {
  const task = db.get("tasks").find({ id, userId }).value();
  if (!task) return undefined;
  db.get("tasks").find({ id, userId }).assign({ done: !task.done }).write();
  return db.get("tasks").find({ id, userId }).value();
}

function deleteTask(userId, id) {
  const existed = !!db.get("tasks").find({ id, userId }).value();
  db.get("tasks").remove({ id, userId }).write();
  return existed;
}

function findOpenTaskByTitle(userId, query) {
  const q = query.trim().toLowerCase();
  return tasksFor(userId)
    .filter((t) => !t.done && t.title.toLowerCase().includes(q))
    .first()
    .value();
}

function findTaskByTitle(userId, query) {
  const q = query.trim().toLowerCase();
  return tasksFor(userId)
    .filter((t) => t.title.toLowerCase().includes(q))
    .first()
    .value();
}

function completeAllTasks(userId) {
  const open = tasksFor(userId)
    .filter((t) => !t.done)
    .value();
  open.forEach((t) => db.get("tasks").find({ id: t.id }).assign({ done: true }).write());
  return open.length;
}

function clearCompletedTasks(userId) {
  const done = tasksFor(userId)
    .filter((t) => t.done)
    .value();
  db.get("tasks")
    .remove((t) => t.userId === userId && t.done)
    .write();
  return done.length;
}

module.exports = {
  getTasks,
  addTask,
  toggleTask,
  deleteTask,
  findOpenTaskByTitle,
  findTaskByTitle,
  completeAllTasks,
  clearCompletedTasks,
};
