module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [],
  plugins: [
    '@typescript-eslint',
    'no-unsafe-innerhtml'
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  rules: {
    'no-unsafe-innerhtml/no-unsafe-innerhtml': 'error',
    // Disable some TypeScript rules for the test examples
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-explicit-any': 'off'
  },
  env: {
    browser: true,
    es6: true,
    node: true
  }
};