export default {
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'commonjs',
    globals: {
      // Browser globals
      window: 'readonly',
      document: 'readonly',
      // Node.js globals
      require: 'readonly',
      module: 'readonly',
      process: 'readonly',
      // Mocha globals
      describe: 'readonly',
      it: 'readonly',
      before: 'readonly',
      after: 'readonly',
      beforeEach: 'readonly',
      afterEach: 'readonly',
      // Other globals
      Atomics: 'readonly',
      SharedArrayBuffer: 'readonly',
    },
  },
  rules: {
    // Possible Errors
    'no-console': 'warn',
    'no-debugger': 'warn',
    'no-duplicate-case': 'error',
    'no-empty': 'error',
    'no-extra-semi': 'error',
    'no-irregular-whitespace': 'error',

    // Best Practices
    'curly': ['error', 'all'],
    'default-case': 'error',
    'dot-notation': 'error',
    'eqeqeq': ['error', 'always'],
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-multi-spaces': 'error',
    'no-unused-expressions': 'error',

    // Variables
    'no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
    'no-use-before-define': 'error',
    'no-underscore-dangle': ['error', { 'allow': ['_messages', '_error', '_warnings'] }],

    // Stylistic Issues
    'array-bracket-spacing': ['error', 'never'],
    'block-spacing': 'error',
    'comma-dangle': ['error', 'always-multiline'],
    'comma-spacing': ['error', { 'before': false, 'after': true }],
    'indent': ['error', 2],
    'key-spacing': ['error', { 'beforeColon': false, 'afterColon': true }],
    'keyword-spacing': ['error', { 'before': true, 'after': true }],
    'max-len': ['error', { 'code': 100, 'ignoreComments': true }],
    'no-mixed-spaces-and-tabs': 'error',
    'no-multiple-empty-lines': ['error', { 'max': 2, 'maxEOF': 1 }],
    'object-curly-spacing': ['error', 'always'],
    'quotes': ['error', 'single', { 'avoidEscape': true }],
    'semi': ['error', 'always'],
    'space-before-blocks': 'error',
    'space-before-function-paren': ['error', {
      'anonymous': 'always',
      'named': 'never',
      'asyncArrow': 'always'
    }],
    'space-infix-ops': 'error',

    // ES6
    'arrow-spacing': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-template': 'error'
  }
};