import type { Context } from "hono";
import type { ErrorBody } from "@bookmarks/shared";

export type { ErrorBody };

export function notFound(c: Context) {
  return c.json<ErrorBody, 404>(
    { error: { code: "not_found", message: "そのブックマークはありません" } },
    404,
  );
}
