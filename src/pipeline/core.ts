import fs from 'node:fs';
import path from 'node:path';
import {execFileSync, spawnSync} from 'node:child_process';
import {parse as parseYaml} from 'yaml';
import {z} from 'zod';
import type {ShotpackManifest} from '../types';

const ThemeSchema = z.object({
  background: z.string().default('#0A0A0A'),
  accent: z.string().default('#FF6B35'),
  text: z.string().default('#FFFFFF'),
});

const ImageGenerationSchema = z.object({
  enabled: z.boolean().default(true),
  model: z.string().default('seedream-5.0-lite'),
  quality: z.string().default('1800p'),
  aspectRatio: z.string().default('16:9'),
  detailLevel: z.enum(['low', 'medium', 'high']).optional(),
});

const RenderSchema = z.object({
  compositionId: z.string().default('Shotpack'),
  fps: z.number().int().positive().default(30),
  width: z.number().int().positive().default(1920),
  height: z.number().int().positive().default(1080),
  output: z.string().default('./dist/renders/shotpack-full.mp4'),
});

const ManifestOptionsSchema = z.object({
  textPolicy: z.string().default(''),
  editPolicy: z.string().default(''),
  protagonistPolicy: z.string().default(''),
  artistNotes: z.string().nullable().optional(),
  referenceNotes: z.string().nullable().optional(),
});

const ProjectConfigSchema = z.object({
  project: z.object({
    slug: z.string().min(1),
    title: z.string().min(1),
    date: z.string().min(1),
    version: z.string().default('1.0.0'),
  }),
  inputs: z.object({
    brief: z.string().optional(),
    storyboard: z.string(),
  }),
  assets: z.object({
    mode: z.enum(['local', 'pixverse']).default('local'),
    sourceDir: z.string().default('./public/shotpack-sample'),
    audio: z.string().default('audio/shotpack-placeholder.wav'),
    videoPattern: z.string().default('scene-%02d.mp4'),
    stillPattern: z.string().default('ref-shot-%02d.webp'),
    copyStills: z.boolean().default(true),
  }),
  generation: z.object({
    workflow: z.enum(['t2v', 'i2v']).default('i2v'),
    model: z.string().default('v6'),
    quality: z.string().default('1080p'),
    aspectRatio: z.string().default('16:9'),
    offPeak: z.boolean().default(false),
    image: ImageGenerationSchema.default({
      enabled: true,
      model: 'seedream-5.0-lite',
      quality: '1800p',
      aspectRatio: '16:9',
    }),
  }).default({
    workflow: 'i2v',
    model: 'v6',
    quality: '1080p',
    aspectRatio: '16:9',
    offPeak: false,
    image: {
      enabled: true,
      model: 'seedream-5.0-lite',
      quality: '1800p',
      aspectRatio: '16:9',
    },
  }),
  render: RenderSchema.default({
    compositionId: 'Shotpack',
    fps: 30,
    width: 1920,
    height: 1080,
    output: './dist/renders/shotpack-full.mp4',
  }),
  theme: ThemeSchema.default({
    background: '#0A0A0A',
    accent: '#FF6B35',
    text: '#FFFFFF',
  }),
  manifest: ManifestOptionsSchema.default({
    textPolicy: '',
    editPolicy: '',
    protagonistPolicy: '',
    artistNotes: null,
    referenceNotes: null,
  }),
});

const TargetDurationSchema = z.union([
  z.number().positive(),
  z
    .object({
      min: z.number().positive(),
      max: z.number().positive(),
    })
    .refine((range) => range.min <= range.max, {
      message: 'target_duration_seconds.min must be less than or equal to max',
    }),
]);

const StoryboardMetaSchema = z.object({
  title: z.string().min(1),
  fps: z.number().int().positive().optional(),
  workflow: z.enum(['t2v', 'i2v']).optional(),
  prompt_negative: z.string().optional(),
  target_duration_seconds: TargetDurationSchema.optional(),
  allow_uniform_duration: z.boolean().default(false),
  uniform_duration_reason: z.union([z.string(), z.null()]).optional(),
}).passthrough();

const StoryboardImageGenerationSchema = z.object({
  model: z.string().optional(),
  quality: z.string().optional(),
  aspect_ratio: z.string().optional(),
  detail_level: z.enum(['low', 'medium', 'high']).optional(),
}).passthrough();

const StoryboardShotSchema = z.object({
  id: z.string().min(1),
  prompt: z.string().min(1),
  model: z.string().optional(),
  quality: z.string().optional(),
  duration: z.number().positive(),
  aspect_ratio: z.string().optional(),
  audio: z.boolean().optional(),
  multi_shot: z.boolean().optional(),
  image_ref: z.union([z.string(), z.null()]).optional(),
  notes: z.string().optional(),
  objective: z.string().optional(),
  emotion: z.string().optional(),
  motif: z.string().optional(),
  hookText: z.union([z.string(), z.null()]).optional(),
  transition: z.string().optional(),
  music_section: z.string().optional(),
}).passthrough();

const StoryboardSchema = z.object({
  meta: StoryboardMetaSchema,
  image_generation: StoryboardImageGenerationSchema.optional(),
  shots: z.array(StoryboardShotSchema).min(1),
});

type ProjectConfigInput = z.infer<typeof ProjectConfigSchema>;
type StoryboardInput = z.infer<typeof StoryboardSchema>;
type StoryboardShot = z.infer<typeof StoryboardShotSchema>;

export type PipelineCommand = 'doctor' | 'export' | 'plan' | 'render' | 'run' | 'validate';

export type LoadedProjectConfig = {
  configPath: string;
  configDir: string;
  project: ProjectConfigInput['project'];
  inputs: {
    briefPath?: string;
    storyboardPath: string;
  };
  assets: ProjectConfigInput['assets'];
  generation: ProjectConfigInput['generation'];
  render: ProjectConfigInput['render'];
  theme: ProjectConfigInput['theme'];
  manifestOptions: ProjectConfigInput['manifest'];
  storyboard: StoryboardInput;
  briefText: string | null;
  distDir: string;
  renderOutputPath: string;
  normalizedShots: NormalizedShot[];
};

type NormalizedShot = {
  index: number;
  sourceId: string;
  sceneId: string;
  prompt: string;
  durationSeconds: number;
  model: string;
  quality: string;
  aspectRatio: string;
  audio: boolean;
  multiShot: boolean;
  imageRef: string | null;
  notes: string;
  objective: string;
  emotion: string;
  motif: string;
  hookText: string | null;
  transition: string;
  musicSection: string;
};

type VideoModelConstraint = {
  qualities: string[];
  durations: {min: number; max: number} | number[];
  aspectRatios: string[];
};

type ImageModelConstraint = {
  qualities: string[];
  aspectRatios?: string[];
  aspectRatiosByQuality?: Record<string, string[]>;
  requiresDetailLevel?: boolean;
};

const STANDARD_VIDEO_ASPECT_RATIOS = ['16:9', '4:3', '1:1', '3:4', '9:16', '3:2', '2:3'];
const WIDE_VIDEO_ASPECT_RATIOS = [...STANDARD_VIDEO_ASPECT_RATIOS, '21:9'];
const VERTICAL_VIDEO_ASPECT_RATIOS = ['16:9', '9:16'];
const COMMON_IMAGE_ASPECT_RATIOS = ['1:1', '16:9', '9:16', '4:3', '3:4', '5:4', '4:5', '3:2', '2:3', '21:9'];
const EXTENDED_IMAGE_ASPECT_RATIOS = [...COMMON_IMAGE_ASPECT_RATIOS, '2:1', '1:2'];
const AUTO_IMAGE_ASPECT_RATIOS = ['auto', ...EXTENDED_IMAGE_ASPECT_RATIOS];

const VIDEO_MODEL_CONSTRAINTS: Record<string, VideoModelConstraint> = {
  v6: {
    qualities: ['360p', '540p', '720p', '1080p'],
    durations: {min: 1, max: 15},
    aspectRatios: WIDE_VIDEO_ASPECT_RATIOS,
  },
  'pixverse-c1': {
    qualities: ['360p', '540p', '720p', '1080p'],
    durations: {min: 1, max: 15},
    aspectRatios: STANDARD_VIDEO_ASPECT_RATIOS,
  },
  'v5.6': {
    qualities: ['360p', '480p', '540p', '720p', '1080p'],
    durations: {min: 1, max: 10},
    aspectRatios: STANDARD_VIDEO_ASPECT_RATIOS,
  },
  'v5.5': {
    qualities: ['360p', '480p', '540p', '720p', '1080p'],
    durations: {min: 1, max: 10},
    aspectRatios: STANDARD_VIDEO_ASPECT_RATIOS,
  },
  v5: {
    qualities: ['360p', '480p', '540p', '720p', '1080p'],
    durations: {min: 1, max: 10},
    aspectRatios: STANDARD_VIDEO_ASPECT_RATIOS,
  },
  'sora-2': {
    qualities: ['720p'],
    durations: [4, 8, 12],
    aspectRatios: VERTICAL_VIDEO_ASPECT_RATIOS,
  },
  'sora-2-pro': {
    qualities: ['720p', '1080p'],
    durations: [4, 8, 12],
    aspectRatios: VERTICAL_VIDEO_ASPECT_RATIOS,
  },
  'veo-3.1-standard': {
    qualities: ['720p', '1080p', '2160p'],
    durations: [4, 6, 8],
    aspectRatios: VERTICAL_VIDEO_ASPECT_RATIOS,
  },
  'veo-3.1-fast': {
    qualities: ['720p', '1080p', '2160p'],
    durations: [4, 6, 8],
    aspectRatios: VERTICAL_VIDEO_ASPECT_RATIOS,
  },
  'veo-3.1-lite': {
    qualities: ['720p', '1080p'],
    durations: [4, 6, 8],
    aspectRatios: VERTICAL_VIDEO_ASPECT_RATIOS,
  },
  'grok-imagine': {
    qualities: ['480p', '720p'],
    durations: {min: 1, max: 15},
    aspectRatios: STANDARD_VIDEO_ASPECT_RATIOS,
  },
  'happyhorse-1.0': {
    qualities: ['720p', '1080p'],
    durations: {min: 3, max: 15},
    aspectRatios: ['16:9', '9:16', '1:1', '4:3', '3:4'],
  },
  'seedance-2.0-standard': {
    qualities: ['480p', '720p', '1080p'],
    durations: {min: 4, max: 15},
    aspectRatios: ['16:9', '4:3', '1:1', '3:4', '9:16', '21:9'],
  },
  'seedance-2.0-fast': {
    qualities: ['480p', '720p'],
    durations: {min: 4, max: 15},
    aspectRatios: ['16:9', '4:3', '1:1', '3:4', '9:16', '21:9'],
  },
  'kling-o3-pro': {
    qualities: ['720p'],
    durations: {min: 3, max: 15},
    aspectRatios: ['16:9', '9:16', '1:1'],
  },
  'kling-o3-standard': {
    qualities: ['720p'],
    durations: {min: 3, max: 15},
    aspectRatios: ['16:9', '9:16', '1:1'],
  },
  'kling-3.0-pro': {
    qualities: ['720p'],
    durations: {min: 3, max: 15},
    aspectRatios: ['16:9', '9:16', '1:1'],
  },
  'kling-3.0-standard': {
    qualities: ['720p'],
    durations: {min: 3, max: 15},
    aspectRatios: ['16:9', '9:16', '1:1'],
  },
};

