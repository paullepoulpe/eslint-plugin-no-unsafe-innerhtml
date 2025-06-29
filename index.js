module.exports = {
  rules: {
    'no-unsafe-innerhtml': require('./rules/no-unsafe-innerhtml')
  },
  configs: {
    recommended: {
      plugins: ['no-unsafe-innerhtml'],
      rules: {
        'no-unsafe-innerhtml/no-unsafe-innerhtml': 'error'
      }
    }
  }
};