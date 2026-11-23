import { Hono } from "hono";
import { cors } from "hono/cors";
import { z } from "zod";
import { CreateBookmark, UpdateBookmark } from "@bookmarks/shared";
import { validate } from "./validate.ts";
import { notFound } from "./errors.ts";
import { withRequestId, requireToken, type Env } from "./middleware.ts";
import type { Store } from "./store.ts";

export function createApp(store: Store) {
  const app = new Hono<Env>();

  app.use(withRequestId);
  app.use(cors({ origin: "http://localhost:5173" }));
  app.on(
    ["POST", "PATCH", "DELETE"],
    ["/bookmarks", "/bookmarks/:id"],
    requireToken,
  );

  return app
    .get(
      "/bookmarks",
      validate("query", z.object({ tag: z.string().optional() })),
      (c) => c.json(store.list(c.req.valid("query").tag)),
    )
    .get("/bookmarks/:id", (c) => {
      const bookmark = store.find(c.req.param("id"));
      if (bookmark === undefined) return notFound(c);
      return c.json(bookmark);
    })
    .post("/bookmarks", validate("json", CreateBookmark), (c) => {
      return c.json(store.create(c.req.valid("json")), 201);
    })
    .patch("/bookmarks/:id", validate("json", UpdateBookmark), (c) => {
      const updated = store.update(c.req.param("id"), c.req.valid("json"));
      if (updated === undefined) return notFound(c);
      return c.json(updated);
    })
    .delete("/bookmarks/:id", (c) => {
      if (!store.remove(c.req.param("id"))) return notFound(c);
      return c.body(null, 204);
    });
}
export type AppType = ReturnType<typeof createApp>;
