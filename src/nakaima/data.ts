export const nakaimaFps = 30;
export const nakaimaDurationInSeconds = 153.88;
export const nakaimaDurationInFrames = Math.ceil(nakaimaDurationInSeconds * nakaimaFps);
export const nakaimaBpm = 86;

export type NakaimaVariant = 'intro' | 'hook' | 'verse' | 'bridge' | 'outro';
export type BlendMode = 'normal' | 'screen' | 'soft-light' | 'lighten' | 'overlay';
export type PlateId =
  | 'cosmic-mist'
  | 'ember-field'
  | 'filament-light'
  | 'liquid-starlight'
  | 'halo-bloom'
  | 'silent-void';

export type NakaimaPlateLayer = {
  plateId: PlateId;
  opacity: number;
  darken: number;
  tint?: string;
  blur?: number;
  blendMode?: BlendMode;
  scaleFrom?: number;
  scaleTo?: number;
  driftX?: number;
  driftY?: number;
  trimBefore?: number;
};

export type NakaimaAccentCue = {
  text: string;
  fromSec: number;
  endSec: number;
  style: 'impact' | 'trace' | 'halo' | 'kanji';
  position?: 'left' | 'center' | 'right';
};

export type NakaimaSection = {
  id: string;
  label: string;
  labelJa: string;
  startSec: number;
  endSec: number;
  accent: string;
  accentSoft: string;
  energy: number;
  variant: NakaimaVariant;
  plateLayers: NakaimaPlateLayer[];
  accents: NakaimaAccentCue[];
};

export type NakaimaLyricCue = {
  id: string;
  sectionId: string;
  fromSec: number;
  endSec: number;
  lines: string[];
  align: 'left' | 'center' | 'right';
  emphasis: 'soft' | 'warm' | 'bright';
};

export const nakaimaTheme = {
  night: '#02040a',
  paper: '#f3f6ff',
  text: '#eef2ff',
  indigo: '#5f79ff',
  indigoSoft: 'rgba(95, 121, 255, 0.18)',
  gold: '#ffd08f',
  goldSoft: 'rgba(255, 208, 143, 0.2)',
  whiteSoft: 'rgba(238, 242, 255, 0.14)',
};

export const nakaimaPlateFiles: Record<PlateId, string> = {
  'cosmic-mist': 'nakaima/plates/cosmic-mist.mp4',
  'ember-field': 'nakaima/plates/ember-field.mp4',
  'filament-light': 'nakaima/plates/filament-light.mp4',
  'liquid-starlight': 'nakaima/plates/liquid-starlight.mp4',
  'halo-bloom': 'nakaima/plates/halo-bloom.mp4',
  'silent-void': 'nakaima/plates/silent-void.mp4',
};

const layer = (
  plateId: PlateId,
  options: Omit<NakaimaPlateLayer, 'plateId'>,
): NakaimaPlateLayer => ({
  plateId,
  ...options,
});