const IMAGE_MODEL_CONSTRAINTS: Record<string, ImageModelConstraint> = {
  'qwen-image': {
    qualities: ['720p', '1080p'],
    aspectRatios: COMMON_IMAGE_ASPECT_RATIOS,
  },
  'gpt-image-2.0': {
    qualities: ['1080p', '1440p', '2160p'],
    aspectRatios: EXTENDED_IMAGE_ASPECT_RATIOS,
  },
  'seedream-5.0-lite': {
    qualities: ['1440p', '1800p', '2160p', 'auto'],
    aspectRatios: AUTO_IMAGE_ASPECT_RATIOS,
  },
  'seedream-4.5': {
    qualities: ['1440p', '2160p', 'auto'],
    aspectRatios: AUTO_IMAGE_ASPECT_RATIOS,
  },
  'seedream-4.0': {
    qualities: ['1080p', '1440p', '2160p', 'auto'],
    aspectRatios: AUTO_IMAGE_ASPECT_RATIOS,
  },
  'gemini-2.5-flash': {
    qualities: ['1080p', 'auto'],
    aspectRatios: AUTO_IMAGE_ASPECT_RATIOS,
  },
  'gemini-3.0': {
    qualities: ['1080p', '1440p', '2160p', 'auto'],
    aspectRatios: AUTO_IMAGE_ASPECT_RATIOS,
  },
  'gemini-3.1-flash': {
    qualities: ['512p', '1080p', '1440p', '2160p', 'auto'],
    aspectRatios: AUTO_IMAGE_ASPECT_RATIOS,
  },
  'kling-image-o3': {
    qualities: ['1080p', '1440p', '2160p'],
    aspectRatios: ['16:9', '9:16', '1:1', '4:3', '3:4', '3:2', '2:3', '21:9'],
  },
  'kling-image-v3': {
    qualities: ['1080p', '1440p'],
    aspectRatios: ['16:9', '9:16', '1:1', '4:3', '3:4', '3:2', '2:3', '21:9'],
  },
};

type ValidationResult = {
  ok: boolean;
  errors: string[];
  warnings: string[];
};

type RunSummary = {
  failed: number;
  generatedImages: number;
  generatedVideos: number;
  stagedVideos: number;
  creditsConsumed: number;
  finalRender: string | null;
};

type CreditBreakdown = {
  shotGeneration: number;
  imageGeneration: number;
  postProcessing: {
    extend: number;
    upscale: number;
    sound: number;
    speech: number;
  };
};

type ShotCreditReport = {
  shotId: string;
  model: string;
  credits: number;
  imageCredits: number;
  videoCredits: number;
  retries: number;
};

type CreditReportData = {
  totalCreditsConsumed: number;
  breakdown: CreditBreakdown;
  perShot: ShotCreditReport[];
  accountBalanceBefore: number | null;
  accountBalanceAfter: number | null;
};

type StagedAssets = {
  audioRelative: string;
  stagedStills: Map<string, string[]>;
  creditReport: CreditReportData;
};

type PipelinePlan = {
  project: {
    slug: string;
    title: string;
    date: string;
  };
  generation: {
    mode: ProjectConfigInput['assets']['mode'];
    workflow: ProjectConfigInput['generation']['workflow'];
  };
  totals: {
    sceneCount: number;
    durationSeconds: number;
    durationInFrames: number;
    imageJobs: number;
    videoJobs: number;
  };
  creditEstimate: {
    totalCredits: number | null;
    videoCredits: number;
    imageCredits: number;
    postProcessingCredits: number;
    warnings: string[];
    perShot: Array<{
      shotId: string;
      sceneId: string;
      videoCredits: number | null;
      imageCredits: number;
      totalCredits: number | null;
      note: string | null;
    }>;
  };
  files: {
    configPath: string;
    storyboardPath: string;
    briefPath: string | null;
    distDir: string;
    renderOutputPath: string;
    sourceDir: string;
  };
  commands: string[];
  shots: Array<{
    shotId: string;
    sceneId: string;
    durationSeconds: number;
    durationIntent: string;
    model: string;
    needsReferenceImage: boolean;
    localVideoSource: string | null;
  }>;
  validation: ValidationResult;
};

export type ExecutePipelineOptions = {
  dryRun: boolean;
  mode: Exclude<PipelineCommand, 'doctor' | 'export' | 'plan' | 'validate'>;
  runId?: string;
};

export type ExecutePipelineResult = {
  plan: PipelinePlan;
  manifestPath: string;
  renderOutputPath: string;
  summary: RunSummary;
  dryRunFiles?: {
    planPath: string;
    summaryPath: string;
    manifestPath: string;
  };
};

export type MichibikiEngine = 'auto' | 'editframe' | 'hyperframes' | 'remotion';
export type MichibikiOutputType = 'code' | 'mp4' | 'preview' | 'project' | 'webm';
export type MichibikiLicenseMode = 'client-work' | 'commercial' | 'oss' | 'personal';

type MichibikiAsset = {
  id: string;
  type: 'audio' | 'image' | 'json' | 'subtitle' | 'url' | 'video';
  source: string;
  usage?: 'avatar' | 'background' | 'broll' | 'data' | 'music' | 'voice';
};

type MichibikiVideoSpec = {
  id: string;
  title: string;
  goal: string;
  format: {
    aspectRatio: '1:1' | '16:9' | '4:5' | '9:16';
    width: number;
    height: number;
    fps: number;
    durationSec: number;
  };
  style: {
    mood: string;
    visualTone: string;
    motionStyle: string;
    reference?: string;
  };
  content: {
    script?: string;
    captions?: boolean;
    scenes: Array<{
      id: string;
      order: number;
      durationSec: number;
      description: string;
      text?: string;
      assets?: string[];
      camera?: string;
      transition?: string;
      motion?: string;
    }>;
    cta?: string;
  };
  assets: MichibikiAsset[];
  output: {
    type: MichibikiOutputType;
    needsDownload: boolean;
  };
  constraints: {
    enginePreference?: Exclude<MichibikiEngine, 'auto'>;
    licenseMode?: MichibikiLicenseMode;
    allowCloudRender?: boolean;
  };
};

export type MichibikiExportOptions = {
  outputPath?: string;
  handoffPath?: string;
  engine?: MichibikiEngine;
  outputType?: MichibikiOutputType;
  licenseMode?: MichibikiLicenseMode;
  allowCloudRender?: boolean;
  michibikiPath?: string;
  runMichibiki?: boolean;
  dryRun?: boolean;
};

export type MichibikiExportResult = {
  ok: boolean;
  generatedAt: string;
  project: {
    slug: string;
    title: string;
  };
  source: {
    configPath: string;
    storyboardPath: string;
    briefPath: string | null;
    manifestPath: string;
  };
  videoSpecPath: string;
  handoffPath: string;
  videoSpec: MichibikiVideoSpec;
  michibiki: {
    optional: true;
    path: string | null;
    engine: MichibikiEngine;
    command: string[];
    cwd: string | null;
    ran: boolean;
    dryRun: boolean;
    status: number | null;
    stdout: string;
    stderr: string;
    note: string;
  };
};

const quote = (value: string) => {
  return JSON.stringify(value);
};

const ensureDir = (dirPath: string) => {
  fs.mkdirSync(dirPath, {recursive: true});
};

const resolveFrom = (baseDir: string, targetPath: string) => {
  return path.isAbsolute(targetPath) ? targetPath : path.resolve(baseDir, targetPath);
};

const formatPattern = (pattern: string, index: number) => {
  const match = pattern.match(/%0?(\d+)d/);
  if (!match) {
    return pattern.replace('%d', String(index));
  }

  const width = Number(match[1]);
  const padded = String(index).padStart(width, '0');
  return pattern.replace(match[0], padded);
};

const briefToBody = (briefText: string | null) => {
  if (!briefText) {
    return '';
  }

  const content = briefText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#') && !line.startsWith('- '))
    .slice(0, 3)
    .join(' ');

  return content;
};

