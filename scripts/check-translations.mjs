#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const REFERENCE_LOCALE = 'zh-CN';

function flattenKeys(value, prefix = '', keys = new Set()) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    keys.add(prefix);
    return keys;
  }
  for (const [key, child] of Object.entries(value)) {
    flattenKeys(child, prefix ? `${prefix}.${key}` : key, keys);
  }
  return keys;
}

function readTranslation(filePath) {
  try {
    return flattenKeys(JSON.parse(readFileSync(filePath, 'utf8')));
  } catch (error) {
    throw new Error(`${filePath} is not valid JSON: ${error.message}`);
  }
}

function changedFiles(baseRef, root, staged) {
  if (!baseRef) return [];
  try {
    const diffArgs = staged ? ['diff', '--cached', '--name-only', baseRef] : ['diff', '--name-only', baseRef];
    return execFileSync('git', [...diffArgs, '--', 'public/locales/*/translations.json'], {
      cwd: root,
      encoding: 'utf8',
    })
      .trim()
      .split('\n')
      .filter(Boolean);
  } catch (error) {
    throw new Error(`Unable to inspect translation changes against ${baseRef}: ${error.message}`);
  }
}

function readReferenceKeys(baseRef, relativePath, root) {
  try {
    return flattenKeys(JSON.parse(execFileSync('git', ['show', `${baseRef}:${relativePath}`], { cwd: root, encoding: 'utf8' })));
  } catch (error) {
    if (error.status === 128) return new Set();
    throw new Error(`Unable to read ${relativePath} from ${baseRef}: ${error.message}`);
  }
}

export function runCheck(root = process.cwd(), baseRef, staged = false, repoRoot = process.cwd()) {
  const localesRoot = path.join(root, 'public/locales');
  const errors = [];

  if (!existsSync(localesRoot) || !statSync(localesRoot).isDirectory()) {
    return ['public/locales directory does not exist.'];
  }

  const localeDirs = readdirSync(localesRoot)
    .filter((entry) => statSync(path.join(localesRoot, entry)).isDirectory())
    .sort();

  if (!localeDirs.includes(REFERENCE_LOCALE)) {
    errors.push(`Reference locale "${REFERENCE_LOCALE}" is missing from public/locales.`);
    return errors;
  }

  const referencePath = path.join(localesRoot, REFERENCE_LOCALE, 'translations.json');
  if (!existsSync(referencePath)) {
    errors.push(`${referencePath} is missing.`);
    return errors;
  }

  try {
    readTranslation(referencePath);
  } catch (error) {
    errors.push(error.message);
    return errors;
  }

  const localeKeysByName = new Map();
  for (const locale of localeDirs) {
    const filePath = path.join(localesRoot, locale, 'translations.json');
    if (!existsSync(filePath)) {
      errors.push(`${filePath} is missing.`);
      continue;
    }

    let localeKeys;
    try {
      localeKeys = readTranslation(filePath);
    } catch (error) {
      errors.push(error.message);
      continue;
    }
    localeKeysByName.set(locale, localeKeys);
  }

  if (baseRef) {
    let files;
    try {
      files = changedFiles(baseRef, repoRoot, staged);
    } catch (error) {
      errors.push(error.message);
      return errors;
    }

    for (const relativePath of files) {
      const filePath = path.join(root, relativePath);
      const oldKeys = readReferenceKeys(baseRef, relativePath, repoRoot);
      const newKeys = existsSync(filePath) ? readTranslation(filePath) : new Set();
      const added = [...newKeys].filter((key) => !oldKeys.has(key)).sort();
      const removed = [...oldKeys].filter((key) => !newKeys.has(key)).sort();

      for (const key of added) {
        const missingLocales = localeDirs.filter((name) => !localeKeysByName.get(name)?.has(key));
        if (missingLocales.length > 0) {
          errors.push(
            `${relativePath} added "${key}", but it is missing from: ${missingLocales
              .map((name) => `public/locales/${name}/translations.json`)
              .join(', ')}`
          );
        }
      }
      for (const key of removed) {
        const remainingLocales = localeDirs.filter((name) => localeKeysByName.get(name)?.has(key));
        if (remainingLocales.length > 0) {
          errors.push(
            `${relativePath} removed "${key}", but it is still present in: ${remainingLocales
              .map((name) => `public/locales/${name}/translations.json`)
              .join(', ')}`
          );
        }
      }
    }
  }

  return errors;
}

function main() {
  const rootArg = process.argv.find((arg) => arg.startsWith('--root='));
  const baseRefArg = process.argv.find((arg) => arg.startsWith('--base-ref='));
  const staged = process.argv.includes('--staged');
  const repoRoot = process.cwd();
  const root = rootArg ? path.resolve(rootArg.slice('--root='.length)) : process.cwd();
  const baseRef = baseRefArg?.slice('--base-ref='.length) || resolveDefaultBaseRef(repoRoot);
  const errors = runCheck(root, baseRef, staged, repoRoot);

  if (errors.length > 0) {
    console.error('Translation consistency check failed.');
    for (const error of errors) console.error(`\n${error}`);
    process.exitCode = 1;
    return;
  }
  console.log(`Translation consistency check passed for ${REFERENCE_LOCALE} and all locale files.`);
}

function resolveDefaultBaseRef(root) {
  for (const candidate of ['origin/main', 'HEAD^']) {
    try {
      return execFileSync('git', ['rev-parse', '--verify', candidate], { cwd: root, encoding: 'utf8' }).trim();
    } catch {
      // Try the next available base.
    }
  }
  return undefined;
}

const scriptPath = process.argv[1] && path.resolve(process.argv[1]);
if (scriptPath === path.resolve(fileURLToPath(import.meta.url))) main();
