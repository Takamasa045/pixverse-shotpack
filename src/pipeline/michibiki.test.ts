import assert from 'node:assert/strict';
import {mkdirSync, mkdtempSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {exportMichibikiHandoff, loadProjectConfig} from './core';

test('export writes a VideoSpec handoff and builds a Michibiki --spec command', async () => {
  const root = mkdtempSync(path.join(tmpdir(), 'shotpack-michibiki-'));
  const assetsDir = path.join(root, 'assets');
  const distDir = path.join(root, 'dist');
  mkdirSync(path.join(assetsDir, 'audio'), {recursive: true});
  mkdirSync(distDir, {recursive: true});
  writeFileSync(path.join(root, 'brief.md'), 'A short demo brief.', 'utf8');
  writeFileSync(
    path.join(root, 'project.yaml'),
    `
project:
  slug: test-shotpack
  title: Test Shotpack
  date: "2026-06-15"
inputs:
  brief: ./brief.md
  storyboard: ./storyboard.yaml
assets:
  mode: local
  sourceDir: ./assets
  audio: audio/music.wav
  videoPattern: scene-%02d.mp4
  stillPattern: ref-shot-%02d.webp
render:
  width: 1920
  height: 1080
  fps: 30
  output: ./dist/renders/test.mp4
`,
    'utf8',
  );
  writeFileSync(
    path.join(root, 'storyboard.yaml'),
    `
meta:
  title: Test Shotpack
  fps: 30
  workflow: i2v
  target_duration_seconds: 4
  allow_uniform_duration: true
  uniform_duration_reason: test fixture
shots:
  - id: opening
    prompt: A cinematic opening shot.
    duration: 4
    objective: Open the story.
    transition: cut
`,
    'utf8',
  );
  writeFileSync(path.join(assetsDir, 'audio', 'music.wav'), '', {flag: 'w'});
  writeFileSync(path.join(assetsDir, 'scene-01.mp4'), '', {flag: 'w'});
  writeFileSync(path.join(assetsDir, 'ref-shot-01.webp'), '', {flag: 'w'});
  writeFileSync(path.join(distDir, 'manifest.json'), '{}\n', {flag: 'w'});

  const loaded = await loadProjectConfig(path.join(root, 'project.yaml'));
  const handoff = exportMichibikiHandoff(loaded, {engine: 'hyperframes'});

  assert.equal(handoff.videoSpecPath, path.join(distDir, 'video-spec.json'));
  assert.deepEqual(
    handoff.michibiki.command.slice(0, 4),
    ['pnpm', 'michibiki', 'generate', '--spec'],
  );
  assert.equal(handoff.michibiki.command[4], handoff.videoSpecPath);
  assert.equal(handoff.michibiki.command.includes('--prompt'), false);
  assert.equal(handoff.michibiki.command.includes('--outputs'), false);
  assert.equal(handoff.michibiki.command.includes(path.join(distDir, 'michibiki')), false);
  assert.equal(handoff.michibiki.command.includes('--engine'), true);
  assert.equal(handoff.michibiki.command.includes('hyperframes'), true);

  const defaultHandoff = exportMichibikiHandoff(loaded, {
    outputPath: './dist/default-video-spec.json',
    handoffPath: './dist/default-michibiki-handoff.json',
  });
  assert.equal(defaultHandoff.michibiki.engine, 'editframe');
  assert.equal(defaultHandoff.michibiki.command.includes('editframe'), true);
});