const jsonCommand = (bin: string, args: string[], cwd: string) => {
  try {
    const stdout = execFileSync(bin, args, {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    return JSON.parse(stdout);
  } catch (error) {
    const typed = error as Error & {
      stdout?: string | Buffer;
      stderr?: string | Buffer;
      status?: number;
    };
    const stdout = typed.stdout ? String(typed.stdout) : '';
    const stderr = typed.stderr ? String(typed.stderr) : '';
    const detail = [stdout.trim(), stderr.trim()].filter(Boolean).join('\n');
    throw new Error(
      detail.length > 0
        ? `${bin} ${args.join(' ')} failed\n${detail}`
        : `${bin} ${args.join(' ')} failed with exit ${typed.status ?? 'unknown'}`,
    );
  }
};

const shellCommand = (bin: string, args: string[], cwd: string) => {
  const result = spawnSync(bin, args, {
    cwd,
    stdio: 'inherit',
  });

  if (typeof result.status === 'number' && result.status !== 0) {
    throw new Error(`${bin} ${args.join(' ')} failed with exit ${result.status}`);
  }
};

const sceneNumber = (index: number) => String(index + 1).padStart(2, '0');

const toEven = (value: number) => {
  const rounded = Math.round(value);
  return rounded % 2 === 0 ? rounded : rounded + 1;
};

const parseQualityBase = (quality: string) => {
  const match = quality.match(/(\d+)/);
  return match ? Number(match[1]) : 1080;
};

const parseAspectRatio = (aspectRatio: string) => {
  const [widthRaw, heightRaw] = aspectRatio.split(':').map(Number);

  if (!widthRaw || !heightRaw) {
    return {widthUnit: 16, heightUnit: 9};
  }

  return {widthUnit: widthRaw, heightUnit: heightRaw};
};

const getTargetDimensions = (quality: string, aspectRatio: string) => {
  const base = parseQualityBase(quality);
  const {widthUnit, heightUnit} = parseAspectRatio(aspectRatio);
  const ratio = widthUnit / heightUnit;

  if (ratio >= 1) {
    return {
      width: toEven(base * ratio),
      height: toEven(base),
    };
  }

  return {
    width: toEven(base),
    height: toEven(base / ratio),
  };
};

const normalizeReferenceImage = (
  inputPath: string,
  outputPath: string,
  quality: string,
  aspectRatio: string,
) => {
  const {width, height} = getTargetDimensions(quality, aspectRatio);
  ensureDir(path.dirname(outputPath));

  execFileSync(
    'sips',
    ['-s', 'format', 'jpeg', '-z', String(height), String(width), inputPath, '--out', outputPath],
    {
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );

  return outputPath;
};

const formatAllowed = (values: Array<string | number>) => {
  return values.map(String).join(', ');
};

const supportedImageAspectRatios = (constraint: ImageModelConstraint, quality: string) => {
  return constraint.aspectRatiosByQuality?.[quality] ?? constraint.aspectRatios ?? [];
};

const validateVideoModelForShot = (shot: NormalizedShot, errors: string[], warnings: string[]) => {
  const constraint = VIDEO_MODEL_CONSTRAINTS[shot.model];

  if (!constraint) {
    warnings.push(`Unknown video model for ${shot.sceneId}: ${shot.model}; PixVerse CLI validation is authoritative.`);
    return;
  }

  if (!Number.isInteger(shot.durationSeconds)) {
    errors.push(`Duration must be an integer number of seconds for ${shot.sceneId}: ${shot.durationSeconds}`);
  }

  if (Array.isArray(constraint.durations)) {
    if (!constraint.durations.includes(shot.durationSeconds)) {
      errors.push(
        `Duration ${shot.durationSeconds}s is not supported by ${shot.model} for ${shot.sceneId}; allowed: ${formatAllowed(constraint.durations)}`,
      );
    }
  } else if (shot.durationSeconds < constraint.durations.min || shot.durationSeconds > constraint.durations.max) {
    errors.push(
      `Duration ${shot.durationSeconds}s is not supported by ${shot.model} for ${shot.sceneId}; allowed: ${constraint.durations.min}-${constraint.durations.max}s`,
    );
  }

  if (!constraint.qualities.includes(shot.quality)) {
    errors.push(
      `Quality ${shot.quality} is not supported by ${shot.model} for ${shot.sceneId}; allowed: ${formatAllowed(constraint.qualities)}`,
    );
  }

  if (!constraint.aspectRatios.includes(shot.aspectRatio)) {
    errors.push(
      `Aspect ratio ${shot.aspectRatio} is not supported by ${shot.model} for ${shot.sceneId}; allowed: ${formatAllowed(constraint.aspectRatios)}`,
    );
  }
};

const validateImageGenerationOptions = (loaded: LoadedProjectConfig, errors: string[], warnings: string[]) => {
  if (
    loaded.assets.mode !== 'pixverse' ||
    loaded.generation.workflow !== 'i2v' ||
    !loaded.generation.image.enabled ||
    !loaded.normalizedShots.some((shot) => shot.imageRef === 'generate' || shot.imageRef === null)
  ) {
    return;
  }

  const model = loaded.storyboard.image_generation?.model ?? loaded.generation.image.model;
  const quality = loaded.storyboard.image_generation?.quality ?? loaded.generation.image.quality;
  const aspectRatio = loaded.storyboard.image_generation?.aspect_ratio ?? loaded.generation.image.aspectRatio;
  const detailLevel = loaded.storyboard.image_generation?.detail_level ?? loaded.generation.image.detailLevel;
  const constraint = IMAGE_MODEL_CONSTRAINTS[model];

  if (!constraint) {
    warnings.push(`Unknown image model: ${model}; PixVerse CLI validation is authoritative.`);
    return;
  }

  if (!constraint.qualities.includes(quality)) {
    errors.push(`Image quality ${quality} is not supported by ${model}; allowed: ${formatAllowed(constraint.qualities)}`);
  }

  const aspectRatios = supportedImageAspectRatios(constraint, quality);
  if (aspectRatios.length > 0 && !aspectRatios.includes(aspectRatio)) {
    errors.push(`Image aspect ratio ${aspectRatio} is not supported by ${model} at ${quality}; allowed: ${formatAllowed(aspectRatios)}`);
  }

  if (constraint.requiresDetailLevel && !detailLevel) {
    errors.push(`Image model ${model} requires generation.image.detailLevel or image_generation.detail_level.`);
  }
};

const normalizeVideoModelId = (model: string) => {
  return model.toLowerCase() === 'c1' ? 'pixverse-c1' : model;
};

const buildNormalizedShots = (
  config: ProjectConfigInput,
  storyboard: StoryboardInput,
): NormalizedShot[] => {
  const workflow = config.generation.workflow ?? storyboard.meta.workflow ?? 'i2v';

  return storyboard.shots.map((shot, index) => ({
    index,
    sourceId: shot.id,
    sceneId: `scene-${sceneNumber(index)}`,
    prompt: shot.prompt,
    durationSeconds: shot.duration,
    model: normalizeVideoModelId(shot.model ?? config.generation.model),
    quality: shot.quality ?? config.generation.quality,
    aspectRatio: shot.aspect_ratio ?? config.generation.aspectRatio,
    audio: shot.audio ?? false,
    multiShot: shot.multi_shot ?? false,
    imageRef:
      workflow === 'i2v'
        ? shot.image_ref === undefined
          ? 'generate'
          : shot.image_ref
        : null,
    notes: shot.notes ?? '',
    objective: shot.objective ?? shot.notes ?? '',
    emotion: shot.emotion ?? '',
    motif: shot.motif ?? '',
    hookText: shot.hookText ?? null,
    transition: shot.transition ?? 'cut',
    musicSection: shot.music_section ?? `section-${index + 1}`,
  }));
};

export const loadProjectConfig = async (configPath: string): Promise<LoadedProjectConfig> => {
  const absoluteConfigPath = path.resolve(configPath);
  const configDir = path.dirname(absoluteConfigPath);
  const rawConfig = parseYaml(fs.readFileSync(absoluteConfigPath, 'utf8'));
  const projectConfig = ProjectConfigSchema.parse(rawConfig);
  const storyboardPath = resolveFrom(configDir, projectConfig.inputs.storyboard);
  const storyboardRaw = parseYaml(fs.readFileSync(storyboardPath, 'utf8'));
  const storyboard = StoryboardSchema.parse(storyboardRaw);
  const briefPath = projectConfig.inputs.brief
    ? resolveFrom(configDir, projectConfig.inputs.brief)
    : undefined;
  const briefText = briefPath && fs.existsSync(briefPath)
    ? fs.readFileSync(briefPath, 'utf8')
    : null;
  const distDir = path.resolve(configDir, 'dist');
  const renderOutputPath = resolveFrom(configDir, projectConfig.render.output);
  const normalizedShots = buildNormalizedShots(projectConfig, storyboard);

  return {
    configPath: absoluteConfigPath,
    configDir,
    project: projectConfig.project,
    inputs: {
      briefPath,
      storyboardPath,
    },
    assets: projectConfig.assets,
    generation: {
      ...projectConfig.generation,
      workflow: projectConfig.generation.workflow ?? storyboard.meta.workflow ?? 'i2v',
    },
    render: {
      ...projectConfig.render,
      fps: projectConfig.render.fps ?? storyboard.meta.fps ?? 30,
    },
    theme: projectConfig.theme,
    manifestOptions: projectConfig.manifest,
    storyboard,
    briefText,
    distDir,
    renderOutputPath,
    normalizedShots,
  };
};

const localAssetPathForShot = (loaded: LoadedProjectConfig, shot: NormalizedShot, kind: 'video' | 'still') => {
  const root = resolveFrom(loaded.configDir, loaded.assets.sourceDir);
  const pattern = kind === 'video' ? loaded.assets.videoPattern : loaded.assets.stillPattern;
  return path.join(root, formatPattern(pattern, shot.index + 1));
};

const distVideoPathForShot = (loaded: LoadedProjectConfig, shot: NormalizedShot) => {
  return path.join(loaded.distDir, `${shot.sceneId}.mp4`);
};

const UNIFORM_DURATION_MIN_SHOTS = 3;

const normalizeTargetDuration = (target: number | {min: number; max: number}) => {
  return typeof target === 'number' ? {min: target, max: target} : target;
};

const validateShotPacing = (loaded: LoadedProjectConfig, errors: string[], warnings: string[]) => {
  const shots = loaded.normalizedShots;
  const totalSeconds = shots.reduce((sum, shot) => sum + shot.durationSeconds, 0);
  const blocksGeneration = loaded.assets.mode === 'pixverse';

  if (shots.length >= UNIFORM_DURATION_MIN_SHOTS) {
    const uniqueDurations = new Set(shots.map((shot) => shot.durationSeconds));
    if (uniqueDurations.size === 1) {
      const rawReason = loaded.storyboard.meta.uniform_duration_reason;
      const reason = typeof rawReason === 'string' ? rawReason.trim() : '';
      if (loaded.storyboard.meta.allow_uniform_duration && reason) {
        warnings.push(`Uniform shot duration explicitly allowed by storyboard meta: ${reason}`);
      } else {
        const message =
          `All ${shots.length} shots share the same duration (${shots[0].durationSeconds}s); ` +
          'durations must follow each shot\'s narrative role before PixVerse generation. ' +
          'Set varied shot.duration values, or set meta.allow_uniform_duration: true with meta.uniform_duration_reason only when the brief explicitly requires uniform pacing.';
        if (blocksGeneration) {
          errors.push(message);
        } else {
          warnings.push(message);
        }
      }
    }
  }

  const target = loaded.storyboard.meta.target_duration_seconds;
  if (target === undefined) {
    const message =
      'meta.target_duration_seconds is not set; add the brief Target Duration to the storyboard so total pacing can be checked.';
    if (blocksGeneration) {
      errors.push(message);
    } else {
      warnings.push(message);
    }
    return;
  }

  const {min, max} = normalizeTargetDuration(target);
  if (totalSeconds < min || totalSeconds > max) {
    const message =
      `Total shot duration ${totalSeconds}s is outside meta.target_duration_seconds ${min}-${max}s; ` +
      'rebalance per-shot durations to fit the story target before generation.';
    if (blocksGeneration) {
      errors.push(message);
    } else {
      warnings.push(message);
    }
  }
};

const validateConfig = (loaded: LoadedProjectConfig): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!fs.existsSync(loaded.inputs.storyboardPath)) {
    errors.push(`Storyboard not found: ${loaded.inputs.storyboardPath}`);
  }

  if (loaded.inputs.briefPath && !fs.existsSync(loaded.inputs.briefPath)) {
    warnings.push(`Brief not found: ${loaded.inputs.briefPath}`);
  }

  if (loaded.assets.mode === 'local') {
    const sourceDir = resolveFrom(loaded.configDir, loaded.assets.sourceDir);
    if (!fs.existsSync(sourceDir)) {
      errors.push(`Local sourceDir not found: ${sourceDir}`);
    }

    const audioPath = path.join(sourceDir, loaded.assets.audio);
    if (!fs.existsSync(audioPath)) {
      errors.push(`Audio asset not found: ${audioPath}`);
    }

    for (const shot of loaded.normalizedShots) {
      const sourceVideo = localAssetPathForShot(loaded, shot, 'video');
      if (!fs.existsSync(sourceVideo)) {
        errors.push(`Scene video not found for ${shot.sceneId}: ${sourceVideo}`);
      }

      if (loaded.assets.copyStills) {
        const sourceStill = localAssetPathForShot(loaded, shot, 'still');
        if (!fs.existsSync(sourceStill)) {
          warnings.push(`Reference still missing for ${shot.sceneId}: ${sourceStill}`);
        }
      }
    }
  }

  if (loaded.assets.mode === 'pixverse' && loaded.generation.workflow === 'i2v' && !loaded.generation.image.enabled) {
    warnings.push('I2V workflow is enabled but generation.image.enabled is false; local image_ref paths are required.');
  }

  validateImageGenerationOptions(loaded, errors, warnings);

  for (const shot of loaded.normalizedShots) {
    validateVideoModelForShot(shot, errors, warnings);
  }

  validateShotPacing(loaded, errors, warnings);

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
};

const buildPixverseCommandsForShot = (loaded: LoadedProjectConfig, shot: NormalizedShot) => {
  const commands: string[] = [];

  if (loaded.assets.mode === 'pixverse' && loaded.generation.workflow === 'i2v') {
    if (shot.imageRef === 'generate' || shot.imageRef === null) {
      const imageArgs = [
        'pixverse create image',
        '--prompt',
        quote(shot.prompt),
        '--model',
        loaded.storyboard.image_generation?.model ?? loaded.generation.image.model,
        '--quality',
        loaded.storyboard.image_generation?.quality ?? loaded.generation.image.quality,
        '--aspect-ratio',
        loaded.storyboard.image_generation?.aspect_ratio ?? loaded.generation.image.aspectRatio,
      ];
      const detailLevel = loaded.storyboard.image_generation?.detail_level ?? loaded.generation.image.detailLevel;

      if (detailLevel) {
        imageArgs.push('--detail-level', detailLevel);
      }

      imageArgs.push('--json');
      commands.push(imageArgs.join(' '));
    }
  }

  if (loaded.assets.mode === 'pixverse') {
    const baseArgs = [
      'pixverse create video',
      '--prompt',
      quote(shot.prompt),
      '--model',
      shot.model,
      '--duration',
      String(shot.durationSeconds),
      '--quality',
      shot.quality,
      '--aspect-ratio',
      shot.aspectRatio,
    ];

    if (loaded.generation.workflow === 'i2v') {
      baseArgs.push('--image', quote(`dist/ref-${shot.sceneId}.*`));
    }

    if (shot.audio) {
      baseArgs.push('--audio');
    }

    if (shot.multiShot) {
      baseArgs.push('--multi-shot');
    }

    if (loaded.generation.offPeak) {
      baseArgs.push('--off-peak');
    }

    baseArgs.push('--json');
    commands.push(baseArgs.join(' '));
    commands.push(`pixverse asset download <asset-id> --dest ${quote(path.join(loaded.distDir, '.downloads'))} --json`);
  }

  return commands;
};

export const describeConfigForCli = (loaded: LoadedProjectConfig) => {
  const validation = validateConfig(loaded);
  return {
    project: loaded.project,
    generation: {
      mode: loaded.assets.mode,
      workflow: loaded.generation.workflow,
    },
    files: {
      configPath: loaded.configPath,
      storyboardPath: loaded.inputs.storyboardPath,
      briefPath: loaded.inputs.briefPath ?? null,
      distDir: loaded.distDir,
      renderOutputPath: loaded.renderOutputPath,
    },
    scenes: loaded.normalizedShots.length,
    validation,
  };
};

const VIDEO_PER_SECOND_CREDIT_RATES: Record<string, Record<string, {noAudio: number; audio: number}>> = {
  v6: {
    '360p': {noAudio: 5, audio: 7},
    '540p': {noAudio: 7, audio: 9},
    '720p': {noAudio: 9, audio: 12},
    '1080p': {noAudio: 18, audio: 23},
  },
  'pixverse-c1': {
    '360p': {noAudio: 6, audio: 8},
    '540p': {noAudio: 8, audio: 10},
    '720p': {noAudio: 10, audio: 13},
    '1080p': {noAudio: 19, audio: 24},
  },
};

const V56_FIXED_CREDIT_RATES: Record<string, Record<number, {noAudio: number; audio: number}>> = {
  '360p': {
    5: {noAudio: 35, audio: 80},
    8: {noAudio: 70, audio: 115},
    10: {noAudio: 77, audio: 122},
  },
  '540p': {
    5: {noAudio: 35, audio: 90},
    8: {noAudio: 70, audio: 115},
    10: {noAudio: 77, audio: 122},
  },
  '720p': {
    5: {noAudio: 45, audio: 80},
    8: {noAudio: 90, audio: 135},
    10: {noAudio: 99, audio: 144},
  },
  '1080p': {
    5: {noAudio: 75, audio: 150},
    8: {noAudio: 150, audio: 195},
  },
};

const estimateVideoCreditsForShot = (shot: NormalizedShot) => {
  const perSecond = VIDEO_PER_SECOND_CREDIT_RATES[shot.model]?.[shot.quality];
  if (perSecond) {
    return {
      credits: shot.durationSeconds * (shot.audio ? perSecond.audio : perSecond.noAudio),
      note: null,
    };
  }

  const fixed = shot.model === 'v5.6' ? V56_FIXED_CREDIT_RATES[shot.quality]?.[shot.durationSeconds] : undefined;
  if (fixed) {
    return {
      credits: shot.audio ? fixed.audio : fixed.noAudio,
      note: null,
    };
  }

  return {
    credits: null,
    note: `No local credit table for ${shot.model} ${shot.quality}; measure from account balance.`,
  };
};

const buildCreditEstimate = (loaded: LoadedProjectConfig, imageJobs: number) => {
  const imageCredits = imageJobs;
  const warnings: string[] = [];
  let videoCredits = 0;
  let hasUnknown = false;

  const perShot = loaded.normalizedShots.map((shot) => {
    const videoEstimate = loaded.assets.mode === 'pixverse'
      ? estimateVideoCreditsForShot(shot)
      : {credits: 0, note: null};
    const shotImageCredits =
      loaded.assets.mode === 'pixverse' &&
      loaded.generation.workflow === 'i2v' &&
      (shot.imageRef === 'generate' || shot.imageRef === null)
        ? 1
        : 0;

    if (videoEstimate.credits === null) {
      hasUnknown = true;
      if (videoEstimate.note) {
        warnings.push(videoEstimate.note);
      }
    } else {
      videoCredits += videoEstimate.credits;
    }

    return {
      shotId: shot.sourceId,
      sceneId: shot.sceneId,
      videoCredits: videoEstimate.credits,
      imageCredits: shotImageCredits,
      totalCredits: videoEstimate.credits === null ? null : videoEstimate.credits + shotImageCredits,
      note: videoEstimate.note,
    };
  });

  if (imageJobs > 0) {
    warnings.push('Image generation credits are provisional at 1 credit per generated reference image.');
  }

  return {
    totalCredits: hasUnknown ? null : videoCredits + imageCredits,
    videoCredits,
    imageCredits,
    postProcessingCredits: 0,
    warnings: Array.from(new Set(warnings)),
    perShot,
  };
};

export const buildPipelinePlan = (loaded: LoadedProjectConfig): PipelinePlan => {
  const durationSeconds = loaded.normalizedShots.reduce((sum, shot) => sum + shot.durationSeconds, 0);
  const durationInFrames = Math.round(durationSeconds * loaded.render.fps);
  const imageJobs = loaded.assets.mode === 'pixverse' && loaded.generation.workflow === 'i2v'
    ? loaded.normalizedShots.filter((shot) => shot.imageRef === 'generate' || shot.imageRef === null).length
    : 0;
  const videoJobs = loaded.assets.mode === 'pixverse' ? loaded.normalizedShots.length : 0;
  const validation = validateConfig(loaded);
  const commands = loaded.normalizedShots.flatMap((shot) => buildPixverseCommandsForShot(loaded, shot));
  const creditEstimate = buildCreditEstimate(loaded, imageJobs);

  commands.push(
    `node ${quote(path.relative(loaded.configDir, path.resolve(loaded.configDir, 'scripts/prepare-public-assets.mjs')))}`,
    `npx remotion render src/index.ts ${loaded.render.compositionId} ${quote(loaded.renderOutputPath)} --codec=h264 --crf=18 --audio-bitrate=320k`,
  );

  return {
    project: {
      slug: loaded.project.slug,
      title: loaded.project.title,
      date: loaded.project.date,
    },
    generation: {
      mode: loaded.assets.mode,
      workflow: loaded.generation.workflow,
    },
    totals: {
      sceneCount: loaded.normalizedShots.length,
      durationSeconds,
      durationInFrames,
      imageJobs,
      videoJobs,
    },
    creditEstimate,
    files: {
      configPath: loaded.configPath,
      storyboardPath: loaded.inputs.storyboardPath,
      briefPath: loaded.inputs.briefPath ?? null,
      distDir: loaded.distDir,
      renderOutputPath: loaded.renderOutputPath,
      sourceDir: resolveFrom(loaded.configDir, loaded.assets.sourceDir),
    },
    commands,
    shots: loaded.normalizedShots.map((shot) => ({
      shotId: shot.sourceId,
      sceneId: shot.sceneId,
      durationSeconds: shot.durationSeconds,
      durationIntent: shot.notes || shot.objective || shot.musicSection,
      model: shot.model,
      needsReferenceImage:
        loaded.assets.mode === 'pixverse' &&
        loaded.generation.workflow === 'i2v' &&
        (shot.imageRef === 'generate' || shot.imageRef === null),
      localVideoSource: loaded.assets.mode === 'local' ? localAssetPathForShot(loaded, shot, 'video') : null,
    })),
    validation,
  };
};

const formatCredits = (credits: number | null) => {
  return credits === null ? 'unknown' : `${credits} cr`;
};

export const formatPipelinePlanMarkdown = (plan: PipelinePlan) => {
  const configArg = quote(plan.files.configPath);
  const lines = [
    '# PixVerse Shotpack Plan',
    '',
    '## Summary',
    '',
    `- Project: ${plan.project.title}`,
    `- Asset mode: ${plan.generation.mode}`,
    `- Workflow: ${plan.generation.workflow}`,
    `- Scenes: ${plan.totals.sceneCount}`,
    `- Duration: ${plan.totals.durationSeconds}s / ${plan.totals.durationInFrames} frames`,
    `- Estimated credits: ${formatCredits(plan.creditEstimate.totalCredits)}`,
    '',
    '## Gate 1 Checklist',
    '',
    `- Validation: ${plan.validation.ok ? 'ok' : 'needs fixes'}`,
    `- Image jobs: ${plan.totals.imageJobs}`,
    `- Video jobs: ${plan.totals.videoJobs}`,
    `- Render output: ${plan.files.renderOutputPath}`,
    '',
    '## Shots',
    '',
    '| shot | scene | duration | intent | model | ref image | estimated credits |',
    '|------|-------|----------|--------|-------|-----------|-------------------|',
    ...plan.shots.map((shot, index) => {
      const estimate = plan.creditEstimate.perShot[index];
      return `| ${shot.shotId} | ${shot.sceneId} | ${shot.durationSeconds}s | ${shot.durationIntent.replace(/\|/g, '/')} | ${shot.model} | ${shot.needsReferenceImage ? 'yes' : 'no'} | ${formatCredits(estimate?.totalCredits ?? null)} |`;
    }),
    '',
  ];

  if (plan.validation.errors.length > 0) {
    lines.push('## Validation Errors', '', ...plan.validation.errors.map((error) => `- ${error}`), '');
  }

  if (plan.validation.warnings.length > 0 || plan.creditEstimate.warnings.length > 0) {
    lines.push(
      '## Warnings',
      '',
      ...[...plan.validation.warnings, ...plan.creditEstimate.warnings].map((warning) => `- ${warning}`),
      '',
    );
  }

  lines.push(
    '## Next Commands',
    '',
    '```bash',
    `./bin/pipeline run --config ${configArg} --dry-run`,
    `./bin/pipeline run --config ${configArg}`,
    `./bin/pipeline render --config ${configArg}`,
    '```',
    '',
  );

  return lines.join('\n');
};

type DoctorCheck = {
  name: string;
  status: 'error' | 'ok' | 'warn';
  message: string;
};

export type DoctorReport = {
  ok: boolean;
  generatedAt: string;
  project: {
    slug: string;
    title: string;
  };
  checks: DoctorCheck[];
};

const captureCommand = (bin: string, args: string[], cwd: string) => {
  const result = spawnSync(bin, args, {
    cwd,
    encoding: 'utf8',
    timeout: 15000,
  });

  return {
    ok: result.status === 0,
    stdout: typeof result.stdout === 'string' ? result.stdout.trim() : '',
    stderr: typeof result.stderr === 'string' ? result.stderr.trim() : '',
    status: result.status,
    error: result.error,
  };
};

const parseVersion = (version: string) => {
  const match = version.match(/(\d+)\.(\d+)\.(\d+)/);
  return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : null;
};

const compareVersions = (left: string, right: string) => {
  const leftParts = parseVersion(left);
  const rightParts = parseVersion(right);

  if (!leftParts || !rightParts) {
    return 0;
  }

  for (let index = 0; index < 3; index += 1) {
    const delta = leftParts[index] - rightParts[index];
    if (delta !== 0) {
      return delta;
    }
  }

  return 0;
};

export const runDoctor = (loaded: LoadedProjectConfig): DoctorReport => {
  const checks: DoctorCheck[] = [];
  const nodeMajor = Number(process.versions.node.split('.')[0] ?? 0);

  checks.push({
    name: 'node',
    status: nodeMajor >= 20 ? 'ok' : 'error',
    message: `Node.js ${process.version}; PixVerse CLI requires Node.js >= 20.`,
  });

  for (const dependency of ['tsx', 'typescript', '@remotion/cli']) {
    const dependencyPath = path.join(loaded.configDir, 'node_modules', dependency);
    checks.push({
      name: `dependency:${dependency}`,
      status: fs.existsSync(dependencyPath) ? 'ok' : 'error',
      message: fs.existsSync(dependencyPath)
        ? `${dependency} is installed.`
        : `${dependency} is missing. Run npm install.`,
    });
  }

  const validation = validateConfig(loaded);
  checks.push({
    name: 'project-config',
    status: validation.ok ? (validation.warnings.length > 0 ? 'warn' : 'ok') : 'error',
    message: validation.ok
      ? validation.warnings.length > 0
        ? `Config is valid with ${validation.warnings.length} warning(s).`
        : 'Config is valid.'
      : validation.errors.join('; '),
  });

  const pixverseVersion = captureCommand('pixverse', ['--version'], loaded.configDir);
  if (!pixverseVersion.ok) {
    checks.push({
      name: 'pixverse-cli',
      status: 'error',
      message: 'pixverse command was not found or failed. Install with npm install -g pixverse@latest.',
    });
  } else {
    const latestVersion = captureCommand('npm', ['view', 'pixverse', 'version', '--json'], loaded.configDir);
    const latest = latestVersion.ok ? latestVersion.stdout.replace(/^"|"$/g, '') : null;
    const isOutdated = latest ? compareVersions(pixverseVersion.stdout, latest) < 0 : false;
    checks.push({
      name: 'pixverse-cli',
      status: isOutdated ? 'warn' : 'ok',
      message: latest
        ? `Installed pixverse ${pixverseVersion.stdout}; npm latest is ${latest}.`
        : `Installed pixverse ${pixverseVersion.stdout}; latest check skipped.`,
    });
  }

  const pixverseAuth = captureCommand('pixverse', ['auth', 'status', '--json'], loaded.configDir);
  checks.push({
    name: 'pixverse-auth',
    status: pixverseAuth.ok ? 'ok' : 'warn',
    message: pixverseAuth.ok
      ? 'PixVerse auth status succeeded.'
      : `PixVerse auth status failed: ${pixverseAuth.stderr || pixverseAuth.stdout || 'unknown error'}`,
  });

  const pixverseAccount = captureCommand('pixverse', ['account', 'info', '--json'], loaded.configDir);
  checks.push({
    name: 'pixverse-account',
    status: pixverseAccount.ok ? 'ok' : 'warn',
    message: pixverseAccount.ok
      ? 'PixVerse account info succeeded.'
      : `PixVerse account info failed: ${pixverseAccount.stderr || pixverseAccount.stdout || 'unknown error'}`,
  });

  const remotionBin = path.join(loaded.configDir, 'node_modules', '.bin', 'remotion');
  checks.push({
    name: 'remotion',
    status: fs.existsSync(remotionBin) ? 'ok' : 'error',
    message: fs.existsSync(remotionBin)
      ? 'Local Remotion binary is available.'
      : 'Local Remotion binary is missing. Run npm install.',
  });

  return {
    ok: checks.every((check) => check.status !== 'error'),
    generatedAt: new Date().toISOString(),
    project: {
      slug: loaded.project.slug,
      title: loaded.project.title,
    },
    checks,
  };
};

export const formatDoctorMarkdown = (report: DoctorReport) => {
  return [
    '# PixVerse Shotpack Doctor',
    '',
    `- Project: ${report.project.title}`,
    `- Status: ${report.ok ? 'ok' : 'needs fixes'}`,
    `- Generated: ${report.generatedAt}`,
    '',
    '| check | status | message |',
    '|-------|--------|---------|',
    ...report.checks.map((check) => `| ${check.name} | ${check.status} | ${check.message.replace(/\|/g, '/')} |`),
    '',
  ].join('\n');
};

const copyFile = (sourcePath: string, destinationPath: string) => {
  ensureDir(path.dirname(destinationPath));
  fs.copyFileSync(sourcePath, destinationPath);
};

const createEmptyCreditReport = (
  loaded: LoadedProjectConfig,
  accountBalanceBefore: number | null = null,
  accountBalanceAfter: number | null = null,
): CreditReportData => {
  return {
    totalCreditsConsumed: 0,
    breakdown: {
      shotGeneration: 0,
      imageGeneration: 0,
      postProcessing: {
        extend: 0,
        upscale: 0,
        sound: 0,
        speech: 0,
      },
    },
    perShot: loaded.normalizedShots.map((shot) => ({
      shotId: shot.sourceId,
      model: shot.model,
      credits: 0,
      imageCredits: 0,
      videoCredits: 0,
      retries: 0,
    })),
    accountBalanceBefore,
    accountBalanceAfter,
  };
};

const readExistingCreditReport = (loaded: LoadedProjectConfig): CreditReportData | null => {
  const reportPath = path.join(loaded.distDir, 'credits-report.json');

  if (!fs.existsSync(reportPath)) {
    return null;
  }

  const parsed = JSON.parse(fs.readFileSync(reportPath, 'utf8')) as Record<string, unknown>;
  const perShotRaw = Array.isArray(parsed.per_shot) ? parsed.per_shot : [];

  return {
    totalCreditsConsumed:
      typeof parsed.total_credits_consumed === 'number' ? parsed.total_credits_consumed : 0,
    breakdown: {
      shotGeneration:
        typeof (parsed.breakdown as Record<string, unknown> | undefined)?.shot_generation === 'number'
          ? ((parsed.breakdown as Record<string, unknown>).shot_generation as number)
          : 0,
      imageGeneration:
        typeof (parsed.breakdown as Record<string, unknown> | undefined)?.image_generation === 'number'
          ? ((parsed.breakdown as Record<string, unknown>).image_generation as number)
          : 0,
      postProcessing: {
        extend:
          typeof ((parsed.breakdown as Record<string, unknown> | undefined)?.post_processing as Record<string, unknown> | undefined)?.extend === 'number'
            ? ((((parsed.breakdown as Record<string, unknown>).post_processing as Record<string, unknown>).extend) as number)
            : 0,
        upscale:
          typeof ((parsed.breakdown as Record<string, unknown> | undefined)?.post_processing as Record<string, unknown> | undefined)?.upscale === 'number'
            ? ((((parsed.breakdown as Record<string, unknown>).post_processing as Record<string, unknown>).upscale) as number)
            : 0,
        sound:
          typeof ((parsed.breakdown as Record<string, unknown> | undefined)?.post_processing as Record<string, unknown> | undefined)?.sound === 'number'
            ? ((((parsed.breakdown as Record<string, unknown>).post_processing as Record<string, unknown>).sound) as number)
            : 0,
        speech:
          typeof ((parsed.breakdown as Record<string, unknown> | undefined)?.post_processing as Record<string, unknown> | undefined)?.speech === 'number'
            ? ((((parsed.breakdown as Record<string, unknown>).post_processing as Record<string, unknown>).speech) as number)
            : 0,
      },
    },
    perShot: perShotRaw.map((entry) => {
      const shotEntry = entry as Record<string, unknown>;
      return {
        shotId: typeof shotEntry.shot_id === 'string' ? shotEntry.shot_id : 'unknown',
        model: typeof shotEntry.model === 'string' ? shotEntry.model : 'unknown',
        credits: typeof shotEntry.credits === 'number' ? shotEntry.credits : 0,
        imageCredits: typeof shotEntry.image_credits === 'number' ? shotEntry.image_credits : 0,
        videoCredits: typeof shotEntry.video_credits === 'number' ? shotEntry.video_credits : 0,
        retries: typeof shotEntry.retries === 'number' ? shotEntry.retries : 0,
      };
    }),
    accountBalanceBefore:
      typeof parsed.account_balance_before === 'number' ? parsed.account_balance_before : null,
    accountBalanceAfter:
      typeof parsed.account_balance_after === 'number' ? parsed.account_balance_after : null,
  };
};

const stageLocalAssets = (loaded: LoadedProjectConfig): StagedAssets => {
  const sourceDir = resolveFrom(loaded.configDir, loaded.assets.sourceDir);
  const stagedStills = new Map<string, string[]>();

  ensureDir(loaded.distDir);
  ensureDir(path.join(loaded.distDir, 'audio'));

  for (const shot of loaded.normalizedShots) {
    const sourceVideo = localAssetPathForShot(loaded, shot, 'video');
    const destinationVideo = distVideoPathForShot(loaded, shot);
    copyFile(sourceVideo, destinationVideo);

    const sourceStill = localAssetPathForShot(loaded, shot, 'still');
    if (loaded.assets.copyStills && fs.existsSync(sourceStill)) {
      const ext = path.extname(sourceStill) || '.webp';
      const destinationStillRelative = `ref-shot-${sceneNumber(shot.index)}${ext}`;
      const destinationStill = path.join(loaded.distDir, destinationStillRelative);
      copyFile(sourceStill, destinationStill);
      stagedStills.set(shot.sceneId, [destinationStillRelative]);
    } else {
      stagedStills.set(shot.sceneId, []);
    }
  }

  const sourceAudio = path.join(sourceDir, loaded.assets.audio);
  const audioRelative = path.join('audio', path.basename(sourceAudio));
  copyFile(sourceAudio, path.join(loaded.distDir, audioRelative));

  return {
    audioRelative,
    stagedStills,
    creditReport: createEmptyCreditReport(loaded),
  };
};

const pickId = (payload: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === 'string' || typeof value === 'number') {
      return String(value);
    }
  }

  throw new Error(`Could not find any of [${keys.join(', ')}] in PixVerse response.`);
};

