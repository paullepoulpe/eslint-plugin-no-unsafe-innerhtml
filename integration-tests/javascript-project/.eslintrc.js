module.exports = {
  plugins: ['no-unsafe-innerhtml'],
  rules: {
    'no-unsafe-innerhtml/no-unsafe-innerhtml': 'error'
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  env: {
    browser: true,
    es6: true,
    node: true
  }
};