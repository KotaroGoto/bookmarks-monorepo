import { drizzle } from "drizzle-orm/d1";
import { eq, inArray } from "drizzle-orm";
import * as schema from "./db/schema.ts";
import { bookmarks, tags, bookmarkTags } from "./db/schema.ts";
import type { BookmarkRow } from "./db/schema.ts";
import type { Bookmark } from "@bookmarks/shared";
import type { Store } from "./store.ts";

function toBookmark(row: BookmarkRow, names: string[]): Bookmark {
  return {
    id: row.id,
    title: row.title,
    url: row.url,
    note: row.note,
    tags: names,
    createdAt: row.createdAt,
  };
}

export function createD1Store(d1: D1Database): Store {
  const db = drizzle(d1, { schema });

  async function tagNamesOf(bookmarkId: string): Promise<string[]> {
    const rows = await db
      .select({ name: tags.name })
      .from(bookmarkTags)
      .innerJoin(tags, eq(tags.id, bookmarkTags.tagId))
      .where(eq(bookmarkTags.bookmarkId, bookmarkId))
      .all();
    return rows.map((r) => r.name);
  }

  async function find(id: string): Promise<Bookmark | undefined> {
    const row = await db
      .select()
      .from(bookmarks)
      .where(eq(bookmarks.id, id))
      .get();
    if (row === undefined) return undefined;
    return toBookmark(row, await tagNamesOf(id));
  }

  async function linkTags(bookmarkId: string, names: string[]): Promise<void> {
    if (names.length === 0) return;
    await db
      .insert(tags)
      .values(names.map((name) => ({ name })))
      .onConflictDoNothing()
      .run();
    const found = await db
      .select()
      .from(tags)
      .where(inArray(tags.name, names))
      .all();
    await db
      .insert(bookmarkTags)
      .values(found.map((t) => ({ bookmarkId, tagId: t.id })))
      .onConflictDoNothing()
      .run();
  }

  return {
    async list(tag) {
      const rows = await db.select().from(bookmarks).all();
      const result = await Promise.all(
        rows.map(async (row) => toBookmark(row, await tagNamesOf(row.id))),
      );
      return tag === undefined
        ? result
        : result.filter((b) => b.tags.includes(tag));
    },

    find,
  
    async create(input) {
      const id = crypto.randomUUID();
      const createdAt = new Date().toISOString();
      await db
        .insert(bookmarks)
        .values({ id, title: input.title, url: input.url, note: input.note, createdAt, })

        .run();
      await linkTags(id, input.tags);
      return { id, createdAt, title: input.title, url: input.url, note: input.note, tags: input.tags, };
    },

    async update(id, input) {
      const current = await find(id);
      if (current === undefined) return undefined;
        await db.update(bookmarks)
          .set({
            title: input.title ?? current.title,
            url: input.url ?? current.url,
            note: input.note === undefined ? current.note : input.note,
          })
          .where(eq(bookmarks.id, id))
          .run();
        if (input.tags !== undefined) {
          await db.delete(bookmarkTags).where(eq(bookmarkTags.bookmarkId, id)).run();
          await linkTags(id, input.tags);
        }
      return await find(id);
    },
    async remove(id) {
      const result = await db.delete(bookmarks).where(eq(bookmarks.id, id)).run();
      return result.meta.changes > 0;
    },
  };
}
