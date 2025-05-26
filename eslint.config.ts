import type { ESLintConfig } from '@stacksjs/eslint-config'
import stacks from '@stacksjs/eslint-config'

const config: ESLintConfig = stacks({
  stylistic: {
    indent: 2,
    quotes: 'single',
  },

  typescript: true,
  jsonc: true,
  yaml: true,
  ignores: [
    'fixtures/**',
  ],
  rules: {
    'node/prefer-global/process': 'off',
    'import/no-mutable-exports': 'off',
    'symbol-description': 'off',
    'no-console': 'off',
    'ts/no-use-before-define': ['error', { functions: false, variables: false }],
    'unused-imports/no-unused-vars': 'off',
    'eslint-comments/no-unlimited-disable': 'off',
    'ts/consistent-type-imports': 'off',
    'ts/ban-ts-comment': 'off',
  },
})

export default config
