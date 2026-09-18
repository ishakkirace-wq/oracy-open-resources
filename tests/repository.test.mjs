import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { access, readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const text = async path => readFile(new URL(path, root), 'utf8');

test('all JavaScript sources pass the Node syntax check', async () => {
  const files = [
    'app.js',
    'activities/sleeping-dragon-core.js',
    'activities/sleeping-dragon.js',
    'activities/magic-train.js',
    'activities/listening-detectives.js',
    'activities/story-machine.js',
    'activities/emotion-studio.js',
    'activities/describe-draw.js'
  ];
  for (const file of files) {
    const result = spawnSync(process.execPath, ['--check', fileURLToPath(new URL(file, root))], { encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr || file + ' did not parse');
  }
});

test('entry page loads the shared dragon core and exactly six reviewed activities', async () => {
  const html = await text('index.html');
  const activityScripts = [...html.matchAll(/<script src="(activities\/[^"]+)" defer><\/script>/g)].map(match => match[1]);
  assert.deepEqual(activityScripts, [
    'activities/sleeping-dragon-core.js',
    'activities/sleeping-dragon.js',
    'activities/magic-train.js',
    'activities/listening-detectives.js',
    'activities/story-machine.js',
    'activities/emotion-studio.js',
    'activities/describe-draw.js'
  ]);
});

test('runtime code has no network request primitive or remote URL', async () => {
  const files = ['app.js', 'activities/sleeping-dragon-core.js', 'activities/sleeping-dragon.js', 'activities/magic-train.js', 'activities/listening-detectives.js', 'activities/story-machine.js', 'activities/emotion-studio.js', 'activities/describe-draw.js'];
  for (const file of files) {
    const source = await text(file);
    assert.doesNotMatch(source, /\b(fetch|XMLHttpRequest|WebSocket|EventSource)\b/, file);
    assert.doesNotMatch(source, /https?:\/\//, file);
    assert.doesNotMatch(source, /api[_-]?key|authorization\s*:|bearer\s+/i, file);
  }
});

test('content security policy disables outbound connections', async () => {
  const html = await text('index.html');
  assert.match(html, /connect-src 'none'/);
  assert.match(html, /object-src 'none'/);
  assert.doesNotMatch(html, /<script(?![^>]*\bsrc=)[^>]*>/i);
  assert.doesNotMatch(html, /\sstyle="/i);
});

test('all activity scripts register one expected module', async () => {
  const entries = await readdir(new URL('activities/', root));
  assert.deepEqual(entries.sort(), ['describe-draw.js', 'emotion-studio.js', 'listening-detectives.js', 'magic-train.js', 'sleeping-dragon-core.js', 'sleeping-dragon.js', 'story-machine.js']);
  const ids = [];
  for (const entry of entries.filter(entry => entry !== 'sleeping-dragon-core.js')) {
    const source = await text(join('activities', entry));
    const match = source.match(/id:\s*'([a-z-]+)'/);
    assert.ok(match, entry + ' must declare an id');
    ids.push(match[1]);
  }
  assert.deepEqual(ids.sort(), ['describe-draw', 'emotion-studio', 'listening-detectives', 'magic-train', 'sleeping-dragon', 'story-machine']);
});

test('repository is explicit that AI is proposed and not implemented', async () => {
  const files = ['README.md', 'docs/AI-PROPOSAL.md', 'ROADMAP.md'];
  for (const file of files) {
    const source = await text(file);
    assert.match(source, /not (implemented|built)/i, file);
  }
});

test('approved MIT and CC BY 4.0 licences are active with explicit exclusions', async () => {
  const [software, content, notice, metadata] = await Promise.all([
    text('LICENSE'),
    text('LICENSE-CONTENT.md'),
    text('NOTICE.md'),
    text('package.json')
  ]);
  assert.match(software, /^MIT License/);
  assert.match(software, /Copyright \(c\) 2026 Oracy Eğitim Danışmanlık Yayıncılık Ltd\. Şti\./);
  assert.match(content, /Creative Commons Attribution 4\.0 International/);
  assert.match(content, /creativecommons\.org\/licenses\/by\/4\.0\/legalcode/);
  assert.match(notice, /trademarks[\s\S]*do not grant permission/i);
  assert.match(notice, /no bundled MP4, WebM, MP3, WAV, PNG, JPEG, WebP, GIF, font or model-weight asset/i);
  assert.equal(JSON.parse(metadata).license, 'MIT');
  await assert.rejects(access(new URL('LICENSE-RECOMMENDATION.md', root)));
});

test('excluded commercial products do not occur in runnable files', async () => {
  const files = ['index.html', 'app.js', 'styles.css', 'activities/sleeping-dragon-core.js', 'activities/sleeping-dragon.js', 'activities/magic-train.js', 'activities/listening-detectives.js', 'activities/story-machine.js', 'activities/emotion-studio.js', 'activities/describe-draw.js'];
  for (const file of files) {
    const source = await text(file);
    assert.doesNotMatch(source, /OracyNet|Oracy World/i, file);
  }
});
