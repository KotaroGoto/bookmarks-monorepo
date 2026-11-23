import { describe, it, expect } from "vitest";
import { CreateBookmark, UpdateBookmark } from "../src/index.ts";
describe("CreateBookmark", () => {
  it("tags を省略すると空の配列になる", () => {
    const result = CreateBookmark.parse({
      title: "Hono",
      url: "https://example.com/hono",
    });
    expect(result.tags).toEqual([]);
  });
  it("空のタイトルを通さない", () => {
    const result = CreateBookmark.safeParse({
      title: "",
      url: "https://example.com",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["title"]);
    }
  });
  it("URLでない文字列を通さない", () => {
    expect(CreateBookmark.safeParse({ title: "x", url: "ts7" }).success).toBe(
      false,
    );
  });
});
describe("UpdateBookmark", () => {
  it("tags を省略したら tags を入れない", () => {
    expect(UpdateBookmark.parse({ title: "新" })).toEqual({ title: "新" });
  });
});
