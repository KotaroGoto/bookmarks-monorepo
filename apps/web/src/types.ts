import type { Bookmark } from "@bookmarks/shared";

export type ListState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; items: Bookmark[] };

export type Action =
  | { type: "load-started" }
  | { type: "load-succeeded"; items: Bookmark[] }
  | { type: "load-failed"; message: string }
  | { type: "added"; item: Bookmark }
  | { type: "removed"; id: string };
