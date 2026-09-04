import path from 'node:path';
import {
  Node,
  Project,
  SyntaxKind,
  type ArrowFunction,
  type FunctionDeclaration,
  type FunctionExpression,
  type SourceFile,
} from 'ts-morph';
import { fileIdFromSrcPath, functionId, isIgnored, toPosix } from './paths.js';

export interface CodeFunction {
  id: string;
  fileId: string;
  name: string;
  calls: string[];
}

export interface CodePass {
  files: Record<string, CodeFunction[]>;
}

type FunctionBody = FunctionDeclaration | ArrowFunction | FunctionExpression;

/** Collect the exported functions of one file, keyed by their declared name. */
function exportedFunctions(source: SourceFile): Map<string, FunctionBody> {
  const found = new Map<string, FunctionBody>();
  for (const [name, declarations] of source.getExportedDeclarations()) {
    for (const declaration of declarations) {
      if (declaration.getSourceFile() !== source) continue;
      if (Node.isFunctionDeclaration(declaration)) {
        found.set(name, declaration);
      } else if (Node.isVariableDeclaration(declaration)) {
        const initializer = declaration.getInitializer();
        if (Node.isArrowFunction(initializer) || Node.isFunctionExpression(initializer)) {
          found.set(name, initializer);
        }
      }
    }
  }
  return found;
}

export async function parseCode(srcDir: string, ignoreGlobs: string[]): Promise<CodePass> {
  const project = new Project({
    compilerOptions: { allowJs: false, skipLibCheck: true },
    useInMemoryFileSystem: false,
    skipAddingFilesFromTsConfig: true,
  });
  project.addSourceFilesAtPaths(`${toPosix(srcDir)}/**/*.ts`);

  const idOf = (source: SourceFile): string =>
    fileIdFromSrcPath(path.relative(srcDir, source.getFilePath()));

  const included = project
    .getSourceFiles()
    .filter((source) => !isIgnored(path.relative(srcDir, source.getFilePath()), ignoreGlobs));

  // Map every exported function declaration node to its id, so a call can resolve to it.
  const idByDeclaration = new Map<FunctionBody, string>();
  for (const source of included) {
    const fileId = idOf(source);
    for (const [name, declaration] of exportedFunctions(source)) {
      idByDeclaration.set(declaration, functionId(fileId, name));
    }
  }

  const files: Record<string, CodeFunction[]> = {};
  for (const source of included) {
    const fileId = idOf(source);
    const functions: CodeFunction[] = [];

    for (const [name, declaration] of exportedFunctions(source)) {
      const calls = new Set<string>();
      for (const call of declaration.getDescendantsOfKind(SyntaxKind.CallExpression)) {
        const callee = call.getExpression();
        // A property access such as deps.repo.save is a method call, not a graph edge.
        if (!Node.isIdentifier(callee)) continue;
        for (const definition of callee.getDefinitionNodes()) {
          let target: Node | undefined = definition;
          if (Node.isVariableDeclaration(definition)) {
            target = definition.getInitializer();
          }
          const id = target ? idByDeclaration.get(target as FunctionBody) : undefined;
          if (id) calls.add(id);
        }
      }
      functions.push({ id: functionId(fileId, name), fileId, name, calls: [...calls].sort() });
    }

    files[fileId] = functions;
  }

  return { files };
}
