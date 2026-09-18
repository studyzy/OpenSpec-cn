#!/usr/bin/env node

import { execFileSync } from 'child_process';
import { existsSync, rmSync } from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const runTsc = (args = []) => {
  const tscPath = require.resolve('typescript/bin/tsc');
  execFileSync(process.execPath, [tscPath, ...args], { stdio: 'inherit' });
};

console.log('🔨 Building OpenSpec...\n');

// Clean dist directory
if (existsSync('dist')) {
  console.log('Cleaning dist directory...');
  // `maxRetries`/`retryDelay` cover a transient ENOTEMPTY on macOS: the
  // directory entries of a just-removed tree can linger briefly, which is the
  // common case when two builds run back to back (e.g. `make install` runs
  // `pnpm install`, whose `prepare` script builds, and then `pnpm run build`).
  rmSync('dist', { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
}

// Run TypeScript compiler (use local version explicitly)
console.log('Compiling TypeScript...');
try {
  runTsc(['--version']);
  runTsc();
  console.log('\n✅ Build completed successfully!');
} catch (error) {
  console.error('\n❌ Build failed!');
  process.exit(1);
}
