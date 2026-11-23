import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchBookmarks } from "../src/api.ts";
import { load } from "../src/load.ts";
import { sample } from "./sample.ts";
vi.mock("../src/api.ts");
beforeEach(() => {
  vi.resetAllMocks();
});
describe("load", () => {
  it("取得できたら load-succeeded を返す", async () => {
    vi.mocked(fetchBookmarks).mockResolvedValue([sample]);
    expect(await load()).toEqual({ type: "load-succeeded", items: [sample] });
  });
  it("取得に失敗したら load-failed を返す", async () => {
    const error = new Error("一覧を取得できませんでした（HTTP 500）");
    vi.mocked(fetchBookmarks).mockRejectedValue(error);
    expect(await load()).toEqual({
      type: "load-failed",
      message: "一覧を取得できませんでした（HTTP 500）",
    });
  });
});
