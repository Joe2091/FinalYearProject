import globals from "globals";
import pluginJs from "@eslint/js";
import pluginVue from "eslint-plugin-vue";
import pluginPrettier from "eslint-plugin-prettier";
import vueParser from "vue-eslint-parser";

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  // Ignore common files and folders
  {
    ignores: [
      "node_modules/",
      "dist/",
      "public/",
      "coverage/",
      "*.min.js",
      "vite.config.js",
    ],
  },

  // Main linting config
  {
    files: ["**/*.{js,mjs,cjs,vue}"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true, // Enables Vue JSX if needed
        },
      },
      globals: {
        ...globals.browser,
        chrome: "readonly", // Chrome extension APIs
        globalThis: "readonly",
      },
    },
    plugins: {
      vue: pluginVue,
      prettier: pluginPrettier,
    },
    rules: {
      ...pluginJs.configs.recommended.rules,
      ...pluginVue.configs["flat/recommended"].rules,
      "prettier/prettier": "error",
      "vue/multi-word-component-names": "off",
      "no-console": "warn",
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
];
