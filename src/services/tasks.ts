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

/** Finds any task (done or not) by fuzzy (substring) title match, for chat commands like "delete groceries". */
export async function findTaskByTitle(query: string): Promise<Task | undefined> {
  const tasks = await getTasks();
  const q = query.trim().toLowerCase();
  return tasks.find((t) => t.title.toLowerCase().includes(q));
}

/** Marks every open task done in one shot, for "complete all my tasks". Returns how many changed. */
export async function completeAllTasks(): Promise<number> {
  const tasks = await getTasks();
  const openCount = tasks.filter((t) => !t.done).length;
  await setJSON(
    TASKS_KEY,
    tasks.map((t) => ({ ...t, done: true }))
  );
  return openCount;
}

/** Removes every completed task, for "clear completed tasks". Returns how many were removed. */
export async function clearCompletedTasks(): Promise<number> {
  const tasks = await getTasks();
  const remaining = tasks.filter((t) => !t.done);
  await setJSON(TASKS_KEY, remaining);
  return tasks.length - remaining.length;
}
