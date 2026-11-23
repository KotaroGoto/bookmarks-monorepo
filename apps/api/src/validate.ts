import { zValidator } from "@hono/zod-validator";
import type { ValidationTargets } from "hono";
import { z } from "zod";
import type { ErrorBody } from "./errors.ts";
export function validate<
  T extends z.ZodType,
  K extends keyof ValidationTargets,
>(target: K, schema: T) {
  return zValidator(target, schema, (result, c) => {
    if (!result.success) {
      return c.json<ErrorBody, 400>(
        {
          error: {
            code: "invalid_body",
            message: z.prettifyError(result.error),
          },
        },
        400,
      );
    }
  });
}
