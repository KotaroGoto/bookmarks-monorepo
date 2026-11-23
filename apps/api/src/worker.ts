import { z } from "zod";
import { createApp } from "./app.ts";
import { createD1Store } from "./d1-store.ts";
const EnvSchema = z.object({
  API_TOKEN: z.string().min(1),
  ALLOWED_ORIGIN: z.string().min(1),
});
type Bindings = { DB: D1Database };
export default {
  async fetch(
    request: Request,
    env: Bindings & Record<string, unknown>,
  ): Promise<Response> {
    const parsed = EnvSchema.safeParse(env);
    if (!parsed.success) {
      return new Response("設定が足りません", { status: 500 });
    }
    const app = createApp(createD1Store(env.DB), {
      apiToken: parsed.data.API_TOKEN,
      allowedOrigin: parsed.data.ALLOWED_ORIGIN,
    });
    return app.fetch(request);
  },
};
