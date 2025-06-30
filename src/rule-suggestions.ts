import { Rule } from 'eslint';
import { AssignmentExpression, Expression, Super, Program } from 'estree';
import { hasImport } from './import-detection';

/**
 * Generates fix suggestions for unsafe innerHTML assignments
 */
export function getSuggestions(
  node: AssignmentExpression,
  element: Expression | Super,
  value: Expression,
  context: Rule.RuleContext
): Rule.SuggestionReportDescriptor[] {
  const suggestions: Rule.SuggestionReportDescriptor[] = [];
  const sourceCode = context.sourceCode;

  const elText = context.sourceCode.getText(element);
  const valueText = context.sourceCode.getText(value);
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
          `setElementInnerHtml(${elText}, sanitizeHtml(${valueText}))`
        )
      );

      return fixes;
    },
  });

  // Alternative suggestion for plain text
  suggestions.push({
    desc: 'Use textContent for plain text (XSS-safe)',
    fix: function (fixer: Rule.RuleFixer): Rule.Fix {
      return fixer.replaceText(node, `${elText}.textContent = ${valueText}`);
    },
  });

  return suggestions;
}