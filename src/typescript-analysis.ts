import * as ts from 'typescript';
import { Rule } from 'eslint';
import { Expression, Super } from 'estree';

/**
 * Interface for TypeScript parser services
 */
export interface TypeScriptServices {
  checker: ts.TypeChecker;
  tsNodeMap: Map<any, ts.Node>;
  elementType: ts.Type;
}

/**
 * Sets up TypeScript services from ESLint context
 */
export function setupTypeScriptServices(
  context: Rule.RuleContext
): TypeScriptServices | null {
  const parserServices =
    context.sourceCode.parserServices || context.parserServices;
  const checker = parserServices?.program?.getTypeChecker();
  const tsNodeMap = parserServices?.esTreeNodeToTSNodeMap;

  if (!checker || !tsNodeMap) {
    return null;
  }

  const elementType = resolveTypeFromName(checker, 'Element');

  return {
    checker,
    tsNodeMap,
    elementType,
  };
}

/**
 * Checks if an expression is assignable to a DOM Element type
 */
export function isElementType(
  services: TypeScriptServices,
  element: Expression | Super
): boolean {
  const { checker, tsNodeMap, elementType } = services;

  const tsNode = tsNodeMap.get(element);
  if (!tsNode) {
    return true; // Assume is element type if no TypeScript node is found
  }

  const type = checker.getTypeAtLocation(tsNode);
  return checker.isTypeAssignableTo(type, elementType);
}

/**
 * Resolves a TypeScript type from its name (e.g., "HTMLElement", "Element")
 * Handles the case where the symbol might represent a constructor rather than an instance type
 */
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
