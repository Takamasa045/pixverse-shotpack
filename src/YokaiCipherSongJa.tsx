import '@fontsource/bebas-neue/400.css';
import '@fontsource/noto-sans-jp/500.css';
import '@fontsource/noto-sans-jp/700.css';
import React from 'react';
import {Audio, Video} from '@remotion/media';
import {
  AbsoluteFill,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {YokaiCipherAmbient3D} from './YokaiCipherAmbient3D';
import type {ShotpackManifest} from './types';

type ClipDef = {
  id: string;
  src: string;
  durationInFrames: number;
  mode: 'rap' | 'crew';
  title: string;
  subtitle: string;
  lyric?: string[];
  trimBefore?: number;
  trimAfter?: number;
  loop?: boolean;
  backgroundSrc?: string;
};

const fps = 30;
const secondsToFrames = (seconds: number) => Math.round(seconds * fps);

const songClips: ClipDef[] = [
  {
    id: 'cut-01',
    src: 'yokai-cipher/rap-ja-v2/CUT_01-speech-flat.mp4',
    durationInFrames: secondsToFrames(6.22),
    mode: 'rap',
    title: 'LANTERN ENTRY',
    subtitle: 'ろくろ首 MC',
    lyric: ['提灯チカチカ　路地裏 midnight', '鳥居のかげから　low な bad sign'],
    backgroundSrc: 'yokai-cipher/rap-ja-v2/rokuro-A.png',
  },
  {
    id: 'crew-01',
    src: 'yokai-cipher/scene-02.mp4',
    durationInFrames: secondsToFrames(6.76),
    mode: 'crew',
    title: 'ALLEY OPEN',
    subtitle: '会場がひらく',
    trimBefore: 0,
    trimAfter: secondsToFrames(6.76),
    loop: true,
    backgroundSrc: 'yokai-cipher/ref-shot-02.webp',
  },
  {
    id: 'cut-02',
    src: 'yokai-cipher/rap-ja-v2/CUT_02-speech-flat.mp4',
    durationInFrames: secondsToFrames(5.98),
    mode: 'rap',
    title: 'CIPHER CALL',
    subtitle: 'Hook 1',
    lyric: ['妖怪サイファー　輪になり集合', 'こっちとあっちの　真ん中で集合'],
    backgroundSrc: 'yokai-cipher/rap-ja-v2/rokuro-A.png',
  },
  {
    id: 'cut-03',
    src: 'yokai-cipher/rap-ja-v2/CUT_03-speech-flat.mp4',
    durationInFrames: secondsToFrames(6.56),
    mode: 'rap',
    title: 'STONE FLOOR',
    subtitle: 'Hook 2',
    lyric: ['カツン鳴る足音　石畳振動', 'こわいのにまた来る　それもう中毒'],
    backgroundSrc: 'yokai-cipher/rap-ja-v2/rokuro-A.png',
  },
  {
    id: 'crew-02',
    src: 'yokai-cipher/scene-03.mp4',
    durationInFrames: secondsToFrames(1.54),
    mode: 'crew',
    title: 'EYE CONTACT',
    subtitle: '一つ目の差し込み',
    trimBefore: 30,
    trimAfter: 30 + secondsToFrames(1.54),
    backgroundSrc: 'yokai-cipher/ref-shot-03.webp',
  },
  {
    id: 'cut-04',
    src: 'yokai-cipher/rap-ja-v2/CUT_04-speech-flat.mp4',
    durationInFrames: secondsToFrames(6.68),
    mode: 'rap',
    title: 'NO EXIT',
    subtitle: 'Hook 3',
    lyric: ['提灯が誘導　目が合ったその秒で', '逃げ場は空洞　笑ってる顔ほど'],
    backgroundSrc: 'yokai-cipher/rap-ja-v2/rokuro-C.png',
  },
  {
    id: 'crew-03',
    src: 'yokai-cipher/scene-04.mp4',
    durationInFrames: secondsToFrames(5.15),
    mode: 'crew',
    title: 'UMBRELLA CUT',
    subtitle: 'からかさの合いの手',
    trimBefore: 16,
    trimAfter: 16 + secondsToFrames(5.15),
    backgroundSrc: 'yokai-cipher/ref-shot-04.webp',
  },
  {
    id: 'cut-05',
    src: 'yokai-cipher/rap-ja-v2/CUT_05-speech-flat.mp4',
    durationInFrames: secondsToFrames(6.42),
    mode: 'rap',
    title: 'ROKURO RISE',
    subtitle: 'Verse 4',
    lyric: ['ろくろ首　するする伸びてく neck', '月まで届きそうな　長めの phrase'],
    backgroundSrc: 'yokai-cipher/rap-ja-v2/rokuro-C.png',
  },
  {
    id: 'cut-06',
    src: 'yokai-cipher/rap-ja-v2/CUT_06-speech-flat.mp4',
    durationInFrames: secondsToFrames(6.28),
    mode: 'rap',
    title: 'GROOVE SHIFT',
    subtitle: 'Verse 4',
    lyric: ['体はじっとでも　目だけは move', 'こわさがいつの間にか　変わって groove'],
    backgroundSrc: 'yokai-cipher/rap-ja-v2/rokuro-A.png',
  },
  {
    id: 'cut-07',
    src: 'yokai-cipher/rap-ja-v2/CUT_07-speech-flat.mp4',
    durationInFrames: secondsToFrames(7.25),
    mode: 'rap',
    title: 'NECK PASS',
    subtitle: 'Verse 4',
    lyric: ['上から下まで　視線が横断', 'ひやっとするのに　なぜかまた dance'],
    backgroundSrc: 'yokai-cipher/rap-ja-v2/rokuro-C.png',
  },
  {
    id: 'cut-08',
    src: 'yokai-cipher/rap-ja-v2/CUT_08-speech-flat.mp4',
    durationInFrames: secondsToFrames(5.68),
    mode: 'rap',
    title: 'CIPHER PEAK',
    subtitle: 'Climax',
    lyric: ['百鬼で cypher　真ん中が hot', 'バケモノばっか　なのに品は top'],
    backgroundSrc: 'yokai-cipher/rap-ja-v2/rokuro-A.png',
  },
  {
    id: 'crew-04',
    src: 'yokai-cipher/scene-07.mp4',
    durationInFrames: secondsToFrames(6.64),
    mode: 'crew',
    title: 'FULL CIRCLE',
    subtitle: '百鬼の円陣',
    trimBefore: 24,
    trimAfter: 24 + secondsToFrames(6.64),
    backgroundSrc: 'yokai-cipher/ref-shot-07.webp',
  },
  {
    id: 'cut-09',
    src: 'yokai-cipher/rap-ja-v2/CUT_09-speech-flat.mp4',
    durationInFrames: secondsToFrames(6.8),
    mode: 'rap',
    title: 'NO BORDER',
    subtitle: 'Climax 2',
    lyric: ['こっちとあっちの　線なんてもうない', 'こわいのに気持ちいい　それがしょうがない'],
    backgroundSrc: 'yokai-cipher/rap-ja-v2/rokuro-C.png',
  },
  {
    id: 'crew-05',
    src: 'yokai-cipher/scene-08.mp4',
    durationInFrames: secondsToFrames(6.15),
    mode: 'crew',
    title: 'LANTERN TAIL',
    subtitle: '余韻の回廊',
    trimBefore: 120,
    trimAfter: 120 + secondsToFrames(6.15),
    backgroundSrc: 'yokai-cipher/ref-shot-08.webp',
  },
  {
    id: 'cut-10',
    src: 'yokai-cipher/rap-ja-v2/CUT_10-speech-flat.mp4',
    durationInFrames: secondsToFrames(5.86),
    mode: 'rap',
    title: 'SMOKE OUT',
    subtitle: 'Outro',
    lyric: ['提灯ゆらゆら　まだ残る beat', '朝が来る前に　消えてく smoke'],
    backgroundSrc: 'yokai-cipher/rap-ja-v2/rokuro-A.png',
  },
  {
    id: 'cut-11',
    src: 'yokai-cipher/rap-ja-v2/CUT_11-speech-flat.mp4',
    durationInFrames: secondsToFrames(6.68),
    mode: 'rap',
    title: 'LOOP',
    subtitle: 'Outro 2',
    lyric: ['いないはずなのに　耳の奥 loop', '妖怪サイファー　また今夜 move'],
    backgroundSrc: 'yokai-cipher/rap-ja-v2/rokuro-C.png',
  },
  {
    id: 'cut-12',
    src: 'yokai-cipher/rap-ja-v2/CUT_12-speech-flat.mp4',
    durationInFrames: secondsToFrames(7.06),
    mode: 'rap',
    title: 'NO ONE THERE',
    subtitle: 'Last line',
    lyric: ['振り向いた時には　誰ももういない', 'なのにこのリズムだけ　朝まで消えない'],
    backgroundSrc: 'yokai-cipher/rap-ja-v2/rokuro-A.png',
  },
];

export const yokaiCipherSongJaDurationInFrames = songClips.reduce(
  (sum, clip) => sum + clip.durationInFrames,
  0,
);

const clipStarts = songClips.reduce<number[]>((acc, clip, index) => {
  if (index === 0) {
    acc.push(0);
    return acc;
  }

  acc.push(acc[index - 1] + songClips[index - 1].durationInFrames);
  return acc;
}, []);

const soundtrackVolume = (frame: number, durationInFrames: number) => {
  const fadeIn = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const fadeOut = interpolate(frame, [durationInFrames - 30, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return fadeIn * fadeOut;
};

const ClipCard: React.FC<{
  clip: ClipDef;
  accent: string;
}> = ({clip, accent}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const drift = interpolate(frame, [0, clip.durationInFrames], [1.03, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const lift = interpolate(frame, [0, clip.durationInFrames], [18, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const fadeInEnd = Math.min(12, Math.max(1, Math.floor(clip.durationInFrames / 3)));
  const fadeOutStart = Math.max(
    fadeInEnd + 1,
    clip.durationInFrames - Math.min(20, Math.floor(clip.durationInFrames / 3)),
  );
  const titleOpacity = interpolate(
    frame,
    [0, fadeInEnd, fadeOutStart, clip.durationInFrames],
    [0, 1, 1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    },
  );
  const background = clip.backgroundSrc ?? 'yokai-cipher/ref-shot-05.webp';

  return (
    <AbsoluteFill style={{backgroundColor: '#02030A'}}>
      <Img
        src={staticFile(background)}
        style={{
          position: 'absolute',
          inset: -48,
          width: width + 96,
          height: height + 96,
          objectFit: 'cover',
          filter: 'blur(32px) brightness(0.22) saturate(1.1)',
          opacity: 0.48,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            clip.mode === 'rap'
              ? 'radial-gradient(circle at 50% 12%, rgba(229,136,43,0.18), transparent 28%), linear-gradient(180deg, rgba(4,5,11,0.1) 0%, rgba(4,5,11,0.18) 42%, rgba(4,5,11,0.88) 100%)'
              : 'linear-gradient(180deg, rgba(4,5,11,0.18) 0%, rgba(4,5,11,0.22) 52%, rgba(4,5,11,0.9) 100%)',
        }}
      />
      <Video
        src={staticFile(clip.src)}
        trimBefore={clip.trimBefore}
        trimAfter={clip.trimAfter}
        muted
        loop={clip.loop}
        objectFit="cover"
        style={{
          width: '100%',
          height: '100%',
          transform: `scale(${drift}) translateY(${lift}px)`,
          filter: clip.mode === 'rap' ? 'contrast(1.08) saturate(1.08)' : 'contrast(1.04) saturate(1.02)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: 34,
          left: 42,
          opacity: titleOpacity,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        <div
          style={{
            fontFamily: '"Bebas Neue", sans-serif',
            fontSize: 46,
            letterSpacing: 3,
            color: '#F4F1EA',
            lineHeight: 0.9,
          }}
        >
          {clip.title}
        </div>
        <div
          style={{
            fontFamily: '"Noto Sans JP", sans-serif',
            fontSize: 16,
            fontWeight: 700,
            color: accent,
            letterSpacing: 1,
          }}
        >
          {clip.subtitle}
        </div>
      </div>

      {clip.lyric ? (
        <div
          style={{
            position: 'absolute',
            left: 72,
            right: 72,
            bottom: 62,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            alignItems: 'flex-start',
          }}
        >
          {clip.lyric.map((line, index) => {
            const segment = Math.floor(clip.durationInFrames / clip.lyric!.length);
            const lineIn = index * segment;
            const lineOut = Math.min(clip.durationInFrames, lineIn + segment + 20);
            const lineOpacity = interpolate(
              frame,
              [lineIn, Math.min(lineIn + 12, lineOut), Math.max(lineOut - 12, lineIn + 1), lineOut],
              [0, 1, 1, 0],
              {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              },
            );
            return (
              <div
                key={`${clip.id}-${line}`}
                style={{
                  opacity: lineOpacity,
                  transform: `translateY(${interpolate(frame, [lineIn, Math.min(lineIn + 12, lineOut)], [14, 0], {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                  })}px)`,
                  background: 'rgba(4,5,11,0.58)',
                  border: '1px solid rgba(244,241,234,0.08)',
                  backdropFilter: 'blur(12px)',
                  padding: '12px 18px 14px',
                  borderRadius: 16,
                  boxShadow: '0 14px 40px rgba(0,0,0,0.28)',
                }}
              >
                <div
                  style={{
                    fontFamily: '"Noto Sans JP", sans-serif',
                    fontSize: 28,
                    fontWeight: 700,
                    color: '#F4F1EA',
                    lineHeight: 1.2,
                    letterSpacing: 0.6,
                  }}
                >
                  {line}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      <div
        style={{
          position: 'absolute',
          right: 24,
          top: 124,
          writingMode: 'vertical-rl',
          fontFamily: '"Noto Sans JP", sans-serif',
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: 3,
          color: 'rgba(244,241,234,0.44)',
        }}
      >
        ROKUROKUBI MC / SUNO CUT
      </div>
    </AbsoluteFill>
  );
};

type Props = {
  manifest: ShotpackManifest;
};

export const YokaiCipherSongJa: React.FC<Props> = ({manifest}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const accent = manifest.theme.accent;

  return (
    <AbsoluteFill style={{backgroundColor: manifest.theme.background, overflow: 'hidden'}}>
      <Audio
        src={staticFile('yokai-cipher/audio/yokai-cipher-song-cut.wav')}
        volume={(f) => soundtrackVolume(f, durationInFrames)}
      />

      {songClips.map((clip, index) => (
        <Sequence key={clip.id} from={clipStarts[index]} durationInFrames={clip.durationInFrames}>
          <ClipCard clip={clip} accent={accent} />
        </Sequence>
      ))}

      <YokaiCipherAmbient3D seed="YokaiCipherSongJa" opacity={0.26} />

      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          background:
            'radial-gradient(circle at 50% 100%, rgba(229,136,43,0.14) 0%, transparent 50%), radial-gradient(circle at 50% 0%, rgba(244,241,234,0.04) 0%, transparent 36%)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: 26,
          right: 26,
          bottom: 18,
          display: 'flex',
          gap: 8,
        }}
      >
        {songClips.map((clip, index) => {
          const start = clipStarts[index];
          const end = start + clip.durationInFrames;
          const active = frame >= start && frame < end;
          return (
            <div
              key={clip.id}
              style={{
                flex: clip.durationInFrames,
                height: active ? 8 : 4,
                borderRadius: 999,
                background: active ? accent : 'rgba(244,241,234,0.16)',
                boxShadow: active ? `0 0 24px ${accent}` : 'none',
              }}
            />
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
