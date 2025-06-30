import {
  Node,
  Identifier,
  MemberExpression,
  ImportDeclaration,
  ImportSpecifier,
} from 'estree';

/**
 * Type guard to check if a node is an Identifier
 */
export function isIdentifier(node: Node): node is Identifier {
  return node.type === 'Identifier';
}

/**
 * Type guard to check if a node is a MemberExpression
 */
export function isMemberExpression(node: Node): node is MemberExpression {
  return node.type === 'MemberExpression';
}

/**
 * Type guard to check if a node is an ImportDeclaration
 */
export function isImportDeclaration(node: Node): node is ImportDeclaration {
  return node.type === 'ImportDeclaration';
}

/**
 * Type guard to check if a node is an ImportSpecifier
 */
export function isImportSpecifier(node: Node): node is ImportSpecifier {
  return node.type === 'ImportSpecifier';
}