export const nakaimaSections: NakaimaSection[] = [
  {
    id: 'intro',
    label: 'INTRO',
    labelJa: '導入',
    startSec: 0,
    endSec: 16.92,
    accent: '#bed0ff',
    accentSoft: 'rgba(190, 208, 255, 0.22)',
    energy: 0.32,
    variant: 'intro',
    plateLayers: [
      layer('cosmic-mist', {
        opacity: 0.82,
        darken: 0.34,
        tint: 'rgba(95, 121, 255, 0.16)',
        scaleFrom: 1.08,
        scaleTo: 1.16,
        driftX: 26,
        driftY: 18,
        trimBefore: 10,
      }),
      layer('silent-void', {
        opacity: 0.52,
        darken: 0.46,
        blendMode: 'screen',
        tint: 'rgba(255, 255, 255, 0.08)',
        blur: 8,
        scaleFrom: 1.14,
        scaleTo: 1.18,
        driftX: 40,
        driftY: 22,
        trimBefore: 28,
      }),
      layer('halo-bloom', {
        opacity: 0.32,
        darken: 0.48,
        blendMode: 'screen',
        tint: 'rgba(255, 208, 143, 0.16)',
        blur: 4,
        scaleFrom: 1.1,
        scaleTo: 1.14,
        driftX: 14,
        driftY: 10,
        trimBefore: 18,
      }),
    ],
    accents: [
      {
        text: '中今',
        fromSec: 11.44,
        endSec: 16.92,
        style: 'kanji',
        position: 'center',
      },
    ],
  },
  {
    id: 'hook-1',
    label: 'HOOK',
    labelJa: '主旋律',
    startSec: 16.92,
    endSec: 44.92,
    accent: '#ffd08f',
    accentSoft: 'rgba(255, 208, 143, 0.25)',
    energy: 0.82,
    variant: 'hook',
    plateLayers: [
      layer('filament-light', {
        opacity: 0.78,
        darken: 0.28,
        tint: 'rgba(95, 121, 255, 0.14)',
        scaleFrom: 1.06,
        scaleTo: 1.14,
        driftX: 20,
        driftY: 14,
        trimBefore: 12,
      }),
      layer('ember-field', {
        opacity: 0.44,
        darken: 0.42,
        blendMode: 'screen',
        tint: 'rgba(255, 208, 143, 0.24)',
        blur: 2,
        scaleFrom: 1.1,
        scaleTo: 1.22,
        driftX: 34,
        driftY: 20,
        trimBefore: 24,
      }),
      layer('cosmic-mist', {
        opacity: 0.28,
        darken: 0.52,
        blendMode: 'screen',
        tint: 'rgba(255, 255, 255, 0.06)',
        blur: 12,
        scaleFrom: 1.16,
        scaleTo: 1.22,
        driftX: 48,
        driftY: 24,
        trimBefore: 36,
      }),
    ],
    accents: [
      {text: '足', fromSec: 16.92, endSec: 23.72, style: 'kanji', position: 'center'},
      {text: '中今', fromSec: 23.72, endSec: 30.36, style: 'halo', position: 'right'},
      {text: 'つながり', fromSec: 30.36, endSec: 37.4, style: 'trace', position: 'left'},
      {text: '抱', fromSec: 37.4, endSec: 44.92, style: 'impact', position: 'center'},
    ],
  },
  {
    id: 'verse-1',
    label: 'VERSE I',
    labelJa: '第一節',
    startSec: 44.92,
    endSec: 74.04,
    accent: '#bfd3ff',
    accentSoft: 'rgba(191, 211, 255, 0.2)',
    energy: 0.56,
    variant: 'verse',
    plateLayers: [
      layer('liquid-starlight', {
        opacity: 0.76,
        darken: 0.34,
        tint: 'rgba(95, 121, 255, 0.14)',
        scaleFrom: 1.06,
        scaleTo: 1.12,
        driftX: 16,
        driftY: 12,
        trimBefore: 8,
      }),
      layer('cosmic-mist', {
        opacity: 0.38,
        darken: 0.48,
        blendMode: 'screen',
        tint: 'rgba(255, 255, 255, 0.08)',
        blur: 8,
        scaleFrom: 1.12,
        scaleTo: 1.18,
        driftX: 34,
        driftY: 18,
        trimBefore: 20,
      }),
    ],
    accents: [
      {text: '曖昧な未来', fromSec: 50.84, endSec: 59.08, style: 'trace', position: 'right'},
      {text: '灯', fromSec: 63, endSec: 66.52, style: 'kanji', position: 'left'},
      {text: '息', fromSec: 70.28, endSec: 74.04, style: 'halo', position: 'center'},
    ],
  },
  {
    id: 'bridge',
    label: 'BRIDGE',
    labelJa: '橋',
    startSec: 74.04,
    endSec: 86.76,
    accent: '#ffe1ba',
    accentSoft: 'rgba(255, 225, 186, 0.24)',
    energy: 0.42,
    variant: 'bridge',
    plateLayers: [
      layer('halo-bloom', {
        opacity: 0.58,
        darken: 0.36,
        tint: 'rgba(255, 208, 143, 0.18)',
        scaleFrom: 1.04,
        scaleTo: 1.1,
        driftX: 10,
        driftY: 8,
        trimBefore: 6,
      }),
      layer('silent-void', {
        opacity: 0.4,
        darken: 0.54,
        blendMode: 'screen',
        tint: 'rgba(95, 121, 255, 0.12)',
        blur: 10,
        scaleFrom: 1.14,
        scaleTo: 1.2,
        driftX: 24,
        driftY: 18,
        trimBefore: 14,
      }),
    ],
    accents: [
      {text: '灯', fromSec: 80.2, endSec: 86.76, style: 'kanji', position: 'center'},
    ],
  },
  {
    id: 'verse-2',
    label: 'VERSE II',
    labelJa: '第二節',
    startSec: 86.76,
    endSec: 106.28,
    accent: '#a9c5ff',
    accentSoft: 'rgba(169, 197, 255, 0.21)',
    energy: 0.64,
    variant: 'verse',
    plateLayers: [
      layer('liquid-starlight', {
        opacity: 0.72,
        darken: 0.32,
        tint: 'rgba(95, 121, 255, 0.15)',
        scaleFrom: 1.08,
        scaleTo: 1.16,
        driftX: 18,
        driftY: 14,
        trimBefore: 16,
      }),
      layer('filament-light', {
        opacity: 0.32,
        darken: 0.5,
        blendMode: 'screen',
        tint: 'rgba(255, 255, 255, 0.08)',
        blur: 8,
        scaleFrom: 1.12,
        scaleTo: 1.22,
        driftX: 30,
        driftY: 16,
        trimBefore: 28,
      }),
    ],
    accents: [
      {text: '輪郭', fromSec: 98.44, endSec: 102.04, style: 'trace', position: 'right'},
      {text: '瞬間', fromSec: 102.04, endSec: 106.28, style: 'impact', position: 'center'},
    ],
  },
  {
    id: 'hook-2',
    label: 'HOOK',
    labelJa: '再帰',
    startSec: 106.28,
    endSec: 125.64,
    accent: '#ffc07d',
    accentSoft: 'rgba(255, 192, 125, 0.25)',
    energy: 0.86,
    variant: 'hook',
    plateLayers: [
      layer('filament-light', {
        opacity: 0.8,
        darken: 0.28,
        tint: 'rgba(95, 121, 255, 0.16)',
        scaleFrom: 1.08,
        scaleTo: 1.16,
        driftX: 24,
        driftY: 16,
        trimBefore: 20,
      }),
      layer('ember-field', {
        opacity: 0.46,
        darken: 0.42,
        blendMode: 'screen',
        tint: 'rgba(255, 208, 143, 0.26)',
        blur: 1,
        scaleFrom: 1.12,
        scaleTo: 1.24,
        driftX: 36,
        driftY: 20,
        trimBefore: 30,
      }),
      layer('halo-bloom', {
        opacity: 0.26,
        darken: 0.52,
        blendMode: 'screen',
        tint: 'rgba(255, 255, 255, 0.08)',
        blur: 6,
        scaleFrom: 1.12,
        scaleTo: 1.18,
        driftX: 18,
        driftY: 12,
        trimBefore: 40,
      }),
    ],
    accents: [
      {text: '熱', fromSec: 106.28, endSec: 111.12, style: 'kanji', position: 'center'},
      {text: '中今', fromSec: 111.12, endSec: 115.96, style: 'halo', position: 'left'},
      {text: 'つながり', fromSec: 115.96, endSec: 120.8, style: 'trace', position: 'right'},
      {text: '向', fromSec: 120.8, endSec: 125.64, style: 'impact', position: 'center'},
    ],
  },
  {
    id: 'outro',
    label: 'OUTRO',
    labelJa: '余韻',
    startSec: 125.64,
    endSec: nakaimaDurationInSeconds,
    accent: '#ffe0ae',
    accentSoft: 'rgba(255, 224, 174, 0.22)',
    energy: 0.38,
    variant: 'outro',
    plateLayers: [
      layer('silent-void', {
        opacity: 0.72,
        darken: 0.36,
        tint: 'rgba(95, 121, 255, 0.14)',
        scaleFrom: 1.08,
        scaleTo: 1.16,
        driftX: 18,
        driftY: 12,
        trimBefore: 12,
      }),
      layer('liquid-starlight', {
        opacity: 0.34,
        darken: 0.5,
        blendMode: 'screen',
        tint: 'rgba(255, 255, 255, 0.06)',
        blur: 10,
        scaleFrom: 1.12,
        scaleTo: 1.18,
        driftX: 28,
        driftY: 16,
        trimBefore: 24,
      }),
      layer('halo-bloom', {
        opacity: 0.24,
        darken: 0.58,
        blendMode: 'screen',
        tint: 'rgba(255, 208, 143, 0.16)',
        blur: 8,
        scaleFrom: 1.14,
        scaleTo: 1.2,
        driftX: 18,
        driftY: 10,
        trimBefore: 18,
      }),
    ],
    accents: [
      {text: '瞬間', fromSec: 132.52, endSec: 141.16, style: 'halo', position: 'center'},
      {text: '今日', fromSec: 141.16, endSec: 148.88, style: 'impact', position: 'center'},
    ],
  },
];

