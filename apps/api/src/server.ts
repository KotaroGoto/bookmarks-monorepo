import { serve } from "@hono/node-server";
import { createApp } from "./app.ts";
import { createStore } from "./store.ts";

const app = createApp(createStore(process.env["DATABASE_FILE"] ?? "data/bookmarks.db"));

serve({ fetch: app.fetch, port: 8787 }, (info) => {
  console.log(`listening on http://localhost:${info.port}`);
});
