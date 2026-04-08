import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const pixverseBin = process.env.PIXVERSE_BIN?.trim() || 'pixverse';

const plateDefinitions = [
  {
    id: 'cosmic-mist',
    seed: '11021',
    prompt:
      'Slow cinematic deep-space nebula, midnight indigo void, breathing clouds of starlight, tiny gold particles drifting, sacred stillness, spacious modern music video background, no people, no text, no planets, no ink, no paper texture',
  },
  {
    id: 'ember-field',
    seed: '11022',
    prompt:
      'Warm gold micro particles floating in zero gravity across a dark blue cosmic field, soft depth of field, calm but rhythmic pulses, premium atmospheric music video background, no people, no text, no fire flames, no ink',
  },
  {
    id: 'filament-light',
    seed: '11023',
    prompt:
      'Thin luminous filaments reconnecting across space, pale gold and cool white light trails weaving slowly in darkness, elegant sci-fi atmosphere, meditative cinematic background plate, no people, no text, no grid interface, no ink',
  },
  {
    id: 'liquid-starlight',
    seed: '11024',
    prompt:
      'Cosmic liquid surface reflecting stars, gentle ripples of starlight across a dark indigo expanse, ethereal spacious atmosphere, premium background plate for music video, no people, no text, no ocean horizon, no ink',
  },
  {
    id: 'halo-bloom',
    seed: '11025',
    prompt:
      'Concentric halo rings opening and closing in a dark cosmic field, subtle aurora highlights, soft star dust, serene sacred atmosphere, cinematic abstract background plate, no people, no text, no flowers, no ink',
  },
  {
    id: 'silent-void',
    seed: '11026',
    prompt:
      'Abstract deep navy cosmic dust field, faint distant stars, slow drifting light trails, spacious contemplative atmosphere, premium cinematic music video background, no people, no text, no planets',
  },
];

const cliOptions = {
  model: 'v6',
  quality: '1080p',
  duration: '10',
  aspectRatio: '16:9',
  force: false,
  only: null,
};

for (const arg of process.argv.slice(2)) {
  if (arg === '--force') {
    cliOptions.force = true;
    continue;
  }

  if (arg.startsWith('--model=')) {
    cliOptions.model = arg.slice('--model='.length);
    continue;
  }

  if (arg.startsWith('--quality=')) {
    cliOptions.quality = arg.slice('--quality='.length);
    continue;
  }

  if (arg.startsWith('--duration=')) {
    cliOptions.duration = arg.slice('--duration='.length);
    continue;
  }

  if (arg.startsWith('--only=')) {
    cliOptions.only = new Set(
      arg
        .slice('--only='.length)
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean),
    );
  }
}

const parseJsonOutput = (stdout) => {
  const trimmed = stdout.trim();
  if (!trimmed) {
    return {};
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    const lines = trimmed.split('\n');
    const jsonStart = lines.findIndex((line) => line.trim().startsWith('{'));
    if (jsonStart === -1) {
      throw new Error(`PixVerse response did not contain JSON: ${trimmed}`);
    }

    return JSON.parse(lines.slice(jsonStart).join('\n'));
  }
};

const runPixverse = (args) => {
  const result = spawnSync(pixverseBin, [...args, '--json'], {
    cwd: root,
    encoding: 'utf8',
  });

  if (result.status !== 0) {
    const stderr = result.stderr?.trim() || 'Unknown PixVerse error';
    throw new Error(`${pixverseBin} ${args.join(' ')} failed: ${stderr}`);
  }

  return parseJsonOutput(result.stdout ?? '');
};

const ensureDir = (dirPath) => {
  fs.mkdirSync(dirPath, {recursive: true});
};

const findDownloadedAsset = (dirPath) => {
  const entries = fs
    .readdirSync(dirPath, {withFileTypes: true})
    .filter((entry) => entry.isFile() && !entry.name.startsWith('.'));

  const preferred = entries.find((entry) => /\.(mp4|mov|webm)$/i.test(entry.name));
  const selected = preferred ?? entries[0];

  if (!selected) {
    throw new Error(`No asset was downloaded into ${dirPath}`);
  }

  return path.join(dirPath, selected.name);
};

