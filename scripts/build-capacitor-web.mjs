import { cp, mkdir, rm, stat } from 'node:fs/promises';
import path from 'node:path';

const repoRoot = process.cwd();
const outDir = path.join(repoRoot, 'web');

const pathsToCopy = [
  'index.html',
  'styles.css',
  'src',
  'assets',
  'github-leaderboard.js',
  'LeaderboardManager.js',
  'debug-metrics.js',
  'move_modals.js',
  'leaderboard.json'
];

async function exists(p) {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

for (const relativePath of pathsToCopy) {
  const from = path.join(repoRoot, relativePath);
  if (!(await exists(from))) continue;
  const to = path.join(outDir, relativePath);
  await mkdir(path.dirname(to), { recursive: true });
  await cp(from, to, { recursive: true });
}

console.log(`Capacitor web assets built in: ${outDir}`);

