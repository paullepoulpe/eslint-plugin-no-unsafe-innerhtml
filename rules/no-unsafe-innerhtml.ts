import { Rule } from 'eslint';
import * as ts from 'typescript';
import {
  Node,
  AssignmentExpression,
  MemberExpression,
  Program,
  ImportDeclaration,
  ImportSpecifier,
  Identifier,
  Expression,
  Super,
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
    // Set up TypeScript services once for the entire rule
    const parserServices =
      context.sourceCode.parserServices || context.parserServices;
    const checker = parserServices?.program?.getTypeChecker();
    const tsNodeMap = parserServices?.esTreeNodeToTSNodeMap;
    const elementType = checker
      ? resolveTypeFromName(checker, 'Element')
      : null;

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
          const tsObject = tsNodeMap?.get(element);

          if (tsObject) {
            const type = checker.getTypeAtLocation(tsObject);

            if (!checker.isTypeAssignableTo(elementType, type)) {
              // Not an Element type, skip reporting
              return;
            }
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

function isIdentifier(node: Node): node is Identifier {
  return node.type === 'Identifier';
}

function isMemberExpression(node: Node): node is MemberExpression {
  return node.type === 'MemberExpression';
}

function isImportDeclaration(node: Node): node is ImportDeclaration {
  return node.type === 'ImportDeclaration';
}

function isImportSpecifier(node: Node): node is ImportSpecifier {
  return node.type === 'ImportSpecifier';
}

function getSuggestions(
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

function hasImport(
  program: Program,
  moduleName: string,
  importName: string
): boolean {
  return program.body.some((node: Node) => {
    if (!isImportDeclaration(node) || node.source.value !== moduleName) {
      return false;
    }

    return node.specifiers.some((spec) => {
      if (isImportSpecifier(spec)) {
        const imported = spec.imported;
        return isIdentifier(imported) && imported.name === importName;
      }
      return false;
    });
  });
}

/** Resolves a TypeScript type from its name (e.g., "HTMLElement", "Element") */
function resolveTypeFromName(
  checker: ts.TypeChecker,
  typeName: string
): ts.Type {
  const symbol = checker.resolveName(
    typeName,
    undefined,
    ts.SymbolFlags.Type,
    false
  );
  if (!symbol) {
    throw new Error(`Type "${typeName}" not found in TypeScript checker.`);
  }

  const symbolType = checker.getTypeOfSymbol(symbol);

  // For DOM types, the symbol often represents the constructor
  // Try to get the instance type from the constructor's return type
  const constructSignatures = symbolType.getConstructSignatures();
  if (constructSignatures.length > 0) {
    return constructSignatures[0].getReturnType();
  }

  // If no construct signatures, return the type as-is
  return symbolType;
}
