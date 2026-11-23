import { describe, it, expect } from "vitest";
import { transition } from "../src/transition.ts";
import type { ListState } from "../src/types.ts";
import { sample } from "./sample.ts";
describe("transition", () => {
  it("読み込み中の追加は無視される", () => {
    const before: ListState = { status: "loading" };
    expect(transition(before, { type: "added", item: sample })).toBe(before);
  });
  it("一覧があるときの追加は先頭に入る", () => {
    const other = { ...sample, id: "2", title: "Vitest" };
    const before: ListState = { status: "success", items: [other] };
    expect(transition(before, { type: "added", item: sample })).toEqual({
      status: "success",
      items: [sample, other],
    });
  });
  it("削除すると一覧から消える", () => {
    const before: ListState = { status: "success", items: [sample] };
    expect(transition(before, { type: "removed", id: sample.id })).toEqual({
      status: "success",
      items: [],
    });
  });
});