const downloadPixverseAsset = (
  cwd: string,
  assetId: string,
  destinationDir: string,
) => {
  ensureDir(destinationDir);
  const payload = jsonCommand('pixverse', ['asset', 'download', assetId, '--dest', destinationDir, '--json'], cwd);
  const file = payload.file;

  if (typeof file !== 'string' || file.length === 0) {
    throw new Error(`PixVerse asset download did not return a file path for asset ${assetId}.`);
  }

  return file;
};

const extractCreditsTotal = (payload: Record<string, unknown>) => {
  const topLevelCredits = payload.credits;

  if (typeof topLevelCredits === 'number') {
    return topLevelCredits;
  }

  if (topLevelCredits && typeof topLevelCredits === 'object') {
    const total = (topLevelCredits as Record<string, unknown>).total;
    if (typeof total === 'number') {
      return total;
    }
  }

  throw new Error('Could not read credits.total from PixVerse account info.');
};

const getPixverseCreditsTotal = (cwd: string) => {
  const account = jsonCommand('pixverse', ['account', 'info', '--json'], cwd);
  return extractCreditsTotal(account);
};

const runPixversePreflight = (cwd: string) => {
  jsonCommand('pixverse', ['auth', 'status', '--json'], cwd);
  return getPixverseCreditsTotal(cwd);
};

