import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
export default defineConfig(
  {
    ignores: [
      "**/dist/**",
      "**/drizzle/**",
      "**/.wrangler/**",
      "**/*.config.*",
    ],
  },
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: ["packages/*/tsconfig.test.json", "apps/*/tsconfig.test.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-argument": "error",
      "@typescript-eslint/no-floating-promises": "error",
      // 非同期のインターフェースを同期の実装で満たす場合があるため外す
      "@typescript-eslint/require-await": "off",
    },
  },
);
