import { client } from "./client.ts";
import type { Bookmark, CreateBookmark } from "@bookmarks/shared";

export async function fetchBookmarks(tag?: string): Promise<Bookmark[]> {
  const res = await client.bookmarks.$get({
    query: tag === undefined ? {} : { tag },
  });
  if (!res.ok) {
    throw new Error(`一覧を取得できませんでした（HTTP ${res.status}）`);
  }
<<<<<<< HEAD
  // return res.json();
  const data: any = await res.json();
  return data.items;
=======
  return res.json();
  //const data: any = await res.json();
  //return data.items;
>>>>>>> eafd9a589f8f1f1dc459fe4e185645bfe486c050
}

export async function addBookmark(input: CreateBookmark): Promise<Bookmark> {
  const res = await client.bookmarks.$post({ json: input });
  if (!res.ok) {
    throw new Error(`登録できませんでした（HTTP ${res.status}）`);
  }
  return res.json();
}

export async function removeBookmark(id: string): Promise<void> {
  const res = await client.bookmarks[":id"].$delete({ param: { id } });
  if (!res.ok) {
    throw new Error(`削除できませんでした（HTTP ${res.status}）`);
  }
}