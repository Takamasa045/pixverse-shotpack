import {mkdtemp, readFile, rm, writeFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import test from 'node:test';
import {buildPipelinePlan, executePipeline, loadProjectConfig} from './core';

test('plan and dry-run reserve a PixVerse voice narration asset', async (t) => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'shotpack-voice-'));
  t.after(async () => {
    await rm(tempDir, {force: true, recursive: true});
  });

  const storyboardPath = path.join(tempDir, 'storyboard.yaml');
  const configPath = path.join(tempDir, 'project.yaml');
  const outputPath = path.join(tempDir, 'dist', 'renders', 'voice-narration.mp4');

  await writeFile(
    storyboardPath,
    `
meta:
  title: Voice Narration Smoke Test
  target_duration_seconds: 4
  workflow: t2v
shots:
  - id: intro
    prompt: Bright abstract production desk, no readable text
    duration: 4
    model: v6
    quality: 720p
    audio: false
    notes: Short opener
`,
    'utf8',
  );

  await writeFile(
    configPath,
    `
project:
  slug: voice-narration
  title: Voice Narration
  date: "2026-07-04"
inputs:
  storyboard: ./storyboard.yaml
assets:
  mode: pixverse
  voiceText: This is a dry-run narration test.
generation:
  workflow: t2v
  model: v6
  quality: 720p
render:
  output: ${JSON.stringify(outputPath)}
`,
    'utf8',
  );

  const loaded = await loadProjectConfig(configPath);
  const plan = buildPipelinePlan(loaded);

  assert.equal(plan.totals.videoJobs, 1);
  assert.equal(plan.totals.voiceJobs, 1);
  assert.equal(plan.creditEstimate.totalCredits, null);
  const voiceCommand = plan.commands.find((command) => command.includes('pixverse create voice'));
  assert.ok(voiceCommand);
  assert.equal(voiceCommand.includes('--client-request-id'), true);
  assert.equal(voiceCommand.includes('--idempotency-key'), false);

  const result = await executePipeline(loaded, {
    dryRun: true,
    mode: 'run',
    runId: 'voice-dry-run',
  });
  const manifest = JSON.parse(await readFile(result.manifestPath, 'utf8')) as {
    audio: {src: string};
  };

  assert.equal(result.summary.generatedVoices, 1);
  assert.equal(manifest.audio.src, 'audio/voice-narration-voice.mp3');
});
