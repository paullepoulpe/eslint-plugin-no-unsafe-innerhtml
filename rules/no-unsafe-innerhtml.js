module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow unsafe innerHTML assignments and suggest safevalues alternatives',
      category: 'Security',
      recommended: true
    },
    fixable: 'code',
    hasSuggestions: true,
    schema: []
  },

  create(context) {
    return {
      AssignmentExpression(node) {
        if (
          node.operator === '=' &&
          node.left.type === 'MemberExpression' &&
          node.left.property.type === 'Identifier' &&
          node.left.property.name === 'innerHTML'
        ) {
          const sourceCode = context.getSourceCode();
          const rightText = sourceCode.getText(node.right);
          
          context.report({
            node,
            message: 'Unsafe innerHTML assignment. Consider using safevalues library for XSS protection.',
            suggest: getSuggestions(node, rightText, sourceCode)
          });
        }
      }
    };
  }
};

function getSuggestions(node, rightText, sourceCode) {
  const suggestions = [];
  const leftText = sourceCode.getText(node.left.object);
  const program = sourceCode.ast;
  
  // Check if safevalues imports already exist
  const hasSetElementImport = hasImport(program, 'safevalues/dom', 'setElementInnerHtml');
  const hasSanitizeImport = hasImport(program, 'safevalues', 'sanitizeHtml');
  
  // Main suggestion: Use setElementInnerHtml with sanitizeHtml
  suggestions.push({
    desc: 'Use safevalues setElementInnerHtml() with sanitizeHtml()',
    fix: function(fixer) {
      const fixes = [];
      
      // Add imports if missing
      if (!hasSetElementImport) {
        fixes.push(fixer.insertTextAfterRange([0, 0], "import {setElementInnerHtml} from 'safevalues/dom';\n"));
      }
      if (!hasSanitizeImport) {
        fixes.push(fixer.insertTextAfterRange([0, 0], "import {sanitizeHtml} from 'safevalues';\n"));
      }
      
      // Replace the assignment
      fixes.push(fixer.replaceText(node, `setElementInnerHtml(${leftText}, sanitizeHtml(${rightText}))`));
      
      return fixes;
    }
  });
  
  // Alternative suggestion for plain text
  suggestions.push({
    desc: 'Use textContent for plain text (XSS-safe)',
    fix: function(fixer) {
      return fixer.replaceText(node, `${leftText}.textContent = ${rightText}`);
    }
  });

  return suggestions;
}

function hasImport(program, moduleName, importName) {
  return program.body.some(node => {
    if (node.type !== 'ImportDeclaration' || node.source.value !== moduleName) {
      return false;
    }
    
    return node.specifiers.some(spec => {
      return spec.type === 'ImportSpecifier' && 
             spec.imported.name === importName;
    });
  });
}