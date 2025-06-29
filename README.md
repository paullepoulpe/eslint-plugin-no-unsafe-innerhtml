# eslint-plugin-no-unsafe-innerhtml

An ESLint plugin that flags unsafe `innerHTML` assignments and suggests secure alternatives using the [safevalues](https://github.com/google/safevalues) library.

## Installation

```bash
npm install eslint-plugin-no-unsafe-innerhtml --save-dev
```

## Usage

Add the plugin to your ESLint configuration:

```javascript
module.exports = {
  plugins: ['no-unsafe-innerhtml'],
  rules: {
    'no-unsafe-innerhtml/no-unsafe-innerhtml': 'error'
  }
};
```

Or use the recommended configuration:

```javascript
module.exports = {
  extends: ['plugin:no-unsafe-innerhtml/recommended']
};
```

## Rule Details

This rule flags assignments to `element.innerHTML` as they can introduce XSS vulnerabilities when used with untrusted content.

### Examples

❌ **Incorrect:**

```javascript
element.innerHTML = userInput;
div.innerHTML = "<script>alert(1)</script>";
document.getElementById("test").innerHTML = htmlContent;
```

✅ **Correct:**

```javascript
// For safe HTML content
import {setElementInnerHtml} from 'safevalues/dom';
import {sanitizeHtml} from 'safevalues';

setElementInnerHtml(element, sanitizeHtml(userInput));

// For plain text content
element.textContent = userInput;
```

### Auto-fix Suggestions

The rule provides automatic suggestions to:

1. Replace `innerHTML` assignments with `setElementInnerHtml()` and `sanitizeHtml()` from safevalues
2. Replace with `textContent` for plain text content
3. Automatically add missing imports for safevalues functions

## Dependencies

This plugin works best when used with the [safevalues](https://github.com/google/safevalues) library for XSS protection.

```bash
npm install safevalues
```