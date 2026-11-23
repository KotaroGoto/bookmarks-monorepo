import { describe, it, expectTypeOf } from "vitest";
import type { Bookmark, CreateBookmark } from "../src/index.ts";
describe("共有型", () => {
  it("Bookmark は id と createdAt を持つ", () => {
    expectTypeOf<Bookmark>().toHaveProperty("id").toEqualTypeOf<string>();
    expectTypeOf<Bookmark>()
      .toHaveProperty("createdAt")
      .toEqualTypeOf<string>();
  });
  it("CreateBookmark は id と createdAt を持たない", () => {
    expectTypeOf<CreateBookmark>().not.toHaveProperty("id");
    expectTypeOf<CreateBookmark>().not.toHaveProperty("createdAt");
  });
  it("tags は文字列の配列", () => {
    expectTypeOf<Bookmark["tags"]>().toEqualTypeOf<string[]>();
  });
});
