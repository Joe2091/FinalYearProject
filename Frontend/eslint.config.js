import globals from 'globals';
import pluginVue from 'eslint-plugin-vue';
import pluginPrettier from 'eslint-plugin-prettier';
import vueParser from 'vue-eslint-parser';

export default [
  {
    ignores: [
      'node_modules/',
      'dist/',
      'dist-web/',
      'public/',
      'coverage/',
      '*.min.js',
      'vite.config.js',
    ],
  },
  {
    files: ['**/*.{js,vue}'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
        chrome: 'readonly',
        globalThis: 'readonly',
      },
    },
    plugins: {
      vue: pluginVue,
      prettier: pluginPrettier,
    },
    rules: {
      ...pluginVue.configs['flat/recommended'].rules,

      'vue/multi-word-component-names': 'off',
      'no-console': 'off',
      'vue/require-default-prop': 'off',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'vue/no-v-html': 'off',
    },
  },
];
