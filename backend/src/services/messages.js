const { v4: uuid } = require("uuid");
const db = require("../db");

function getMessages(userId) {
  return db.get("messages").filter({ userId }).sortBy("createdAt").value();
}

function addMessage(userId, role, text) {
  const message = { id: uuid(), userId, role, text, createdAt: Date.now() };
  db.get("messages").push(message).write();
  return message;
}

function clearMessages(userId) {
  db.get("messages").remove({ userId }).write();
}

module.exports = { getMessages, addMessage, clearMessages };
