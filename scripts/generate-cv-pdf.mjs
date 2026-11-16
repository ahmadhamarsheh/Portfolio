#!/usr/bin/env node
/**
 * Prints the /cv/ page of the built site to public/cv/Ahmad-Hamarsheh-CV.pdf.
 *
 *   npm run build && npm run cv:pdf
 *
 * Uses Playwright's Chromium (or CHROME_PATH if set). Serves ./dist with a tiny
 * static server so absolute asset URLs resolve exactly as in production.
 */
import { createServer } from 'node:http';
import { mkdir, readFile, stat, copyFile } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { chromium } from '@playwright/test';

const root = resolve('dist');
const output = resolve('public/cv/Ahmad-Hamarsheh-CV.pdf');
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
};

async function resolveFile(urlPath) {
  const safe = normalize(decodeURIComponent(urlPath)).replace(/^(\.\.[/\\])+/, '');
  let file = join(root, safe);
  if (!file.startsWith(root)) return null;
  try {
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
    return file;
  } catch {
    return null;
  }
}

const server = createServer(async (req, res) => {
  const file = await resolveFile(new URL(req.url ?? '/', 'http://localhost').pathname);
  if (!file) {
    res.writeHead(404).end();
    return;
  }
  try {
    const body = await readFile(file);
    res
      .writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' })
      .end(body);
  } catch {
    res.writeHead(404).end();
  }
});

await new Promise((done) => server.listen(0, '127.0.0.1', done));
const { port } = server.address();

const browser = await chromium.launch(
  process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {},
);
try {
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${port}/cv/`, { waitUntil: 'networkidle' });
  await page.emulateMedia({ media: 'print' });
  await mkdir(resolve('public/cv'), { recursive: true });
  await page.pdf({ path: output, format: 'A4', printBackground: true, preferCSSPageSize: true });
  // Keep the current build in sync too.
  await mkdir(join(root, 'cv'), { recursive: true });
  await copyFile(output, join(root, 'cv', 'Ahmad-Hamarsheh-CV.pdf'));
  console.log(`CV written to ${output}`);
} finally {
  await browser.close();
  server.close();
}
