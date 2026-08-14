#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const [repoRoot, destination] = process.argv.slice(2);
if (!repoRoot || !destination) {
  console.error('Usage: git-staged-snapshot.mjs <repoRoot> <destination>');
  process.exit(1);
}

mkdirSync(destination, { recursive: true });
const prefix = destination.endsWith(path.sep) ? destination : `${destination}${path.sep}`;
execFileSync('git', ['checkout-index', '-a', '-f', `--prefix=${prefix}`], {
  cwd: repoRoot,
  stdio: 'inherit',
});
