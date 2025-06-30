import { Rule } from 'eslint';
import { AssignmentExpression } from 'estree';
import { isIdentifier, isMemberExpression } from './type-guards';
import { setupTypeScriptServices, isElementType } from './typescript-analysis';
import { getSuggestions } from './rule-suggestions';

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
    // Set up TypeScript services once for the entire rule
    const tsServices = setupTypeScriptServices(context);

    return {
      AssignmentExpression(node: AssignmentExpression): void {
        if (
          node.operator === '=' &&
          isMemberExpression(node.left) &&
          isIdentifier(node.left.property) &&
          node.left.property.name === 'innerHTML'
        ) {
          const element = node.left.object;
          const value = node.right;

          // Use TypeScript type checking if available
          if (tsServices && !isElementType(tsServices, element)) {
            // Not an Element type, skip reporting
            return;
          }

          context.report({
            node,
            message:
              'Unsafe innerHTML assignment. Consider using safevalues library for XSS protection.',
            suggest: getSuggestions(node, element, value, context),
          });
        }
      },
    };
  },
};

export default rule;
