import { describe, it, expect, beforeEach } from "vitest";
import { createStore, type Store } from "../src/store.ts";

let store: Store;
beforeEach(() => {
  store = createStore(":memory:");
});

describe("createStore", () => {
  it("タイトルだけ更新してもタグが残る", async () => {
    const created = await store.create({
      title: "旧",
      url: "https://example.com/x",
      tags: ["keep"],
      note: null,
    });
    const updated = await store.update(created.id, { title: "新" });
    expect(updated?.title).toBe("新");
    expect(updated?.tags).toEqual(["keep"]);
  });

  it("削除したものは見つからない", async () => {
    const created = await store.create({
      title: "x",
      url: "https://example.com/x",
      tags: [],
      note: null,
    });
    expect(await store.remove(created.id)).toBe(true);
    expect(await store.find(created.id)).toBe(undefined);
  });
});
