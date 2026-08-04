#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const REFERENCE_LOCALE = 'en-US';

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

function diffKeys(referenceKeys, localeKeys) {
  return {
    missing: [...referenceKeys].filter((key) => !localeKeys.has(key)).sort(),
    extra: [...localeKeys].filter((key) => !referenceKeys.has(key)).sort(),
  };
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
      const locale = relativePath.split('/')[2];
      if (locale === REFERENCE_LOCALE) continue;

      const filePath = path.join(root, relativePath);
      const newKeys = existsSync(filePath) ? readTranslation(filePath) : new Set();
      const referenceKeys = localeKeysByName.get(REFERENCE_LOCALE);
      if (!referenceKeys) continue;
      const { missing, extra } = diffKeys(referenceKeys, newKeys);

      if (missing.length > 0) {
        errors.push(`${relativePath} is missing ${missing.length} key(s) from ${REFERENCE_LOCALE}:\n  ${missing.join('\n  ')}`);
      }
      if (extra.length > 0) {
        errors.push(`${relativePath} has ${extra.length} key(s) not present in ${REFERENCE_LOCALE}:\n  ${extra.join('\n  ')}`);
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
