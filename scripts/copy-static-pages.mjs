import { cp, mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');

const ignoredDirs = new Set([
  '.astro',
  '.git',
  'dist',
  'node_modules',
  'public',
  'scripts',
  'src',
  'studio',
  'Swift7 Design System',
]);

const ignoredFiles = new Set([
  'index.html',
  'portfolio.html',
  'faq.html',
  'astro.config.mjs',
  'package.json',
  'package-lock.json',
  'sanity.cli.ts',
  'sanity.config.ts',
  'tsconfig.json',
]);

const copiedExtensions = new Set([
  '.html',
  '.css',
  '.js',
  '.json',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.svg',
  '.ico',
  '.txt',
  '.xml',
  '.webmanifest',
]);

const astroOwnedRoots = new Set(['case-studies', 'services']);
const redirects = new Set();

async function copyTree(from, relative = '') {
  const entries = await readdir(from, { withFileTypes: true });

  for (const entry of entries) {
    const rel = path.join(relative, entry.name);
    const source = path.join(from, entry.name);
    const target = path.join(dist, rel);

    if (entry.isDirectory()) {
      if (ignoredDirs.has(entry.name)) continue;
      if (astroOwnedRoots.has(rel)) continue;
      await copyTree(source, rel);
      continue;
    }

    if (!entry.isFile()) continue;
    if (!copiedExtensions.has(path.extname(entry.name).toLowerCase())) continue;
    if (!relative && ignoredFiles.has(entry.name)) continue;

    await mkdir(path.dirname(target), { recursive: true });
    await cp(source, target, { force: false });

    if (path.extname(entry.name).toLowerCase() === '.html' && entry.name !== 'index.html') {
      const cleanPath = `/${rel.replace(/\\/g, '/').replace(/\.html$/, '')}`;
      const htmlPath = `/${rel.replace(/\\/g, '/')}`;
      redirects.add(`${cleanPath} ${htmlPath} 200`);
    }
  }
}

await stat(dist);
await copyTree(root);
if (redirects.size) {
  await writeFile(path.join(dist, '_redirects'), `${Array.from(redirects).sort().join('\n')}\n`);
}
console.log('Copied legacy static pages and assets into dist without overwriting Astro-owned routes.');