const stagePixverseAssets = (loaded: LoadedProjectConfig): StagedAssets => {
  const accountBalanceBefore = runPixversePreflight(loaded.configDir);
  const creditReport = createEmptyCreditReport(loaded, accountBalanceBefore, accountBalanceBefore);
  const perShotById = new Map(creditReport.perShot.map((entry) => [entry.shotId, entry]));

  const downloadsDir = path.join(loaded.distDir, '.downloads');
  ensureDir(downloadsDir);
  ensureDir(path.join(loaded.distDir, 'audio'));

  const stagedStills = new Map<string, string[]>();

  for (const shot of loaded.normalizedShots) {
    let referenceImagePath: string | null = null;
    let stagedStillRelative: string | null = null;
    const normalizedStillRelative = `ref-shot-${sceneNumber(shot.index)}.jpg`;
    const normalizedStillPath = path.join(loaded.distDir, normalizedStillRelative);

    if (loaded.generation.workflow === 'i2v') {
      if (shot.imageRef && shot.imageRef !== 'generate') {
        const sourceImagePath = resolveFrom(path.dirname(loaded.inputs.storyboardPath), shot.imageRef);
        referenceImagePath = normalizeReferenceImage(
          sourceImagePath,
          normalizedStillPath,
          shot.quality,
          shot.aspectRatio,
        );
        stagedStillRelative = normalizedStillRelative;
      } else {
        const imageCreditsBefore = getPixverseCreditsTotal(loaded.configDir);
        const imageArgs = [
          'create',
          'image',
          '--prompt',
          shot.prompt,
          '--model',
          loaded.storyboard.image_generation?.model ?? loaded.generation.image.model,
          '--quality',
          loaded.storyboard.image_generation?.quality ?? loaded.generation.image.quality,
          '--aspect-ratio',
          loaded.storyboard.image_generation?.aspect_ratio ?? loaded.generation.image.aspectRatio,
        ];
        const detailLevel = loaded.storyboard.image_generation?.detail_level ?? loaded.generation.image.detailLevel;

        if (detailLevel) {
          imageArgs.push('--detail-level', detailLevel);
        }

        imageArgs.push('--json');

        const imagePayload = jsonCommand(
          'pixverse',
          imageArgs,
          loaded.configDir,
        );
        const imageCreditsAfter = getPixverseCreditsTotal(loaded.configDir);
        const imageCreditsSpent = Math.max(0, imageCreditsBefore - imageCreditsAfter);
        const shotCredit = perShotById.get(shot.sourceId);
        if (shotCredit) {
          shotCredit.imageCredits += imageCreditsSpent;
          shotCredit.credits += imageCreditsSpent;
        }
        creditReport.breakdown.imageGeneration += imageCreditsSpent;
        const imageId = pickId(imagePayload, ['image_id', 'asset_id', 'id']);
        const downloadedImage = downloadPixverseAsset(loaded.configDir, imageId, downloadsDir);
        referenceImagePath = normalizeReferenceImage(
          downloadedImage,
          normalizedStillPath,
          shot.quality,
          shot.aspectRatio,
        );
        stagedStillRelative = normalizedStillRelative;
      }
    }

    stagedStills.set(shot.sceneId, stagedStillRelative ? [stagedStillRelative] : []);

    const createArgs = [
      'create',
      'video',
      '--prompt',
      shot.prompt,
      '--model',
      shot.model,
      '--duration',
      String(shot.durationSeconds),
      '--quality',
      shot.quality,
      '--aspect-ratio',
      shot.aspectRatio,
    ];

    if (referenceImagePath) {
      createArgs.push('--image', referenceImagePath);
    }

    if (shot.audio) {
      createArgs.push('--audio');
    }

    if (shot.multiShot) {
      createArgs.push('--multi-shot');
    }

    if (loaded.generation.offPeak) {
      createArgs.push('--off-peak');
    }

    createArgs.push('--json');

    const videoCreditsBefore = getPixverseCreditsTotal(loaded.configDir);
    const videoPayload = jsonCommand('pixverse', createArgs, loaded.configDir);
    const videoCreditsAfter = getPixverseCreditsTotal(loaded.configDir);
    const videoCreditsSpent = Math.max(0, videoCreditsBefore - videoCreditsAfter);
    const shotCredit = perShotById.get(shot.sourceId);
    if (shotCredit) {
      shotCredit.videoCredits += videoCreditsSpent;
      shotCredit.credits += videoCreditsSpent;
    }
    creditReport.breakdown.shotGeneration += videoCreditsSpent;
    const videoId = pickId(videoPayload, ['video_id', 'asset_id', 'id']);
    const downloadedVideo = downloadPixverseAsset(loaded.configDir, videoId, downloadsDir);
    copyFile(downloadedVideo, distVideoPathForShot(loaded, shot));
  }

  const sampleAudio = resolveFrom(
    loaded.configDir,
    path.join(loaded.assets.sourceDir, loaded.assets.audio),
  );
  const audioRelative = path.join('audio', path.basename(sampleAudio));
  copyFile(sampleAudio, path.join(loaded.distDir, audioRelative));
  creditReport.accountBalanceAfter = getPixverseCreditsTotal(loaded.configDir);
  creditReport.totalCreditsConsumed = Math.max(
    0,
    (creditReport.accountBalanceBefore ?? 0) - (creditReport.accountBalanceAfter ?? 0),
  );

  return {
    audioRelative,
    stagedStills,
    creditReport,
  };
};

