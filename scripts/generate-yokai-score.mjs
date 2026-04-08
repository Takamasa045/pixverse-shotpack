import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const distManifestPath = path.join(root, 'dist', 'yokai-cipher', 'manifest.json');
const publicManifestPath = path.join(root, 'public', 'yokai-cipher', 'manifest.json');
const manifestPath = fs.existsSync(distManifestPath) ? distManifestPath : publicManifestPath;
const outputPaths = [
  path.join(root, 'public', 'yokai-cipher', 'audio', 'yokai-cipher-score.wav'),
  path.join(root, 'dist', 'yokai-cipher', 'audio', 'yokai-cipher-score.wav'),
];

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const sampleRate = 44100;
const duration = manifest.audio.durationInSeconds;
const bpm = manifest.audio.bpm ?? 92;
const beat = 60 / bpm;
const totalSamples = Math.round(duration * sampleRate);
const left = new Float32Array(totalSamples);
const right = new Float32Array(totalSamples);
const notePattern = [43.65, 43.65, 41.2, 46.25, 43.65, 51.91, 46.25, 38.89];
const transitions = manifest.scenes.slice(1).map((scene) => scene.startSec);

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const addSample = (index, l, r) => {
  if (index < 0 || index >= totalSamples) {
    return;
  }

  left[index] += l;
  right[index] += r;
};

const addKick = (start, strength) => {
  const startSample = Math.floor(start * sampleRate);
  const length = Math.floor(0.34 * sampleRate);
  for (let i = 0; i < length; i += 1) {
    const t = i / sampleRate;
    const env = Math.exp(-t * 15);
    const freq = 112 - Math.min(t / 0.18, 1) * 62;
    const body = Math.sin(2 * Math.PI * freq * t) * env * strength;
    const click = (Math.random() * 2 - 1) * Math.exp(-t * 90) * 0.04 * strength;
    addSample(startSample + i, body + click, body + click);
  }
};

const addSnare = (start, strength) => {
  const startSample = Math.floor(start * sampleRate);
  const length = Math.floor(0.23 * sampleRate);
  for (let i = 0; i < length; i += 1) {
    const t = i / sampleRate;
    const env = Math.exp(-t * 18);
    const noise = (Math.random() * 2 - 1) * env * 0.22 * strength;
    const tone = Math.sin(2 * Math.PI * (184 - t * 40) * t) * Math.exp(-t * 22) * 0.06 * strength;
    addSample(startSample + i, noise + tone, noise + tone);
  }
};

const addHat = (start, strength, pan) => {
  const startSample = Math.floor(start * sampleRate);
  const length = Math.floor(0.07 * sampleRate);
  for (let i = 0; i < length; i += 1) {
    const t = i / sampleRate;
    const env = Math.exp(-t * 68);
    const noise = (Math.random() * 2 - 1) * env * 0.08 * strength;
    const l = noise * (1 - pan * 0.5);
    const r = noise * (1 + pan * 0.5);
    addSample(startSample + i, l, r);
  }
};

const addBass = (start, freq, strength) => {
  const startSample = Math.floor(start * sampleRate);
  const length = Math.floor(beat * 0.94 * sampleRate);
  for (let i = 0; i < length; i += 1) {
    const t = i / sampleRate;
    const env = Math.exp(-t * 3.4) * clamp((t - 0.035) * 28, 0, 1);
    const wobble = 1 + Math.sin(2 * Math.PI * 0.18 * (start + t)) * 0.02;
    const tone =
      Math.sin(2 * Math.PI * freq * wobble * t) * 0.17 +
      Math.sin(2 * Math.PI * freq * 2 * t) * 0.04;
    addSample(startSample + i, tone * env * strength, tone * env * strength);
  }
};

