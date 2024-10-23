import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        module: 'readonly',
      },
    },
  },
  {
    files: [
      '**/node_modules/**',
      '**/build/**',
      '**/husky/**',
      '.github/**',
      '*.config.js',
      '*.config.mjs',
    ],
    rules: { 'no-undef': 'off' },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
];