export const nakaimaLyricCues: NakaimaLyricCue[] = [
  {
    id: 'intro-01',
    sectionId: 'intro',
    fromSec: 0,
    endSec: 11.44,
    lines: ['ねえ　見えるもんだけで決めんの早い', '名前つく前の気配もあるじゃん'],
    align: 'left',
    emphasis: 'soft',
  },
  {
    id: 'intro-02',
    sectionId: 'intro',
    fromSec: 11.44,
    endSec: 16.92,
    lines: ['過去でも未来でもなくて　いま', 'その真ん中で息してる　中今'],
    align: 'right',
    emphasis: 'bright',
  },
  {
    id: 'hook-01',
    sectionId: 'hook-1',
    fromSec: 16.92,
    endSec: 23.72,
    lines: ['見えるだけじゃ　まだ足んない', '言えない熱が　まだ冷めない'],
    align: 'center',
    emphasis: 'warm',
  },
  {
    id: 'hook-02',
    sectionId: 'hook-1',
    fromSec: 23.72,
    endSec: 30.36,
    lines: ['過去でも未来でもない', 'いまここが中今じゃない？'],
    align: 'right',
    emphasis: 'bright',
  },
  {
    id: 'hook-03',
    sectionId: 'hook-1',
    fromSec: 30.36,
    endSec: 37.4,
    lines: ['ほどけた線が　またつながり', '消えそうな火が　まだ消えない'],
    align: 'left',
    emphasis: 'soft',
  },
  {
    id: 'hook-04',
    sectionId: 'hook-1',
    fromSec: 37.4,
    endSec: 44.92,
    lines: ['中今に立って　ただ向き合い', '見えないもんまで　抱いていたい'],
    align: 'center',
    emphasis: 'warm',
  },
  {
    id: 'verse1-01',
    sectionId: 'verse-1',
    fromSec: 44.92,
    endSec: 50.84,
    lines: ['答えっぽい顔したノイズがうるさい', '胸の奥は　まだうまく言えない'],
    align: 'left',
    emphasis: 'soft',
  },
  {
    id: 'verse1-02',
    sectionId: 'verse-1',
    fromSec: 50.84,
    endSec: 59.08,
    lines: ['白か黒か　それだけじゃ救えない', '曖昧なとこにしか　残んない未来'],
    align: 'right',
    emphasis: 'bright',
  },
  {
    id: 'verse1-03',
    sectionId: 'verse-1',
    fromSec: 59.08,
    endSec: 63,
    lines: ['触れたと思えば　また遠のいて', '静かな部屋で　やっと音が見えて'],
    align: 'center',
    emphasis: 'soft',
  },
  {
    id: 'verse1-04',
    sectionId: 'verse-1',
    fromSec: 63,
    endSec: 66.52,
    lines: ['狭い隙間から　広がる視界', 'ちっちゃい灯りが　やけにでかい'],
    align: 'left',
    emphasis: 'warm',
  },
  {
    id: 'verse1-05',
    sectionId: 'verse-1',
    fromSec: 66.52,
    endSec: 70.28,
    lines: ['誰かの痛みも　混ざったぬくもり', 'いまの鼓動に　変えてくつもり'],
    align: 'right',
    emphasis: 'bright',
  },
  {
    id: 'verse1-06',
    sectionId: 'verse-1',
    fromSec: 70.28,
    endSec: 74.04,
    lines: ['ちゃんとここにいる　それだけでいい', '中今の中で　息をしていたい'],
    align: 'center',
    emphasis: 'warm',
  },
  {
    id: 'bridge-01',
    sectionId: 'bridge',
    fromSec: 74.04,
    endSec: 80.2,
    lines: ['根っこは見えない　でも花は揺れる', '空っぽみたいで　ちゃんと満ちてる'],
    align: 'left',
    emphasis: 'soft',
  },
  {
    id: 'bridge-02',
    sectionId: 'bridge',
    fromSec: 80.2,
    endSec: 86.76,
    lines: ['中今を生きる', 'それだけで灯る'],
    align: 'center',
    emphasis: 'bright',
  },
  {
    id: 'verse2-01',
    sectionId: 'verse-2',
    fromSec: 86.76,
    endSec: 90.76,
    lines: ['形あるもんは　そりゃたしかに大事', 'でもそればっかだと　景色が dry'],
    align: 'right',
    emphasis: 'soft',
  },
  {
    id: 'verse2-02',
    sectionId: 'verse-2',
    fromSec: 90.76,
    endSec: 94.28,
    lines: ['触れるたびに　なんか足りないし', '胸の奥だけ　置いてくのはないし'],
    align: 'left',
    emphasis: 'bright',
  },
  {
    id: 'verse2-03',
    sectionId: 'verse-2',
    fromSec: 94.28,
    endSec: 98.44,
    lines: ['ほどける夜でも　芯だけは揺れない', '言えないことほど　なぜか消えない'],
    align: 'center',
    emphasis: 'warm',
  },
  {
    id: 'verse2-04',
    sectionId: 'verse-2',
    fromSec: 98.44,
    endSec: 102.04,
    lines: ['輪郭なんて　触れたぶんだけ咲いて', 'いまの自分を　やっと抱いて'],
    align: 'right',
    emphasis: 'soft',
  },
  {
    id: 'verse2-05',
    sectionId: 'verse-2',
    fromSec: 102.04,
    endSec: 106.28,
    lines: ['過去でも未来でもなく　この瞬間', '俺は中今で　今日を生きてるじゃん'],
    align: 'center',
    emphasis: 'bright',
  },
  {
    id: 'hook2-01',
    sectionId: 'hook-2',
    fromSec: 106.28,
    endSec: 111.12,
    lines: ['見えるだけじゃ　まだ足んない', '言えない熱が　まだ冷めない'],
    align: 'center',
    emphasis: 'warm',
  },
  {
    id: 'hook2-02',
    sectionId: 'hook-2',
    fromSec: 111.12,
    endSec: 115.96,
    lines: ['過去でも未来でもない', 'いまここが中今じゃない？'],
    align: 'left',
    emphasis: 'bright',
  },
  {
    id: 'hook2-03',
    sectionId: 'hook-2',
    fromSec: 115.96,
    endSec: 120.8,
    lines: ['ほどけた線が　またつながり', '消えそうな火が　まだ消えない'],
    align: 'right',
    emphasis: 'soft',
  },
  {
    id: 'hook2-04',
    sectionId: 'hook-2',
    fromSec: 120.8,
    endSec: 125.64,
    lines: ['中今に立って　ただ向き合い', '見えないもんまで　抱いていたい'],
    align: 'center',
    emphasis: 'warm',
  },
  {
    id: 'outro-01',
    sectionId: 'outro',
    fromSec: 125.64,
    endSec: 132.52,
    lines: ['見えるだけじゃ　まだ半端', '見えないとこが　ずっと真ん中'],
    align: 'left',
    emphasis: 'soft',
  },
  {
    id: 'outro-02',
    sectionId: 'outro',
    fromSec: 132.52,
    endSec: 141.16,
    lines: ['過去でも未来でもない　この瞬間', '俺は中今で　今日を生きてる'],
    align: 'center',
    emphasis: 'bright',
  },
];

export const secToFrames = (seconds: number) => Math.round(seconds * nakaimaFps);

export const sectionDurationInFrames = (section: NakaimaSection) =>
  Math.max(1, secToFrames(section.endSec - section.startSec));

export const getSectionStartFrame = (section: NakaimaSection) => secToFrames(section.startSec);

export const getSectionAtFrame = (frame: number) => {
  return (
    nakaimaSections.find((section) => {
      const start = getSectionStartFrame(section);
      const end = start + sectionDurationInFrames(section);
      return frame >= start && frame < end;
    }) ?? nakaimaSections[nakaimaSections.length - 1]
  );
};

export const getLyricCuesForSection = (sectionId: string) =>
  nakaimaLyricCues.filter((cue) => cue.sectionId === sectionId);
