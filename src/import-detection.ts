import { Program, Node } from 'estree';
import { isImportDeclaration, isImportSpecifier, isIdentifier } from './type-guards';

/**
 * Checks if a specific import exists in the program
 */
export function hasImport(
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