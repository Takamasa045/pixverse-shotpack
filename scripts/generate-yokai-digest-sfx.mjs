import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const outputPaths = [
  path.join(root, 'public', 'yokai-cipher', 'audio', 'yokai-cipher-digest-sfx.wav'),
  path.join(root, 'dist', 'yokai-cipher', 'audio', 'yokai-cipher-digest-sfx.wav'),
];

const sampleRate = 44100;
const duration = 45.15;
const totalSamples = Math.round(duration * sampleRate);
const left = new Float32Array(totalSamples);
const right = new Float32Array(totalSamples);

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const addSample = (index, l, r) => {
  if (index < 0 || index >= totalSamples) {
    return;
  }

  left[index] += l;
  right[index] += r;
};

const addLanternTick = (start, gain, pan = 0) => {
  const startSample = Math.floor(start * sampleRate);
  const length = Math.floor(0.22 * sampleRate);
  for (let i = 0; i < length; i += 1) {
    const t = i / sampleRate;
    const env = Math.exp(-t * 12) * gain;
    const tone =
      Math.sin(2 * Math.PI * 1180 * t) * 0.08 +
      Math.sin(2 * Math.PI * 1770 * t) * 0.05 +
      Math.sin(2 * Math.PI * 2360 * t) * 0.03;
    const noise = (Math.random() * 2 - 1) * Math.exp(-t * 28) * 0.018;
    const v = (tone + noise) * env;
    addSample(startSample + i, v * (1 - pan * 0.5), v * (1 + pan * 0.5));
  }
};

const addClack = (start, gain, pan = 0) => {
  const startSample = Math.floor(start * sampleRate);
  const length = Math.floor(0.11 * sampleRate);
  for (let i = 0; i < length; i += 1) {
    const t = i / sampleRate;
    const env = Math.exp(-t * 34) * gain;
    const tone = Math.sin(2 * Math.PI * (620 + t * 700) * t) * 0.16;
    const click = (Math.random() * 2 - 1) * Math.exp(-t * 90) * 0.12;
    const v = (tone + click) * env;
    addSample(startSample + i, v * (1 - pan * 0.45), v * (1 + pan * 0.45));
  }
};

const addReverseWhoosh = (start, durationSec, gain, pan = 0) => {
  const startSample = Math.floor(start * sampleRate);
  const length = Math.floor(durationSec * sampleRate);
  for (let i = 0; i < length; i += 1) {
    const t = i / sampleRate;
    const normalized = i / Math.max(1, length - 1);
    const env = normalized ** 2.2 * gain;
    const noise = (Math.random() * 2 - 1) * env * 0.07;
    const tone = Math.sin(2 * Math.PI * (180 + normalized * 1200) * t) * env * 0.045;
    const v = noise + tone;
    addSample(startSample + i, v * (1 - pan * 0.35), v * (1 + pan * 0.35));
  }
};

const addNeckCreak = (start, gain, pan = 0) => {
  const startSample = Math.floor(start * sampleRate);
  const length = Math.floor(0.42 * sampleRate);
  for (let i = 0; i < length; i += 1) {
    const t = i / sampleRate;
    const env = Math.exp(-t * 7.5) * gain;
    const pitch = 145 - Math.min(60, t * 160);
    const groan =
      Math.sin(2 * Math.PI * pitch * t) * 0.1 +
      Math.sin(2 * Math.PI * (pitch * 1.97) * t) * 0.03;
    const scrape = (Math.random() * 2 - 1) * Math.exp(-t * 20) * 0.06;
    const wobble = Math.sin(2 * Math.PI * 3.4 * t) * 0.018;
    const v = (groan + scrape + wobble) * env;
    addSample(startSample + i, v * (1 - pan * 0.25), v * (1 + pan * 0.25));
  }
};

const addSubHit = (start, gain) => {
  const startSample = Math.floor(start * sampleRate);
  const length = Math.floor(0.55 * sampleRate);
  for (let i = 0; i < length; i += 1) {
    const t = i / sampleRate;
    const env = Math.exp(-t * 8) * gain;
    const freq = 72 - Math.min(18, t * 38);
    const body = Math.sin(2 * Math.PI * freq * t) * env * 0.2;
    addSample(startSample + i, body, body);
  }
};

