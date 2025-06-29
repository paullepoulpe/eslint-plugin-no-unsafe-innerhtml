module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module'
  },
  plugins: ['no-unsafe-innerhtml'],
  rules: {
    'no-unsafe-innerhtml/no-unsafe-innerhtml': 'error'
  }
};