const extractTaskId = (payload) => {
  const id = payload.video_id ?? payload.id;
  if (!id) {
    throw new Error(`PixVerse response did not include video_id: ${JSON.stringify(payload)}`);
  }

  return String(id);
};

const assetsDir = path.join(root, 'assets', 'nakaima');
const plateDir = path.join(assetsDir, 'plates');
const tempDir = path.join(assetsDir, '_plate-downloads');
const manifestPath = path.join(assetsDir, 'plate-manifest.json');

ensureDir(plateDir);
ensureDir(tempDir);

const accountInfo = runPixverse(['account', 'info']);
const availableCredits =
  typeof accountInfo.credits === 'object' && accountInfo.credits !== null
    ? Number(accountInfo.credits.total ?? 0)
    : 0;

const selectedDefinitions = cliOptions.only
  ? plateDefinitions.filter((definition) => cliOptions.only.has(definition.id))
  : plateDefinitions;

const failures = [];

const writeManifest = () => {
  fs.writeFileSync(
    manifestPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        model: cliOptions.model,
        quality: cliOptions.quality,
        duration: Number(cliOptions.duration),
        aspectRatio: cliOptions.aspectRatio,
        creditsAvailableAtStart: availableCredits,
        plates: manifestEntries,
        failures,
      },
      null,
      2,
    ),
  );
};

console.log(`PixVerse credits available: ${availableCredits}`);

const manifestEntries = [];
const submittedJobs = [];

for (const definition of selectedDefinitions) {
  const outputPath = path.join(plateDir, `${definition.id}.mp4`);

  if (fs.existsSync(outputPath) && !cliOptions.force) {
    manifestEntries.push({
      id: definition.id,
      output: outputPath,
      prompt: definition.prompt,
      model: cliOptions.model,
      quality: cliOptions.quality,
      duration: Number(cliOptions.duration),
      reused: true,
    });
    writeManifest();
    console.log(`Reusing ${definition.id}`);
    continue;
  }

  try {
    const payload = runPixverse([
      'create',
      'video',
      '--prompt',
      definition.prompt,
      '--model',
      cliOptions.model,
      '--quality',
      cliOptions.quality,
      '--duration',
      cliOptions.duration,
      '--aspect-ratio',
      cliOptions.aspectRatio,
      '--seed',
      definition.seed,
      '--no-wait',
    ]);
    const taskId = extractTaskId(payload);
    submittedJobs.push({
      ...definition,
      taskId,
      outputPath,
    });

    manifestEntries.push({
      id: definition.id,
      output: outputPath,
      prompt: definition.prompt,
      model: cliOptions.model,
      quality: cliOptions.quality,
      duration: Number(cliOptions.duration),
      seed: definition.seed,
      taskId,
      reused: false,
      status: 'submitted',
    });
    writeManifest();
    console.log(`Submitted ${definition.id}: ${taskId}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    failures.push({
      id: definition.id,
      stage: 'submit',
      error: message,
    });
    writeManifest();
    console.error(`Failed to submit ${definition.id}: ${message}`);
  }
}

for (const job of submittedJobs) {
  const downloadDir = path.join(tempDir, job.id);
  fs.rmSync(downloadDir, {recursive: true, force: true});
  ensureDir(downloadDir);

  try {
    console.log(`Waiting for ${job.id} (${job.taskId})`);
    runPixverse(['task', 'wait', job.taskId, '--timeout', '1800']);
    runPixverse(['asset', 'download', job.taskId, '--type', 'video', '--dest', downloadDir]);

    const downloadedAsset = findDownloadedAsset(downloadDir);
    fs.copyFileSync(downloadedAsset, job.outputPath);
    const entry = manifestEntries.find((item) => item.id === job.id);
    if (entry) {
      entry.status = 'downloaded';
    }
    writeManifest();
    console.log(`Saved ${job.id} to ${job.outputPath}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    failures.push({
      id: job.id,
      stage: 'download',
      taskId: job.taskId,
      error: message,
    });
    const entry = manifestEntries.find((item) => item.id === job.id);
    if (entry) {
      entry.status = 'failed';
    }
    writeManifest();
    console.error(`Failed to download ${job.id}: ${message}`);
  }
}

writeManifest();
console.log(`Wrote plate manifest to ${manifestPath}`);

if (failures.length > 0) {
  process.exitCode = 1;
}
