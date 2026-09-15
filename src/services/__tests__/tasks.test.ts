import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  addTask,
  clearCompletedTasks,
  completeAllTasks,
  deleteTask,
  findOpenTaskByTitle,
  findTaskByTitle,
  getTasks,
  toggleTask,
} from "../tasks";

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe("tasks service", () => {
  it("adds a task and lists it newest-first", async () => {
    await addTask("buy milk");
    await addTask("walk the dog");
    const tasks = await getTasks();
    expect(tasks.map((t) => t.title)).toEqual(["walk the dog", "buy milk"]);
    expect(tasks.every((t) => !t.done)).toBe(true);
  });

  it("toggles a task's done state", async () => {
    const task = await addTask("buy milk");
    await toggleTask(task.id);
    let tasks = await getTasks();
    expect(tasks.find((t) => t.id === task.id)?.done).toBe(true);

    await toggleTask(task.id);
    tasks = await getTasks();
    expect(tasks.find((t) => t.id === task.id)?.done).toBe(false);
  });

  it("deletes a task", async () => {
    const task = await addTask("buy milk");
    await deleteTask(task.id);
    const tasks = await getTasks();
    expect(tasks).toHaveLength(0);
  });

  it("finds an open task by fuzzy title match, ignoring completed ones", async () => {
    await addTask("buy milk");
    const done = await addTask("buy eggs");
    await toggleTask(done.id);

    const found = await findOpenTaskByTitle("milk");
    expect(found?.title).toBe("buy milk");

    const notFound = await findOpenTaskByTitle("eggs");
    expect(notFound).toBeUndefined();
  });

  it("findTaskByTitle matches regardless of done state", async () => {
    const done = await addTask("buy eggs");
    await toggleTask(done.id);
    const found = await findTaskByTitle("eggs");
    expect(found?.id).toBe(done.id);
  });

  it("completeAllTasks marks every open task done and reports how many changed", async () => {
    await addTask("buy milk");
    await addTask("walk the dog");
    const count = await completeAllTasks();
    expect(count).toBe(2);
    const tasks = await getTasks();
    expect(tasks.every((t) => t.done)).toBe(true);
  });

  it("clearCompletedTasks removes only done tasks and reports how many", async () => {
    const t1 = await addTask("buy milk");
    await addTask("walk the dog");
    await toggleTask(t1.id);

    const removed = await clearCompletedTasks();
    expect(removed).toBe(1);
    const tasks = await getTasks();
    expect(tasks.map((t) => t.title)).toEqual(["walk the dog"]);
  });
});
