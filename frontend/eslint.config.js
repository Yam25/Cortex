import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores([
    // build & deps (incl. hoisted workspace node_modules at repo root)
    'dist/**',
    'build/**',
    '**/node_modules/**',
    '../node_modules/**',
    // tooling caches
    '.vite/**',
    'coverage/**',
    // docs (MDX — Prettier only; not app source)
    'docs/**',
    // static assets
    'public/**',
  ]),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
])