const addCrowdSwipe = (start, durationSec, gain) => {
  const startSample = Math.floor(start * sampleRate);
  const length = Math.floor(durationSec * sampleRate);
  for (let i = 0; i < length; i += 1) {
    const t = i / sampleRate;
    const normalized = i / Math.max(1, length - 1);
    const env = Math.sin(normalized * Math.PI) ** 1.5 * gain;
    const noise = (Math.random() * 2 - 1) * env * 0.08;
    const tone = Math.sin(2 * Math.PI * (240 + normalized * 660) * t) * env * 0.03;
    addSample(startSample + i, noise + tone, noise * 0.92 + tone * 1.08);
  }
};

const addSmokeTail = (start, gain, pan = 0) => {
  const startSample = Math.floor(start * sampleRate);
  const length = Math.floor(1.2 * sampleRate);
  for (let i = 0; i < length; i += 1) {
    const t = i / sampleRate;
    const env = Math.exp(-t * 2.4) * gain;
    const noise = (Math.random() * 2 - 1) * env * 0.024;
    const air = Math.sin(2 * Math.PI * 520 * t) * env * 0.016;
    addSample(startSample + i, (noise + air) * (1 - pan * 0.4), (noise + air) * (1 + pan * 0.4));
  }
};

const cues = [
  () => addLanternTick(0.24, 0.78, -0.25),
  () => addLanternTick(0.92, 0.65, 0.25),
  () => addLanternTick(1.54, 0.72, -0.18),
  () => addReverseWhoosh(2.72, 0.42, 0.58, -0.3),
  () => addClack(4.06, 0.62, 0.22),
  () => addClack(5.18, 0.54, -0.18),
  () => addReverseWhoosh(6.46, 0.34, 0.52, 0.15),
  () => addCrowdSwipe(8.72, 0.42, 0.48),
  () => addSubHit(10.02, 0.5),
  () => addClack(12.66, 0.68, -0.22),
  () => addClack(13.82, 0.62, 0.22),
  () => addClack(15.02, 0.58, -0.2),
  () => addCrowdSwipe(16.42, 0.38, 0.34),
  () => addReverseWhoosh(18.58, 0.5, 0.66, -0.3),
  () => addSubHit(21.98, 0.52),
  () => addReverseWhoosh(21.64, 0.42, 0.58, 0.22),
  () => addLanternTick(22.12, 0.62, 0.28),
  () => addNeckCreak(25.22, 0.72, -0.12),
  () => addNeckCreak(28.34, 0.64, 0.16),
  () => addNeckCreak(31.56, 0.62, -0.1),
  () => addNeckCreak(34.78, 0.6, 0.12),
  () => addClack(37.96, 0.82, -0.16),
  () => addSubHit(38.02, 0.84),
  () => addCrowdSwipe(38.24, 0.46, 0.54),
  () => addClack(41.52, 0.74, 0.18),
  () => addSubHit(41.56, 0.72),
  () => addLanternTick(43.44, 0.52, -0.1),
  () => addSmokeTail(43.62, 0.52, 0.12),
  () => addLanternTick(44.32, 0.45, 0.18),
];

for (const cue of cues) {
  cue();
}

for (let i = 0; i < totalSamples; i += 1) {
  const t = i / sampleRate;
  const room =
    Math.sin(2 * Math.PI * 86 * t) * 0.0025 +
    Math.sin(2 * Math.PI * 129 * t) * 0.0018 +
    (Math.random() * 2 - 1) * 0.0008;
  const fadeIn = clamp(i / (sampleRate * 0.18), 0, 1);
  const fadeOut = clamp((totalSamples - i) / (sampleRate * 0.9), 0, 1);
  left[i] = Math.tanh((left[i] + room) * 1.4) * 0.8 * fadeIn * fadeOut;
  right[i] = Math.tanh((right[i] + room * 0.9) * 1.4) * 0.8 * fadeIn * fadeOut;
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
  console.log(`Generated digest SFX: ${outputPath}`);
}
