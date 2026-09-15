import { parseIntent } from "../intent";

describe("parseIntent", () => {
  it("parses task_add from several phrasings", () => {
    expect(parseIntent("remind me to buy milk")).toEqual({ type: "task_add", title: "buy milk" });
    expect(parseIntent("add task walk the dog")).toEqual({ type: "task_add", title: "walk the dog" });
    expect(parseIntent("todo: call the bank")).toEqual({ type: "task_add", title: "call the bank" });
  });

  it("parses task_list", () => {
    expect(parseIntent("list my tasks")).toEqual({ type: "task_list" });
    expect(parseIntent("show tasks")).toEqual({ type: "task_list" });
    expect(parseIntent("what are my tasks?")).toEqual({ type: "task_list" });
  });

  it("parses task_done_all before falling through to task_done", () => {
    expect(parseIntent("complete all tasks")).toEqual({ type: "task_done_all" });
    expect(parseIntent("finish my tasks")).toEqual({ type: "task_done_all" });
  });

  it("parses task_done with a specific title", () => {
    expect(parseIntent("done with milk")).toEqual({ type: "task_done", title: "milk" });
    expect(parseIntent("mark task walk the dog")).toEqual({ type: "task_done", title: "walk the dog" });
  });

  it("parses task_clear_done", () => {
    expect(parseIntent("clear completed tasks")).toEqual({ type: "task_clear_done" });
    expect(parseIntent("delete done tasks")).toEqual({ type: "task_clear_done" });
  });

  it("parses task_delete", () => {
    expect(parseIntent("delete task milk")).toEqual({ type: "task_delete", title: "milk" });
    expect(parseIntent("remove walk the dog")).toEqual({ type: "task_delete", title: "walk the dog" });
  });

  it("parses call intent", () => {
    expect(parseIntent("call Mom")).toEqual({ type: "call", target: "Mom" });
    expect(parseIntent("dial +1 555 123 4567")).toEqual({ type: "call", target: "+1 555 123 4567" });
  });

  it("falls back to chat for anything else", () => {
    expect(parseIntent("what's the capital of France?")).toEqual({
      type: "chat",
      text: "what's the capital of France?",
    });
  });
});
