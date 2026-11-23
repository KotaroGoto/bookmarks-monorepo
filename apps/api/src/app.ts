import { Hono } from "hono";
import { cors } from "hono/cors";
import { z } from "zod";
import { CreateBookmark, UpdateBookmark } from "@bookmarks/shared";
import { validate } from "./validate.ts";
import { notFound } from "./errors.ts";
import { withRequestId, requireToken, type Env } from "./middleware.ts";
import type { Store } from "./store.ts";

export type AppOptions = { apiToken: string; allowedOrigin: string };

export function createApp(store: Store, options: AppOptions) {
  const app = new Hono<Env>();

  app.use(withRequestId);
  app.use(cors({ origin: options.allowedOrigin }));
  app.on(
    ["POST", "PATCH", "DELETE"],
    ["/bookmarks", "/bookmarks/:id"],
    requireToken(options.apiToken),
  );

  return app
    .get(
      "/bookmarks",
      validate("query", z.object({ tag: z.string().optional() })),
      async (c) => {
        const { tag } = c.req.valid("query");
        return c.json(await store.list(tag));
      },
    )
    .get("/bookmarks/:id", async (c) => {
      const bookmark = await store.find(c.req.param("id"));
      if (bookmark === undefined) return notFound(c);
      return c.json(bookmark);
    })
    .post("/bookmarks", validate("json", CreateBookmark), async (c) => {
      return c.json(await store.create(c.req.valid("json")), 201);
    })
    .patch("/bookmarks/:id", validate("json", UpdateBookmark), async (c) => {
      const updated = await store.update(c.req.param("id"), c.req.valid("json"));
      if (updated === undefined) return notFound(c);
      return c.json(updated);
    })
    .delete("/bookmarks/:id", async (c) => {
      if (!(await store.remove(c.req.param("id")))) return notFound(c);
      return c.body(null, 204);
    });
}
export type AppType = ReturnType<typeof createApp>;