const addTransitionSweep = (center) => {
  const start = Math.max(0, center - 0.28);
  const end = Math.min(duration, center + 0.06);
  const startSample = Math.floor(start * sampleRate);
  const length = Math.floor((end - start) * sampleRate);
  for (let i = 0; i < length; i += 1) {
    const t = i / sampleRate;
    const normalized = t / Math.max(end - start, 0.001);
    const env = Math.sin(normalized * Math.PI) ** 2;
    const freq = 280 + normalized * 980;
    const noise = (Math.random() * 2 - 1) * env * 0.06;
    const tone = Math.sin(2 * Math.PI * freq * t) * env * 0.05;
    addSample(startSample + i, noise + tone, noise * 0.9 + tone * 1.1);
  }
};

const addBell = (start, strength) => {
  const startSample = Math.floor(start * sampleRate);
  const length = Math.floor(1.8 * sampleRate);
  for (let i = 0; i < length; i += 1) {
    const t = i / sampleRate;
    const env = Math.exp(-t * 2.8) * strength;
    const tone =
      Math.sin(2 * Math.PI * 659.25 * t) * 0.06 +
      Math.sin(2 * Math.PI * 987.77 * t) * 0.03 +
      Math.sin(2 * Math.PI * 1318.51 * t) * 0.015;
    addSample(startSample + i, tone * env, tone * env * 0.92);
  }
};

for (let i = 0; i < totalSamples; i += 1) {
  const t = i / sampleRate;
  const drone =
    Math.sin(2 * Math.PI * 54 * t) * 0.018 +
    Math.sin(2 * Math.PI * 81 * t) * 0.014 +
    Math.sin(2 * Math.PI * 162 * t) * 0.008;
  const air =
    Math.sin(2 * Math.PI * 0.09 * t) * 0.01 +
    (Math.random() * 2 - 1) * 0.0032;
  const pulse = 1 + Math.sin(2 * Math.PI * (bpm / 120) * t) * 0.06;
  left[i] += (drone * pulse + air) * 0.8;
  right[i] += (drone * pulse + air * 0.9);
}

const totalBeats = Math.ceil(duration / beat) + 4;
for (let beatIndex = 0; beatIndex < totalBeats; beatIndex += 1) {
  const start = beatIndex * beat;
  const inBar = beatIndex % 4;
  const kickStrength = inBar === 0 ? 1 : 0.82;
  addKick(start, kickStrength);
  addBass(start, notePattern[beatIndex % notePattern.length], inBar === 0 ? 1.08 : 0.84);

  if (inBar === 1 || inBar === 3) {
    addSnare(start, 0.88);
  }

  addHat(start + beat / 2, 0.78, beatIndex % 2 === 0 ? -0.35 : 0.35);
  addHat(start + beat * 0.75, 0.44, beatIndex % 2 === 0 ? 0.25 : -0.25);
}

for (const transition of transitions) {
  addTransitionSweep(transition);
}

addBell(duration - 5.8, 0.75);
addBell(duration - 2.6, 0.45);

for (let i = 0; i < totalSamples; i += 1) {
  const fadeIn = clamp(i / (sampleRate * 0.5), 0, 1);
  const fadeOut = clamp((totalSamples - i) / (sampleRate * 1.1), 0, 1);
  left[i] = Math.tanh(left[i] * 1.28) * 0.78 * fadeIn * fadeOut;
  right[i] = Math.tanh(right[i] * 1.28) * 0.78 * fadeIn * fadeOut;
}

const writeWav = (filePath, leftChannel, rightChannel) => {
  const channels = 2;
  const bitsPerSample = 16;
  const blockAlign = (channels * bitsPerSample) / 8;
  const byteRate = sampleRate * blockAlign;
  const dataSize = leftChannel.length * blockAlign;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(channels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  let offset = 44;
  for (let i = 0; i < leftChannel.length; i += 1) {
    buffer.writeInt16LE(Math.round(clamp(leftChannel[i], -1, 1) * 32767), offset);
    offset += 2;
    buffer.writeInt16LE(Math.round(clamp(rightChannel[i], -1, 1) * 32767), offset);
    offset += 2;
  }

  fs.mkdirSync(path.dirname(filePath), {recursive: true});
  fs.writeFileSync(filePath, buffer);
};

for (const outputPath of outputPaths) {
  writeWav(outputPath, left, right);
  console.log(`Generated score: ${outputPath}`);
}
