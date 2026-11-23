import { describe, it, expect, beforeEach } from "vitest";
import { testClient } from "hono/testing";
import { createApp } from "../src/app.ts";
import { createStore, type Store } from "../src/store.ts";

function setup(store: Store) {
  const app = createApp(store, {
    apiToken: "test-token",
    allowedOrigin: "http://localhost:5173",
  });
  return testClient(app, undefined, undefined, {
    headers: { authorization: "Bearer test-token" },
  });
}

let client: ReturnType<typeof setup>;
beforeEach(() => {
  client = setup(createStore(":memory:"));
});

describe("GET /bookmarks", () => {
  it("最初は空の配列を返す", async () => {
    const res = await client.bookmarks.$get({ query: {} });
    expect(await res.json()).toEqual([]);
  });
  it("tag で絞り込める", async () => {
    await client.bookmarks.$post({
      json: { title: "Hono", url: "https://example.com/hono", tags: ["web"] },
    });
    await client.bookmarks.$post({
      json: {
        title: "Vitest",
        url: "https://example.com/vitest",
        tags: ["test"],
      },
    });
    const res = await client.bookmarks.$get({ query: { tag: "web" } });
    if (res.status !== 200)
      throw new Error(`予期しないステータスコード: ${res.status}`);
    const body = await res.json();
    expect(body.map((b) => b.title)).toEqual(["Hono"]);
  });
});

describe("POST /bookmarks", () => {
  it("登録すると 201 を返す", async () => {
    const res = await client.bookmarks.$post({
      json: { title: "Hono", url: "https://example.com/hono" },
    });
    expect(res.status).toBe(201);
  });
  it("タイトルが空なら 400 を返す", async () => {
    const res = await client.bookmarks.$post({
      json: { title: "", url: "https://example.com/hono" },
    });
    expect(res.status).toBe(400);
  });
});
describe("GET /bookmarks/:id", () => {
  const emptyStore: Store = {
    list: async () => [],
    find: async () => undefined,
    create: async (input) => ({
      id: "1",
      createdAt: "2026-07-30T00:00:00.000Z",
      ...input,
    }),
    update: async () => undefined,
    remove: async () => false,
  };
  it("見つからなければ404を返す", async () => {
    const res = await setup(emptyStore).bookmarks[":id"].$get({
      param: { id: "x" },
    });
    expect(res.status).toBe(404);
  });
});
