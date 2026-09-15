import { getJSON, setJSON } from "./storage";
import { Task } from "../types";

const TASKS_KEY = "tasks:v1";

export async function getTasks(): Promise<Task[]> {
  return getJSON<Task[]>(TASKS_KEY, []);
}

export async function addTask(title: string): Promise<Task> {
  const tasks = await getTasks();
  const task: Task = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: title.trim(),
    done: false,
    createdAt: Date.now(),
  };
  await setJSON(TASKS_KEY, [task, ...tasks]);
  return task;
}

export async function toggleTask(id: string): Promise<void> {
  const tasks = await getTasks();
  const next = tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
  await setJSON(TASKS_KEY, next);
}

export async function deleteTask(id: string): Promise<void> {
  const tasks = await getTasks();
  await setJSON(
    TASKS_KEY,
    tasks.filter((t) => t.id !== id)
  );
}

/** Finds the closest open task by fuzzy (substring) title match, for chat commands like "done with groceries". */
export async function findOpenTaskByTitle(query: string): Promise<Task | undefined> {
  const tasks = await getTasks();
  const q = query.trim().toLowerCase();
  return tasks.find((t) => !t.done && t.title.toLowerCase().includes(q));
}
