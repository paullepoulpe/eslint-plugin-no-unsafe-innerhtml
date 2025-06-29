import noUnsafeInnerhtml from './rules/no-unsafe-innerhtml';

const plugin = {
  rules: {
    'no-unsafe-innerhtml': noUnsafeInnerhtml
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

export = plugin;