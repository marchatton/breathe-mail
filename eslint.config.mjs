import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import tailwind from 'eslint-plugin-tailwindcss';

export default [
  {
    ignores: ['.next/**', 'dist/**', 'coverage/**']
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      react,
      'jsx-a11y': jsxA11y,
      tailwindcss: tailwind
    },
    languageOptions: {
      parserOptions: {
        project: true,
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    },
    settings: {
      react: {
        version: 'detect'
      }
    },
    rules: {
      'react/jsx-key': 'error',
      'jsx-a11y/no-autofocus': 'warn',
      'tailwindcss/classnames-order': 'warn'
    }
  }
];
