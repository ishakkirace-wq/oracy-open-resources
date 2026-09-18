import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const text = path => readFile(new URL(path, root), 'utf8');

test('Sleeping Dragon runtime contains no bundled or remote media reference', async () => {
  const source = await text('activities/sleeping-dragon.js');
  assert.doesNotMatch(source, /<(audio|video|img)\b/i);
  assert.doesNotMatch(source, /\.(mp4|webm|mp3|wav|png|jpe?g|webp)\b/i);
  assert.doesNotMatch(source, /https?:\/\//i);
});

test('microphone is local analysis only and is never recorded or connected to output', async () => {
  const source = await text('activities/sleeping-dragon.js');
  assert.match(source, /getUserMedia/);
  assert.match(source, /createMediaStreamSource/);
  assert.match(source, /createAnalyser/);
  assert.doesNotMatch(source, /MediaRecorder|createMediaStreamDestination|\.destination\b|fetch\(|XMLHttpRequest|WebSocket/);
});

test('interface states the relative measure and privacy boundary', async () => {
  const source = await text('activities/sleeping-dragon.js');
  assert.match(source, /relative, not dB/i);
  assert.match(source, /not recorded, transcribed, identified or uploaded/i);
  assert.match(source, /does not assess individual children/i);
});

test('microphone-free quiet, medium and loud preview controls are present', async () => {
  const source = await text('activities/sleeping-dragon.js');
  assert.match(source, /data-preview="0">Quiet/);
  assert.match(source, /data-preview="1">Medium/);
  assert.match(source, /data-preview="2">Loud/);
});

test('entry page loads the tested core before the visual module', async () => {
  const html = await text('index.html');
  assert.ok(html.indexOf('activities/sleeping-dragon-core.js') < html.indexOf('activities/sleeping-dragon.js'));
});

