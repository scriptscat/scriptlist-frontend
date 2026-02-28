import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import tseslint from 'typescript-eslint';

const eslintConfig = [
  {
    ignores: ['node_modules/**', '.next/**', 'out/**', 'public/**'],
  },
  ...nextCoreWebVitals,
  prettierConfig,
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      prettier: prettierPlugin,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/consistent-type-imports': 'error',
      'prettier/prettier': 'error',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    rules: {
      'react-hooks/exhaustive-deps': 'off',
      'react/jsx-no-literals': 'warn',
    },
  },
];

export default eslintConfig;
