import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const distDir = path.join(root, 'dist');
const distManifestPath = path.join(distDir, 'manifest.json');
const sampleDir = path.join(root, 'public', 'shotpack-sample');

const collectManifestFiles = (manifest) => {
  const files = new Set(['manifest.json']);

  if (typeof manifest.audio?.src === 'string' && manifest.audio.src.length > 0) {
    files.add(manifest.audio.src);
  }

  for (const scene of manifest.scenes ?? []) {
    if (typeof scene.assets?.videoSrc === 'string' && scene.assets.videoSrc.length > 0) {
      files.add(scene.assets.videoSrc);
    }

    for (const still of scene.assets?.stills ?? []) {
      if (typeof still === 'string' && still.length > 0) {
        files.add(still);
      }
    }
  }

  return [...files];
};

const syncShotpackSample = () => {
  if (!fs.existsSync(distManifestPath)) {
    if (fs.existsSync(sampleDir)) {
      console.log(
        `Skipped sample sync because ${distManifestPath} does not exist; keeping checked-in sample assets.`,
      );
      return;
    }

    fs.mkdirSync(sampleDir, {recursive: true});
    console.log(`Created empty sample asset directory at ${sampleDir}`);
    return;
  }

  const manifest = JSON.parse(fs.readFileSync(distManifestPath, 'utf8'));
  const files = collectManifestFiles(manifest);

  fs.rmSync(sampleDir, {recursive: true, force: true});
  fs.mkdirSync(sampleDir, {recursive: true});

  for (const relativeFile of files) {
    const sourcePath =
      relativeFile === 'manifest.json'
        ? distManifestPath
        : path.join(distDir, relativeFile);

    if (!fs.existsSync(sourcePath)) {
      console.warn(`Skipped missing asset referenced by manifest: ${relativeFile}`);
      continue;
    }

    const destinationPath = path.join(sampleDir, relativeFile);
    fs.mkdirSync(path.dirname(destinationPath), {recursive: true});
    fs.copyFileSync(sourcePath, destinationPath);
  }

  console.log(`Prepared shotpack sample assets in ${sampleDir}`);
};

syncShotpackSample();