const buildManifest = (
  loaded: LoadedProjectConfig,
  audioRelative: string,
  stagedStills: Map<string, string[]>,
): ShotpackManifest => {
  const fps = loaded.render.fps;
  let runningSeconds = 0;

  const scenes = loaded.normalizedShots.map((shot) => {
    const startSec = runningSeconds;
    const endSec = startSec + shot.durationSeconds;
    runningSeconds = endSec;

    return {
      id: shot.sceneId,
      music_section: shot.musicSection,
      objective: shot.objective,
      emotion: shot.emotion,
      motif: shot.motif,
      hookText: shot.hookText,
      transition: shot.transition,
      startSec,
      endSec,
      durationSec: shot.durationSeconds,
      startFrame: Math.round(startSec * fps),
      durationInFrames: Math.round(shot.durationSeconds * fps),
      assets: {
        videoSrc: `${shot.sceneId}.mp4`,
        stills: stagedStills.get(shot.sceneId) ?? [],
      },
      prompt: shot.prompt,
      model: shot.model,
      shot_id: shot.sourceId,
      multi_shot: shot.multiShot,
    };
  });

  const totalFrames = scenes.reduce((sum, scene) => sum + scene.durationInFrames, 0);
  const motifs = Array.from(
    new Set(
      loaded.normalizedShots
        .map((shot) => shot.motif)
        .filter((motif) => motif.length > 0),
    ),
  );

  return {
    project: {
      id: loaded.project.slug,
      name: loaded.project.title,
      version: loaded.project.version,
      primaryDeliverable: 'wide',
      textPolicy: loaded.manifestOptions.textPolicy,
      editPolicy: loaded.manifestOptions.editPolicy,
      protagonistPolicy: loaded.manifestOptions.protagonistPolicy,
      motifs,
      body: briefToBody(loaded.briefText),
      artistNotes: loaded.manifestOptions.artistNotes ?? null,
      referenceNotes: loaded.manifestOptions.referenceNotes ?? null,
    },
    audio: {
      src: audioRelative,
      durationInSeconds: runningSeconds,
      bpm: 90,
    },
    theme: loaded.theme,
    deliverables: [
      {
        id: 'wide',
        width: loaded.render.width,
        height: loaded.render.height,
        fps,
        compositionId: loaded.render.compositionId,
        durationInFrames: totalFrames,
        sceneCount: scenes.length,
      },
    ],
    visualPeakSection: scenes[Math.max(scenes.length - 2, 0)]?.id ?? scenes[0].id,
    quietSection: scenes[0].id,
    thumbnail: {
      sceneId: scenes[Math.min(2, scenes.length - 1)].id,
      frame: 0,
    },
    scenes,
  };
};

