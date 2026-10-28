import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, access} from 'node:fs/promises';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = path => readFile(resolve(root, path), 'utf8');

test('all local HTML assets exist', async () => {
  const html = await read('index.html');
  const references = [...html.matchAll(/(?:src|href)="(?!https?:|#|mailto:|tel:)([^"?#]+)(?:[?#][^"]*)?"/g)]
    .map(match => match[1])
    .filter(path => !path.startsWith('/'));
  await Promise.all([...new Set(references)].map(path => access(resolve(root, path))));
});

test('every internal page link targets an existing id', async () => {
  const html = await read('index.html');
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]));
  const targets = [...html.matchAll(/href="#([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(targets.filter(target => !ids.has(target)), []);
});

test('every hard-coded JavaScript id selector exists in the page', async () => {
  const [html, script] = await Promise.all([read('index.html'), read('script.js')]);
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]));
  const selectors = new Set([...script.matchAll(/\$\("#([A-Za-z0-9_-]+)"/g)].map(match => match[1]));
  assert.deepEqual([...selectors].filter(selector => !ids.has(selector)), []);
});

test('canonical, social metadata, robots and sitemap use one origin', async () => {
  const [html, robots, sitemap] = await Promise.all([read('index.html'), read('robots.txt'), read('sitemap.xml')]);
  const canonical = html.match(/rel="canonical" href="([^"]+)"/)?.[1];
  assert.equal(canonical, 'https://ramad-construction-real-estate.vercel.app/');
  assert.match(html, new RegExp(`<meta property="og:url" content="${canonical}">`));
  assert.match(robots, new RegExp(`Sitemap: ${canonical}sitemap\\.xml`));
  assert.match(sitemap, new RegExp(`<loc>${canonical}</loc>`));
});

test('published property and project sections retain verification safeguards', async () => {
  const html = await read('index.html');
  assert.match(html, /Verified listings will appear here\./);
  assert.match(html, /No public property inventory yet/);
  assert.match(html, /Verified case studies are pending\./);
  assert.match(html, /Concept visuals, not client case studies/);
});

test('consultation form exposes accessible validation feedback', async () => {
  const [html, script] = await Promise.all([read('index.html'), read('script.js')]);
  assert.match(html, /id="form-errors" role="alert" tabindex="-1" hidden/);
  assert.match(script, /setAttribute\("aria-invalid"/);
  assert.match(script, /setAttribute\("aria-errormessage"/);
  assert.match(script, /errorSummary\.focus\(\)/);
});

test('consultation validation operates on the complete form field collection', async () => {
  const script = await read('script.js');
  assert.match(script, /import \{ collectFormFields \} from "\.\/form-fields\.mjs"/);
  assert.match(script, /const fields = collectFormFields\(form\)/);
  assert.match(script, /fields\.forEach\(input =>/);
  assert.match(script, /fields\.filter\(input =>/);
  assert.doesNotMatch(script, /\$\(['"]input, select, textarea['"], form\)/);
});

test('mobile menu traps keyboard focus and restores it when closed', async () => {
  const [html, script] = await Promise.all([read('index.html'), read('script.js')]);
  assert.match(html, /id="mobile-menu" aria-hidden="true" inert/);
  assert.match(script, /import \{ createMenuController \} from "\.\/menu-controller\.mjs"/);
  assert.match(script, /document\.addEventListener\("keydown", menuController\.handleKeyDown\)/);
  assert.match(script, /matchMedia\("\(min-width: 1181px\)"\)/);
  assert.match(script, /menuController\.handleDesktopChange\(desktopQuery\)/);
});

test('continuous animations respect motion and page visibility preferences', async () => {
  const [script, styles] = await Promise.all([read('script.js'), read('style.css')]);
  assert.match(script, /coarsePointer \|\| reducedMotion \|\| window\.innerWidth < 900/);
  assert.match(script, /if \(document\.hidden\) loop\.stop\(\)/);
  assert.match(script, /else loop\.start\(\)/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.cursor-dot, \.cursor-ring \{ display: none; \}/);
});

test('removed listing prototypes cannot silently return without matching markup', async () => {
  const script = await read('script.js');
  for (const obsolete of ['properties-grid', 'property-modal', 'projects-list', 'comparison-range', 'map-grid']) {
    assert.doesNotMatch(script, new RegExp(obsolete));
  }
  assert.doesNotMatch(script, /ramad-favorites/);
});
