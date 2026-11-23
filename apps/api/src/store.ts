import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "./db/schema.ts";
import { randomUUID } from "node:crypto";
import { eq, inArray } from "drizzle-orm";
//import { db } from "./db/client.ts";
import { bookmarks, tags, bookmarkTags } from "./db/schema.ts";
import type { BookmarkRow } from "./db/schema.ts";
import type {
  Bookmark,
  CreateBookmark,
  UpdateBookmark,
} from "@bookmarks/shared";

export type Store = {
  list(tag: string | undefined): Bookmark[];
  find(id: string): Bookmark | undefined;
  create(input: CreateBookmark): Bookmark;
  update(id: string, input: UpdateBookmark): Bookmark | undefined;
  remove(id: string): boolean;
};

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

export function createStore(file: string): Store {
  const sqlite = new Database(file);
  sqlite.pragma("foreign_keys = ON");
  const db = drizzle(sqlite, { schema });
  migrate(db, { migrationsFolder: `${import.meta.dirname}/../drizzle` });

  type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

  function tagNamesOf(bookmarkId: string): string[] {
    return db
      .select({ name: tags.name })
      .from(bookmarkTags)
      .innerJoin(tags, eq(tags.id, bookmarkTags.tagId))
      .where(eq(bookmarkTags.bookmarkId, bookmarkId))
      .all()
      .map((r) => r.name);
  }

  function linkTags(tx: Tx, bookmarkId: string, names: string[]): void {
    if (names.length === 0) return;
    tx.insert(tags)
      .values(names.map((name) => ({ name })))
      .onConflictDoNothing()
      .run();
    const found = tx.select().from(tags).where(inArray(tags.name, names)).all();
    tx.insert(bookmarkTags)
      .values(found.map((t) => ({ bookmarkId, tagId: t.id })))
      .onConflictDoNothing()
      .run();
  }

  function find(id: string): Bookmark | undefined {
    const row = db.select().from(bookmarks).where(eq(bookmarks.id, id)).get();
    if (row === undefined) return undefined;
    return toBookmark(row, tagNamesOf(id));
  }

  return {
    list(tag) {
      const rows = db.select().from(bookmarks).all();
      const result = rows.map((row) => toBookmark(row, tagNamesOf(row.id)));
      return tag === undefined ? result : result.filter((b) => b.tags.includes(tag));
      //return tag === undefined ? result : result.filter((b) => b.tags.length > 0);
    },

    find,

    create(input) {
      const id = randomUUID();
      const createdAt = new Date().toISOString();
      db.transaction((tx) => {
        tx.insert(bookmarks)
          .values({
            id,
            title: input.title,
            url: input.url,
            note: input.note,
            createdAt,
          })
          .run();
        linkTags(tx, id, input.tags);
      });
      return {
        id,
        createdAt,
        title: input.title,
        url: input.url,
        note: input.note,
        tags: input.tags,
      };
    },

    update(id, input) {
      const current = find(id);
      if (current === undefined) return undefined;
      db.transaction((tx) => {
        tx.update(bookmarks)
          .set({
            title: input.title ?? current.title,
            url: input.url ?? current.url,
            note: input.note === undefined ? current.note : input.note,
          })
          .where(eq(bookmarks.id, id))
          .run();
        if (input.tags !== undefined) {
          tx.delete(bookmarkTags).where(eq(bookmarkTags.bookmarkId, id)).run();
          linkTags(tx, id, input.tags);
        }
      });
      return find(id);
    },
    remove(id) {
      return db.delete(bookmarks).where(eq(bookmarks.id, id)).run().changes > 0;
    },
  };
}