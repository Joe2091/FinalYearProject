import globals from "globals";
import pluginJs from "@eslint/js";
import pluginPrettier from "eslint-plugin-prettier";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: globals.node,
    },
    plugins: { prettier: pluginPrettier },
    rules: {
      ...pluginJs.configs.recommended.rules,
      "prettier/prettier": "error",
    },
  },
];
