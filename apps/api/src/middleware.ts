//import { randomUUID } from "node:crypto";
import { createMiddleware } from "hono/factory";
import type { ErrorBody } from "./errors.ts";

export type Env = { Variables: { requestId: string } };

export const withRequestId = createMiddleware<Env>(async (c, next) => {
  const requestId = crypto.randomUUID();
  c.set("requestId", requestId);
  const started = performance.now();
  await next();
  const ms = Math.round(performance.now() - started);
  console.log(
    `${c.req.method} ${c.req.path} ${c.res.status} ${ms}ms ${requestId}`,
  );
});

export function requireToken(token: string) {
  return createMiddleware<Env>(async (c, next) => {
    if (c.req.header("authorization") !== `Bearer ${token}`) {
      return c.json<ErrorBody, 401>(
        { error: { code: "unauthorized", message: "トークンが必要です" } },
        401,
      );
    }
    await next();
  });
}