const sanitizeId = (value: string) => {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'shotpack';
};

const compactJoin = (values: Array<string | null | undefined>, separator = ' ') => {
  return values
    .map((value) => (typeof value === 'string' ? value.trim() : ''))
    .filter((value) => value.length > 0)
    .join(separator);
};

const normalizeMichibikiAspectRatio = (
  width: number,
  height: number,
): MichibikiVideoSpec['format']['aspectRatio'] => {
  const actual = width / height;
  const candidates: Array<{label: MichibikiVideoSpec['format']['aspectRatio']; ratio: number}> = [
    {label: '16:9', ratio: 16 / 9},
    {label: '9:16', ratio: 9 / 16},
    {label: '1:1', ratio: 1},
    {label: '4:5', ratio: 4 / 5},
  ];

  return candidates.reduce((best, candidate) => {
    return Math.abs(candidate.ratio - actual) < Math.abs(best.ratio - actual) ? candidate : best;
  }).label;
};

const shouldRequestMichibikiCaptions = (textPolicy: string) => {
  const normalized = textPolicy.toLowerCase();
  if (
    normalized.includes('no visible text') ||
    normalized.includes('no text') ||
    normalized.includes('no subtitles') ||
    normalized.includes('no captions') ||
    textPolicy.includes('文字なし') ||
    textPolicy.includes('字幕なし') ||
    textPolicy.includes('入れない')
  ) {
    return false;
  }

  return textPolicy.trim().length > 0;
};

const findExistingRefStills = (loaded: LoadedProjectConfig, shot: NormalizedShot) => {
  if (!fs.existsSync(loaded.distDir)) {
    return [];
  }

  const prefix = `ref-shot-${sceneNumber(shot.index)}`;
  return fs
    .readdirSync(loaded.distDir)
    .filter((fileName) => fileName.startsWith(prefix))
    .map((fileName) => path.join(loaded.distDir, fileName));
};

const buildMichibikiPrompt = (
  loaded: LoadedProjectConfig,
  durationSeconds: number,
  aspectRatio: MichibikiVideoSpec['format']['aspectRatio'],
) => {
  const sceneLines = loaded.normalizedShots.map((shot) => {
    const description = compactJoin([shot.objective, shot.emotion, shot.motif, shot.prompt], ' / ');
    return `${shot.index + 1}. ${shot.sceneId} (${shot.durationSeconds}s): ${description}`;
  });

  return [
    `Create a video from this PixVerse Shotpack storyboard: ${loaded.project.title}.`,
    `Preserve the shot order, timing, and existing media assets where provided.`,
    `Format: ${aspectRatio}, ${loaded.render.width}x${loaded.render.height}, ${loaded.render.fps}fps, ${durationSeconds}s.`,
    loaded.briefText ? `Brief: ${briefToBody(loaded.briefText)}` : null,
    `Scenes:\n${sceneLines.join('\n')}`,
  ]
    .filter((line): line is string => Boolean(line))
    .join('\n\n');
};

const buildMichibikiVideoSpec = (
  loaded: LoadedProjectConfig,
  options: Required<Pick<MichibikiExportOptions, 'engine' | 'outputType'>> &
    Pick<MichibikiExportOptions, 'allowCloudRender' | 'licenseMode'>,
) => {
  const durationSeconds = loaded.normalizedShots.reduce((sum, shot) => sum + shot.durationSeconds, 0);
  const aspectRatio = normalizeMichibikiAspectRatio(loaded.render.width, loaded.render.height);
  const assets: MichibikiAsset[] = [];
  const assetIdsByScene = new Map<string, string[]>();
  const seenAssetSources = new Set<string>();

  const addAsset = (asset: MichibikiAsset) => {
    const source = resolveFrom(loaded.configDir, asset.source);
    if (!fs.existsSync(source) || seenAssetSources.has(source)) {
      return null;
    }

    const normalized = {
      ...asset,
      source,
    };
    assets.push(normalized);
    seenAssetSources.add(source);
    return normalized.id;
  };

  const sourceDir = resolveFrom(loaded.configDir, loaded.assets.sourceDir);
  const sourceAudio = path.join(sourceDir, loaded.assets.audio);
  const distAudio = path.join(loaded.distDir, 'audio', path.basename(sourceAudio));
  addAsset({
    id: 'music-track',
    type: 'audio',
    source: fs.existsSync(distAudio) ? distAudio : sourceAudio,
    usage: 'music',
  });

  const manifestPath = path.join(loaded.distDir, 'manifest.json');
  addAsset({
    id: 'shotpack-manifest',
    type: 'json',
    source: manifestPath,
    usage: 'data',
  });

  for (const shot of loaded.normalizedShots) {
    const sceneAssetIds: string[] = [];
    const distVideo = distVideoPathForShot(loaded, shot);
    const localVideo = localAssetPathForShot(loaded, shot, 'video');
    const videoAssetId = addAsset({
      id: `${shot.sceneId}-video`,
      type: 'video',
      source: fs.existsSync(distVideo) ? distVideo : localVideo,
      usage: 'broll',
    });
    if (videoAssetId) {
      sceneAssetIds.push(videoAssetId);
    }

    const distStills = findExistingRefStills(loaded, shot);
    const localStill = localAssetPathForShot(loaded, shot, 'still');
    const stillSource = distStills[0] ?? localStill;
    const stillAssetId = addAsset({
      id: `${shot.sceneId}-still`,
      type: 'image',
      source: stillSource,
      usage: 'background',
    });
    if (stillAssetId) {
      sceneAssetIds.push(stillAssetId);
    }

    assetIdsByScene.set(shot.sceneId, sceneAssetIds);
  }

  const emotions = Array.from(new Set(loaded.normalizedShots.map((shot) => shot.emotion).filter(Boolean)));
  const transitions = Array.from(new Set(loaded.normalizedShots.map((shot) => shot.transition).filter(Boolean)));
  const visualTone = compactJoin(
    [
      loaded.manifestOptions.artistNotes,
      loaded.manifestOptions.referenceNotes,
      loaded.manifestOptions.protagonistPolicy,
      loaded.manifestOptions.editPolicy,
    ],
    ' ',
  );

  const constraints: MichibikiVideoSpec['constraints'] = {};
  if (options.engine !== 'auto') {
    constraints.enginePreference = options.engine;
  }
  if (options.licenseMode) {
    constraints.licenseMode = options.licenseMode;
  }
  if (typeof options.allowCloudRender === 'boolean') {
    constraints.allowCloudRender = options.allowCloudRender;
  }

  const videoSpec: MichibikiVideoSpec = {
    id: sanitizeId(`shotpack-${loaded.project.slug}`),
    title: loaded.project.title,
    goal: compactJoin(
      [
        briefToBody(loaded.briefText) || loaded.storyboard.meta.title,
        'Preserve the Shotpack storyboard timing, sequence, and media continuity.',
      ],
      ' ',
    ),
    format: {
      aspectRatio,
      width: loaded.render.width,
      height: loaded.render.height,
      fps: loaded.render.fps,
      durationSec: durationSeconds,
    },
    style: {
      mood: emotions.join(', ') || 'story-driven',
      visualTone: visualTone || 'Use the Shotpack visual language and provided reference media.',
      motionStyle: transitions.join(', ') || loaded.generation.workflow,
      reference: loaded.manifestOptions.referenceNotes ?? undefined,
    },
    content: {
      script: loaded.briefText ?? undefined,
      captions: shouldRequestMichibikiCaptions(loaded.manifestOptions.textPolicy),
      scenes: loaded.normalizedShots.map((shot) => ({
        id: shot.sceneId,
        order: shot.index + 1,
        durationSec: shot.durationSeconds,
        description: compactJoin([shot.objective, shot.prompt], ' '),
        text: shot.hookText ?? undefined,
        assets: assetIdsByScene.get(shot.sceneId),
        camera: shot.motif || undefined,
        transition: shot.transition || undefined,
        motion: shot.notes || shot.musicSection || undefined,
      })),
    },
    assets,
    output: {
      type: options.outputType,
      needsDownload: options.outputType === 'mp4' || options.outputType === 'webm',
    },
    constraints,
  };

  return videoSpec;
};

const buildMichibikiCommand = (
  loaded: LoadedProjectConfig,
  videoSpec: MichibikiVideoSpec,
  options: Required<Pick<MichibikiExportOptions, 'engine' | 'outputType'>> &
    Pick<MichibikiExportOptions, 'allowCloudRender' | 'licenseMode'>,
) => {
  const args = [
    'pnpm',
    'michibiki',
    'generate',
    '--prompt',
    buildMichibikiPrompt(loaded, videoSpec.format.durationSec, videoSpec.format.aspectRatio),
    '--title',
    videoSpec.title,
    '--duration',
    String(videoSpec.format.durationSec),
    '--aspect-ratio',
    videoSpec.format.aspectRatio,
    '--output-type',
    options.outputType,
    '--outputs',
    path.join(loaded.distDir, 'michibiki'),
  ];

  if (options.engine !== 'auto') {
    args.push('--engine', options.engine);
  }

  if (options.licenseMode) {
    args.push('--license-mode', options.licenseMode);
  }

  if (options.allowCloudRender) {
    args.push('--allow-cloud-render');
  }

  for (const asset of videoSpec.assets) {
    if (asset.type !== 'json') {
      args.push('--asset', asset.source);
    }
  }

  return args;
};

