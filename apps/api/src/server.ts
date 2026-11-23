import { z } from "zod";
import { serve } from "@hono/node-server";
import { createApp } from "./app.ts";
import { createStore } from "./store.ts";

const EnvSchema = z.object({
  API_TOKEN: z.string().min(1),
  DATABASE_FILE: z.string().min(1).default("data/bookmarks.db"),
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  console.error(`環境変数が足りません\n${z.prettifyError(parsed.error)}`);
  process.exit(1);
}
const env = parsed.data;

const app = createApp(createStore(env.DATABASE_FILE), {
  apiToken: env.API_TOKEN,
  allowedOrigin: "http://localhost:5173",
});

serve({ fetch: app.fetch, port: 8787 }, (info) => {
  console.log(`listening on http://localhost:${info.port}`);
});
