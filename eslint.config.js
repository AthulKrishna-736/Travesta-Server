import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import unusedImports from "eslint-plugin-unused-imports";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,ts}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        sourceType: "module",
      },
      globals: globals.node,
    },
    plugins: {
      js,
      "@typescript-eslint": tseslint.plugin,
      "unused-imports": unusedImports,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "warn",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
    }

  },
]);
