import { Rule, SourceCode } from 'eslint';
import {
  Node,
  AssignmentExpression,
  MemberExpression,
  Program,
  ImportDeclaration,
  ImportSpecifier,
  Identifier,
} from 'estree';

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow unsafe innerHTML assignments and suggest safevalues alternatives',
      category: 'Security',
      recommended: true,
    },
    fixable: 'code',
    hasSuggestions: true,
    schema: [],
  },

  create(context: Rule.RuleContext): Rule.RuleListener {
    return {
      AssignmentExpression(node: AssignmentExpression): void {
        if (
          node.operator === '=' &&
          node.left.type === 'MemberExpression' &&
          node.left.property.type === 'Identifier' &&
          node.left.property.name === 'innerHTML'
        ) {
          const sourceCode = context.sourceCode;
          const rightText = sourceCode.getText(node.right);

          context.report({
            node,
            message:
              'Unsafe innerHTML assignment. Consider using safevalues library for XSS protection.',
            suggest: getSuggestions(node, rightText, sourceCode),
          });
        }
      },
    };
  },
};

export default rule;

function isIdentifier(node: Node): node is Identifier {
  return node.type === 'Identifier';
}

function getSuggestions(
  node: AssignmentExpression,
  rightText: string,
  sourceCode: SourceCode
): Rule.SuggestionReportDescriptor[] {
  const suggestions: Rule.SuggestionReportDescriptor[] = [];
  const leftText = sourceCode.getText((node.left as MemberExpression).object);
  const program = sourceCode.ast as Program;

  // Check if safevalues imports already exist
  const hasSetElementImport = hasImport(
    program,
    'safevalues/dom',
    'setElementInnerHtml'
  );
  const hasSanitizeImport = hasImport(program, 'safevalues', 'sanitizeHtml');

  // Main suggestion: Use setElementInnerHtml with sanitizeHtml
  suggestions.push({
    desc: 'Use safevalues setElementInnerHtml() with sanitizeHtml()',
    fix: function (fixer: Rule.RuleFixer): Rule.Fix[] {
      const fixes: Rule.Fix[] = [];

      // Add imports if missing
      if (!hasSetElementImport) {
        fixes.push(
          fixer.insertTextAfterRange(
            [0, 0],
            "import {setElementInnerHtml} from 'safevalues/dom';\n"
          )
        );
      }
      if (!hasSanitizeImport) {
        fixes.push(
          fixer.insertTextAfterRange(
            [0, 0],
            "import {sanitizeHtml} from 'safevalues';\n"
          )
        );
      }

      // Replace the assignment
      fixes.push(
        fixer.replaceText(
          node,
          `setElementInnerHtml(${leftText}, sanitizeHtml(${rightText}))`
        )
      );

      return fixes;
    },
  });

  // Alternative suggestion for plain text
  suggestions.push({
    desc: 'Use textContent for plain text (XSS-safe)',
    fix: function (fixer: Rule.RuleFixer): Rule.Fix {
      return fixer.replaceText(node, `${leftText}.textContent = ${rightText}`);
    },
  });

  return suggestions;
}

function hasImport(
  program: Program,
  moduleName: string,
  importName: string
): boolean {
  return program.body.some((node: Node) => {
    if (node.type !== 'ImportDeclaration' || node.source.value !== moduleName) {
      return false;
    }

    return (node as ImportDeclaration).specifiers.some((spec) => {
      if (spec.type === 'ImportSpecifier') {
        const imported = (spec as ImportSpecifier).imported;
        return isIdentifier(imported) && imported.name === importName;
      }
      return false;
    });
  });
}
