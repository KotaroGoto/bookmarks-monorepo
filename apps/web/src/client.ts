import { hc } from "hono/client";
import type { AppType } from "@bookmarks/api/app";
export const client = hc<AppType>(import.meta.env.VITE_API_BASE_URL, {
  headers: { authorization: `Bearer ${import.meta.env.VITE_API_TOKEN}` },
});
