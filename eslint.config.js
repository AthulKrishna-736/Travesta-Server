import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import unusedImports from "eslint-plugin-unused-imports";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{ts,js}"],
    ignores: ["dist/**", "node_modules/**"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        sourceType: "module",
        project: "./tsconfig.json",
      },
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      "unused-imports": unusedImports,
    },
    rules: {
      // Base recommended rules
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,

      // Disable built-in no-unused-vars (conflicts with unused-imports)
      "@typescript-eslint/no-unused-vars": "off",
      "no-unused-vars": "off",

      // Unused imports and vars
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_", // Ignore vars starting with "_"
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],

      // Optional but helpful backend rules
      "no-console": "off", // You often use console in backend
      "no-undef": "off", // Handled by TypeScript
      "prefer-const": "warn",
    },
  },
]);
