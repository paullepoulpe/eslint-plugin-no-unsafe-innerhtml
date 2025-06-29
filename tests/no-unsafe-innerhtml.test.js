const { RuleTester } = require('eslint');
const rule = require('../rules/no-unsafe-innerhtml');

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  }
});

ruleTester.run('no-unsafe-innerhtml', rule, {
  valid: [
    // Using textContent is safe
    'element.textContent = userInput;',
    
    // Using safevalues is safe
    'setElementInnerHtml(element, sanitizeHtml(userInput));',
    
    // Other properties are allowed
    'element.outerHTML = content;',
    'element.id = "test";',
    
    // Reading innerHTML is allowed
    'const content = element.innerHTML;'
  ],

  invalid: [
    {
      code: 'element.innerHTML = userInput;',
      errors: [{
        message: 'Unsafe innerHTML assignment. Consider using safevalues library for XSS protection.',
        suggestions: [
          {
            desc: 'Use safevalues setElementInnerHtml() with sanitizeHtml()',
            output: expect.stringContaining('setElementInnerHtml(element, sanitizeHtml(userInput))')
          },
          {
            desc: 'Use textContent for plain text (XSS-safe)',
            output: 'element.textContent = userInput;'
          }
        ]
      }]
    },
    
    {
      code: 'div.innerHTML = "<script>alert(1)</script>";',
      errors: [{
        message: 'Unsafe innerHTML assignment. Consider using safevalues library for XSS protection.',
        suggestions: [
          {
            desc: 'Use safevalues setElementInnerHtml() with sanitizeHtml()',
            output: expect.stringContaining('setElementInnerHtml(div, sanitizeHtml("<script>alert(1)</script>"))')
          },
          {
            desc: 'Use textContent for plain text (XSS-safe)',
            output: 'div.textContent = "<script>alert(1)</script>";'
          }
        ]
      }]
    },
    
    {
      code: 'document.getElementById("test").innerHTML = htmlContent;',
      errors: [{
        message: 'Unsafe innerHTML assignment. Consider using safevalues library for XSS protection.',
        suggestions: [
          {
            desc: 'Use safevalues setElementInnerHtml() with sanitizeHtml()',
            output: expect.stringContaining('setElementInnerHtml(document.getElementById("test"), sanitizeHtml(htmlContent))')
          },
          {
            desc: 'Use textContent for plain text (XSS-safe)',
            output: 'document.getElementById("test").textContent = htmlContent;'
          }
        ]
      }]
    }
  ]
});