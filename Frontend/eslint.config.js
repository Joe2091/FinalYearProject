import globals from "globals";
import pluginVue from "eslint-plugin-vue";
import pluginPrettier from "eslint-plugin-prettier";

export default [
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
  // Main linting configuration
  {
    files: ["**/*.{js,vue}"],
    languageOptions: {
      parser: require("vue-eslint-parser"),
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    globals: {
      ...globals.browser,
      chrome: "readonly", // Allow Chrome extension APIs
      globalThis: "readonly",
    },
    plugins: {
      vue: pluginVue,
      prettier: pluginPrettier,
    },
    rules: {
      ...pluginVue.configs["flat/recommended"].rules,
      "prettier/prettier": "warn",
      "vue/multi-word-component-names": "off",
      "no-console": "off",
      "vue/require-default-prop": "off",
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "vue/no-v-html": "off",
    },
  },
];
