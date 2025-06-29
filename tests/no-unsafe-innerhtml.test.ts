import { RuleTester } from 'eslint';
import rule from '../rules/no-unsafe-innerhtml';

function dedent(str: string): string {
  const lines = str.split('\n');
  
  // Remove leading and trailing empty lines
  while (lines.length > 0 && lines[0].trim() === '') {
    lines.shift();
  }
  while (lines.length > 0 && lines[lines.length - 1].trim() === '') {
    lines.pop();
  }
  
  if (lines.length === 0) return '';
  
  // Find minimum indentation (ignoring empty lines)
  const minIndent = lines
    .filter(line => line.trim() !== '')
    .reduce((min, line) => {
      const indent = line.match(/^\s*/)?.[0].length || 0;
      return Math.min(min, indent);
    }, Infinity);
  
  // Remove common indentation
  return lines
    .map(line => line.slice(minIndent))
    .join('\n');
}

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
            output: dedent(`
              import {setElementInnerHtml} from 'safevalues/dom';
              import {sanitizeHtml} from 'safevalues';
              setElementInnerHtml(element, sanitizeHtml(userInput));
            `)
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
            output: dedent(`
              import {setElementInnerHtml} from 'safevalues/dom';
              import {sanitizeHtml} from 'safevalues';
              setElementInnerHtml(div, sanitizeHtml("<script>alert(1)</script>"));
            `)
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
            output: dedent(`
              import {setElementInnerHtml} from 'safevalues/dom';
              import {sanitizeHtml} from 'safevalues';
              setElementInnerHtml(document.getElementById("test"), sanitizeHtml(htmlContent));
            `)
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