import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    name: "shared",
    environment: "node",
    include: ["test/**/*.test.ts"],
    typecheck: { enabled: true, tsconfig: "./tsconfig.test.json" },
  },
});