export const exportMichibikiHandoff = (
  loaded: LoadedProjectConfig,
  options: MichibikiExportOptions = {},
): MichibikiExportResult => {
  const engine = options.engine ?? 'hyperframes';
  const outputType = options.outputType ?? 'mp4';
  const outputPath = resolveFrom(loaded.configDir, options.outputPath ?? path.join('dist', 'video-spec.json'));
  const handoffPath = resolveFrom(loaded.configDir, options.handoffPath ?? path.join('dist', 'michibiki-handoff.json'));
  const normalizedOptions = {
    engine,
    outputType,
    allowCloudRender: options.allowCloudRender,
    licenseMode: options.licenseMode,
  };
  const videoSpec = buildMichibikiVideoSpec(loaded, normalizedOptions);
  const command = buildMichibikiCommand(loaded, videoSpec, normalizedOptions);
  const michibikiPath = options.michibikiPath ? resolveFrom(loaded.configDir, options.michibikiPath) : null;
  const runMichibiki = options.runMichibiki === true;
  const dryRun = options.dryRun === true;

  ensureDir(path.dirname(outputPath));
  ensureDir(path.dirname(handoffPath));
  fs.writeFileSync(outputPath, JSON.stringify(videoSpec, null, 2));

  let status: number | null = null;
  let stdout = '';
  let stderr = '';
  let ran = false;

  if (runMichibiki && !dryRun) {
    if (!michibikiPath) {
      throw new Error('--run-michibiki requires --michibiki-path <path-to-michibiki>');
    }

    if (!fs.existsSync(path.join(michibikiPath, 'package.json'))) {
      throw new Error(`Michibiki path does not look like a repo root: ${michibikiPath}`);
    }

    const result = spawnSync(command[0], command.slice(1), {
      cwd: michibikiPath,
      encoding: 'utf8',
    });
    ran = true;
    status = result.status;
    stdout = typeof result.stdout === 'string' ? result.stdout.trim() : '';
    stderr = typeof result.stderr === 'string' ? result.stderr.trim() : '';

    if (result.error) {
      stderr = compactJoin([stderr, result.error.message], '\n');
    }
  }

  const handoff: MichibikiExportResult = {
    ok: !runMichibiki || dryRun || status === 0,
    generatedAt: new Date().toISOString(),
    project: {
      slug: loaded.project.slug,
      title: loaded.project.title,
    },
    source: {
      configPath: loaded.configPath,
      storyboardPath: loaded.inputs.storyboardPath,
      briefPath: loaded.inputs.briefPath ?? null,
      manifestPath: path.join(loaded.distDir, 'manifest.json'),
    },
    videoSpecPath: outputPath,
    handoffPath,
    videoSpec,
    michibiki: {
      optional: true,
      path: michibikiPath,
      engine,
      command,
      cwd: michibikiPath,
      ran,
      dryRun,
      status,
      stdout,
      stderr,
      note: runMichibiki
        ? dryRun
          ? 'Dry run only. Michibiki was not invoked.'
          : 'Michibiki generate was invoked. Rendering still requires the Michibiki render step.'
        : 'Michibiki was not invoked. Clone/setup Michibiki separately and run this command when needed.',
    },
  };

  fs.writeFileSync(handoffPath, JSON.stringify(handoff, null, 2));

  return handoff;
};

const writeSupportFiles = (
  loaded: LoadedProjectConfig,
  manifest: ShotpackManifest,
  options: ExecutePipelineOptions,
  pipelineId: string,
  summary: RunSummary,
  creditReport: CreditReportData,
) => {
  const manifestPath = path.join(loaded.distDir, 'manifest.json');
  const startedAt = new Date().toISOString();

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  fs.writeFileSync(
    path.join(loaded.distDir, 'pipeline-state.json'),
    JSON.stringify(
      {
        pipeline_id: pipelineId,
        current_phase: options.mode === 'render' ? 'rendered' : 'completed',
        started_at: startedAt,
        phases_completed:
          options.mode === 'render'
            ? ['assembler', 'render']
            : ['director', 'shot-generator', 'assembler', 'render'],
        phases_remaining: [],
        credits_consumed: creditReport.totalCreditsConsumed,
        credits_budget: 0,
        retry_count: {},
        errors: [],
      },
      null,
      2,
    ),
  );
  fs.writeFileSync(
    path.join(loaded.distDir, 'credits-report.json'),
    JSON.stringify(
      {
        pipeline_id: pipelineId,
        total_credits_consumed: creditReport.totalCreditsConsumed,
        breakdown: {
          shot_generation: creditReport.breakdown.shotGeneration,
          image_generation: creditReport.breakdown.imageGeneration,
          post_processing: {
            extend: creditReport.breakdown.postProcessing.extend,
            upscale: creditReport.breakdown.postProcessing.upscale,
            sound: creditReport.breakdown.postProcessing.sound,
            speech: creditReport.breakdown.postProcessing.speech,
          },
        },
        per_shot: creditReport.perShot.map((shot) => ({
          shot_id: shot.shotId,
          credits: shot.credits,
          image_credits: shot.imageCredits,
          video_credits: shot.videoCredits,
          retries: shot.retries,
          model: shot.model,
        })),
        account_balance_before: creditReport.accountBalanceBefore,
        account_balance_after: creditReport.accountBalanceAfter,
      },
      null,
      2,
    ),
  );

  const runLog = [
    '# Run Log',
    '',
    '## Pipeline',
    '',
    `- pipeline_id: \`${pipelineId}\``,
    `- workflow: \`${loaded.generation.workflow}\``,
    `- asset_mode: \`${loaded.assets.mode}\``,
    `- credits_consumed: \`${creditReport.totalCreditsConsumed}\``,
    `- final_status: \`${summary.failed === 0 ? 'completed' : 'completed_with_errors'}\``,
    `- final_render: \`${summary.finalRender ?? 'not-rendered'}\``,
    '',
    '## Shots',
    '',
    '| shot_id | scene_id | duration | model | status |',
    '|--------|----------|----------|-------|--------|',
    ...loaded.normalizedShots.map((shot) =>
      `| ${shot.sourceId} | ${shot.sceneId} | ${shot.durationSeconds}s | ${shot.model} | success |`,
    ),
    '',
  ].join('\n');

  fs.writeFileSync(path.join(loaded.distDir, 'run-log.md'), runLog);

  return manifestPath;
};

const renderShotpack = (loaded: LoadedProjectConfig) => {
  ensureDir(path.dirname(loaded.renderOutputPath));
  shellCommand('node', ['scripts/prepare-public-assets.mjs'], loaded.configDir);
  shellCommand(
    'npx',
    [
      'remotion',
      'render',
      'src/index.ts',
      loaded.render.compositionId,
      loaded.renderOutputPath,
      '--codec=h264',
      '--crf=18',
      '--audio-bitrate=320k',
      '--gl=swangle',
    ],
    loaded.configDir,
  );
};

const writeDryRunFiles = (
  loaded: LoadedProjectConfig,
  plan: PipelinePlan,
  pipelineId: string,
) => {
  ensureDir(loaded.distDir);

  const audioRelative = path.join(
    'audio',
    path.basename(resolveFrom(loaded.configDir, path.join(loaded.assets.sourceDir, loaded.assets.audio))),
  );
  const manifest = buildManifest(
    loaded,
    audioRelative,
    new Map<string, string[]>(
      loaded.normalizedShots.map((shot) => [
        shot.sceneId,
        loaded.generation.workflow === 'i2v' && (shot.imageRef === 'generate' || shot.imageRef === null)
          ? [`ref-shot-${sceneNumber(shot.index)}.jpg`]
          : [],
      ]),
    ),
  );
  const planPath = path.join(loaded.distDir, 'dry-run-plan.json');
  const summaryPath = path.join(loaded.distDir, 'dry-run.md');
  const manifestPath = path.join(loaded.distDir, 'dry-run-manifest.json');

  fs.writeFileSync(
    planPath,
    JSON.stringify(
      {
        pipeline_id: pipelineId,
        generated_at: new Date().toISOString(),
        plan,
        dry_run_manifest: manifestPath,
      },
      null,
      2,
    ),
  );
  fs.writeFileSync(summaryPath, formatPipelinePlanMarkdown(plan));
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  return {
    planPath,
    summaryPath,
    manifestPath,
  };
};

export const executePipeline = async (
  loaded: LoadedProjectConfig,
  options: ExecutePipelineOptions,
): Promise<ExecutePipelineResult> => {
  const plan = buildPipelinePlan(loaded);

  if (!plan.validation.ok) {
    throw new Error(plan.validation.errors.join('\n'));
  }

  const pipelineId =
    options.runId ??
    `${loaded.project.slug}-${new Date().toISOString().replace(/[:.]/g, '-').replace('T', '-').slice(0, 19)}`;

  if (options.dryRun) {
    const dryRunFiles = writeDryRunFiles(loaded, plan, pipelineId);

    return {
      plan,
      manifestPath: dryRunFiles.manifestPath,
      renderOutputPath: loaded.renderOutputPath,
      dryRunFiles,
      summary: {
        failed: 0,
        generatedImages: plan.totals.imageJobs,
        generatedVideos: plan.totals.videoJobs,
        stagedVideos: loaded.assets.mode === 'local' ? plan.totals.sceneCount : 0,
        creditsConsumed: 0,
        finalRender: null,
      },
    };
  }

  ensureDir(loaded.distDir);

  const staged =
    options.mode === 'render' && loaded.assets.mode === 'pixverse'
      ? {
          audioRelative: path.join(
            'audio',
            path.basename(resolveFrom(loaded.configDir, path.join(loaded.assets.sourceDir, loaded.assets.audio))),
          ),
          stagedStills: new Map<string, string[]>(
            loaded.normalizedShots.map((shot) => {
              const matches = fs
                .readdirSync(loaded.distDir)
                .filter((fileName) => fileName.startsWith(`ref-shot-${sceneNumber(shot.index)}`))
                .map((fileName) => fileName);
              return [shot.sceneId, matches];
            }),
          ),
          creditReport: readExistingCreditReport(loaded) ?? createEmptyCreditReport(loaded),
        }
      : loaded.assets.mode === 'local'
        ? stageLocalAssets(loaded)
        : stagePixverseAssets(loaded);

  const manifest = buildManifest(loaded, staged.audioRelative, staged.stagedStills);
  const summary: RunSummary = {
    failed: 0,
    generatedImages: loaded.assets.mode === 'pixverse' && loaded.generation.workflow === 'i2v'
      ? plan.totals.imageJobs
      : 0,
    generatedVideos: loaded.assets.mode === 'pixverse' ? plan.totals.videoJobs : 0,
    stagedVideos: loaded.assets.mode === 'local' ? plan.totals.sceneCount : 0,
    creditsConsumed:
      options.mode === 'render'
        ? 0
        : staged.creditReport.totalCreditsConsumed,
    finalRender: null,
  };
  const manifestPath = writeSupportFiles(loaded, manifest, options, pipelineId, summary, staged.creditReport);
  renderShotpack(loaded);
  summary.finalRender = loaded.renderOutputPath;

  return {
    plan,
    manifestPath,
    renderOutputPath: loaded.renderOutputPath,
    summary,
  };
};
