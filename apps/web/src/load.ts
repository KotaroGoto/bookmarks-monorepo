import { fetchBookmarks } from "./api.ts";
import type { Action } from "./types.ts";
export async function load(): Promise<Action> {
  try {
    return { type: "load-succeeded", items: await fetchBookmarks() };
  } catch (e) {
    const message = e instanceof Error ? e.message : "通信に失敗しました";
    return { type: "load-failed", message };
  }
}
