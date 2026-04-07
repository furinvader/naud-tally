#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import ts from 'typescript';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(scriptDirectory, '..');
const appRoot = path.join(frontendRoot, 'src', 'app');

const boundaryExceptions = new Set([
  // Add a temporary exception only when a migration task requires it.
  // Format:
  // 'src/app/features/source/path.ts -> src/app/features/target/internal-file.ts'
  // Every exception should include a nearby comment with the task that will remove it.
]);

const violations = [];

for (const filePath of collectTypeScriptFiles(appRoot)) {
  const sourceText = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
  );

  checkSourceFile(sourceFile, filePath);
}

if (violations.length > 0) {
  console.error('Import boundary violations found:');

  for (const violation of violations) {
    console.error('');
    console.error(
      `- ${violation.source}:${violation.line}:${violation.column}`,
    );
    console.error(`  import: ${violation.specifier}`);
    console.error(`  resolved: ${violation.target}`);
    console.error(`  reason: ${violation.reason}`);
    console.error(`  fix: ${violation.fix}`);
  }

  process.exit(1);
}

console.log(
  `Import boundary checks passed for ${collectTypeScriptFiles(appRoot).length} TypeScript files.`,
);

function checkSourceFile(sourceFile, filePath) {
  const sourceMetadata = classifyAppFile(filePath);

  visit(sourceFile);

  function visit(node) {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      const specifier = node.moduleSpecifier.text;
      checkSpecifier(specifier, node.moduleSpecifier);
    }

    if (
      ts.isImportTypeNode(node) &&
      ts.isLiteralTypeNode(node.argument) &&
      ts.isStringLiteral(node.argument.literal)
    ) {
      checkSpecifier(node.argument.literal.text, node.argument.literal);
    }

    ts.forEachChild(node, visit);
  }

  function checkSpecifier(specifier, moduleSpecifierNode) {
    if (!specifier.startsWith('.')) {
      return;
    }

    const resolvedTarget = resolveRelativeImport(filePath, specifier);

    if (!resolvedTarget || !isWithinDirectory(appRoot, resolvedTarget)) {
      return;
    }

    const targetMetadata = classifyAppFile(resolvedTarget);
    const exceptionKey = `${toRepoPath(filePath)} -> ${toRepoPath(
      resolvedTarget,
    )}`;

    if (boundaryExceptions.has(exceptionKey)) {
      return;
    }

    const violation = validateBoundary(
      sourceMetadata,
      targetMetadata,
      specifier,
      resolvedTarget,
    );

    if (!violation) {
      return;
    }

    const position = sourceFile.getLineAndCharacterOfPosition(
      moduleSpecifierNode.getStart(sourceFile),
    );

    violations.push({
      source: toRepoPath(filePath),
      target: toRepoPath(resolvedTarget),
      specifier,
      line: position.line + 1,
      column: position.character + 1,
      ...violation,
    });
  }
}

function validateBoundary(source, target, specifier, resolvedTarget) {
  if (source.kind === 'feature') {
    return validateFeatureImport(source, target, specifier, resolvedTarget);
  }

  if (source.kind === 'ui') {
    if (target.kind === 'feature') {
      return {
        reason:
          'Shared UI must stay feature-agnostic and cannot import feature-owned business code.',
        fix: 'Pass feature data in through inputs or move the shared contract into ui/ or core/.',
      };
    }

    if (target.kind === 'app') {
      return {
        reason: 'Shared UI must not depend on app-shell wiring files.',
        fix: 'Move the shared contract into ui/ or core/ instead of importing from src/app root.',
      };
    }

    return null;
  }

  if (source.kind === 'core') {
    if (target.kind === 'feature') {
      return {
        reason: 'Core helpers must not depend on feature-owned business code.',
        fix: 'Invert the dependency or move the shared logic behind the owning feature public API.',
      };
    }

    if (target.kind === 'app') {
      return {
        reason: 'Core helpers must not depend on app-shell wiring files.',
        fix: 'Move the shared contract into core/ or keep it in the app shell.',
      };
    }

    return null;
  }

  if (source.kind === 'app') {
    if (target.kind === 'feature' && !target.isPublicApi) {
      return {
        reason:
          'App-shell files may import features only through their top-level public entrypoint.',
        fix: `Import the feature root instead, such as ${suggestFeatureEntrypoint(
          resolvedTarget,
        )}.`,
      };
    }

    return null;
  }

  return null;
}

function validateFeatureImport(source, target, specifier, resolvedTarget) {
  if (target.kind === 'feature') {
    if (source.featureName === target.featureName) {
      return null;
    }

    if (target.isPublicApi) {
      return null;
    }

    return {
      reason:
        'Cross-feature imports must go through the target feature public entrypoint, not an internal file.',
      fix: `Import the feature root instead, such as ${suggestFeatureEntrypoint(
        resolvedTarget,
      )}.`,
    };
  }

  if (target.kind === 'app') {
    return {
      reason: 'Feature files must not depend on app-shell wiring files.',
      fix: 'Move shared code into ui/, core/, or the owning feature public API before importing it.',
    };
  }

  return null;
}

function collectTypeScriptFiles(directoryPath) {
  const files = [];

  for (const entry of fs.readdirSync(directoryPath, { withFileTypes: true })) {
    const fullPath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      files.push(...collectTypeScriptFiles(fullPath));
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    if (entry.name.endsWith('.d.ts') || !entry.name.endsWith('.ts')) {
      continue;
    }

    files.push(fullPath);
  }

  return files.sort();
}

function resolveRelativeImport(sourcePath, specifier) {
  const candidateBase = path.resolve(path.dirname(sourcePath), specifier);
  const candidates = [
    candidateBase,
    `${candidateBase}.ts`,
    path.join(candidateBase, 'index.ts'),
  ];

  for (const candidatePath of candidates) {
    if (fs.existsSync(candidatePath) && fs.statSync(candidatePath).isFile()) {
      return candidatePath;
    }
  }

  return null;
}

function classifyAppFile(filePath) {
  const pathSegments = path.relative(appRoot, filePath).split(path.sep);

  if (pathSegments[0] === 'features' && pathSegments.length >= 2) {
    return {
      kind: 'feature',
      featureName: pathSegments[1],
      isPublicApi:
        pathSegments.length === 3 && pathSegments[2] === 'index.ts',
    };
  }

  if (pathSegments[0] === 'ui') {
    return { kind: 'ui' };
  }

  if (pathSegments[0] === 'core') {
    return { kind: 'core' };
  }

  return { kind: 'app' };
}

function suggestFeatureEntrypoint(resolvedTarget) {
  const segments = path.relative(appRoot, resolvedTarget).split(path.sep);

  if (segments[0] !== 'features' || segments.length < 2) {
    return 'the feature root entrypoint';
  }

  return `'../${segments[1]}'`;
}

function isWithinDirectory(parentPath, childPath) {
  const relativePath = path.relative(parentPath, childPath);
  return relativePath !== '..' && !relativePath.startsWith(`..${path.sep}`);
}

function toRepoPath(filePath) {
  return path.relative(frontendRoot, filePath).split(path.sep).join('/');
}
