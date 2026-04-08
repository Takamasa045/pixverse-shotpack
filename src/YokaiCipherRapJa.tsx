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
  trimBefore?: number;
  trimAfter?: number;
  durationInFrames: number;
  mode: 'scene' | 'rap';
  title: string;
  subtitle?: string;
  lyric?: string[];
  audio?: 'video' | 'none';
};

const fps = 30;

const rapClips: ClipDef[] = [
  {
    id: 'intro-01',
    src: 'yokai-cipher/scene-01.mp4',
    trimBefore: 0,
    trimAfter: 72,
    durationInFrames: 72,
    mode: 'scene',
    title: 'SHRINE ENTRY',
    subtitle: '鳥居の裏で会場が開く',
    audio: 'none',
  },
  {
    id: 'intro-02',
    src: 'yokai-cipher/scene-02.mp4',
    trimBefore: 0,
    trimAfter: 24,
    durationInFrames: 24,
    mode: 'scene',
    title: 'FOX MASK MASTER',
    subtitle: '導師が前へ出る',
    audio: 'none',
  },
  {
    id: 'rap-a',
    src: 'yokai-cipher/rap-ja/LS_A-speech.mp4',
    durationInFrames: 270,
    mode: 'rap',
    title: 'OPENING BARS',
    subtitle: '狐面 MC',
    lyric: [
      '提灯ちらつく、鳥居の裏で開場',
      '狐の面でも、今夜は黒い口が開口',
      '妖怪サイファー、石畳ぜんぶ会場',
    ],
    audio: 'video',
  },
  {
    id: 'react-03',
    src: 'yokai-cipher/scene-03.mp4',
    trimBefore: 24,
    trimAfter: 84,
    durationInFrames: 60,
    mode: 'scene',
    title: 'HITOTSUME',
    subtitle: '視線でフリーズ',
    audio: 'none',
  },
  {
    id: 'react-04',
    src: 'yokai-cipher/scene-04.mp4',
    trimBefore: 28,
    trimAfter: 88,
    durationInFrames: 60,
    mode: 'scene',
    title: 'KARAKASA',
    subtitle: '一本足フットワーク',
    audio: 'none',
  },
  {
    id: 'rap-b',
    src: 'yokai-cipher/rap-ja/LS_B-speech.mp4',
    durationInFrames: 268,
    mode: 'rap',
    title: 'MASTER FLOW',
    subtitle: '祝詞みたいなフロウ',
    lyric: [
      '狐面導師だ、無言で仕切る采配',
      '祝詞みたいなフロウで、夜気ごと再起動',
      '低音ひとつで、社の影まで前傾',
    ],
    audio: 'video',
  },
  {
    id: 'react-05',
    src: 'yokai-cipher/scene-05.mp4',
    trimBefore: 24,
    trimAfter: 84,
    durationInFrames: 60,
    mode: 'scene',
    title: 'ROKUROKUBI',
    subtitle: '首でうねる',
    audio: 'none',
  },
  {
    id: 'react-06',
    src: 'yokai-cipher/scene-06.mp4',
    trimBefore: 32,
    trimAfter: 92,
    durationInFrames: 60,
    mode: 'scene',
    title: 'KAPPA',
    subtitle: '水面が四つ打ちになる',
    audio: 'none',
  },
  {
    id: 'rap-c',
    src: 'yokai-cipher/rap-ja/LS_C-speech.mp4',
    durationInFrames: 280,
    mode: 'rap',
    title: 'YOKAI ROLL CALL',
    subtitle: '目線、ゲタ、首筋',
    lyric: [
      '一つ目ギラリ、視線で客席フリーズ',
      'からかさ一本足、ゲタで刻むディスビート',
      'ろくろ首ウェーブ、月まで伸びる首筋',
    ],
    audio: 'video',
  },
  {
    id: 'climax-07',
    src: 'yokai-cipher/scene-07.mp4',
    trimBefore: 26,
    trimAfter: 176,
    durationInFrames: 150,
    mode: 'scene',
    title: 'CIPHER PEAK',
    subtitle: '百鬼が円陣を組む',
    audio: 'none',
  },
  {
    id: 'rap-d',
    src: 'yokai-cipher/rap-ja/LS_D-speech.mp4',
    durationInFrames: 271,
    mode: 'rap',
    title: 'LAST LANTERN',
    subtitle: '最後の 3 bars',
    lyric: [
      '河童の水打ち、跳ねた雫が四つ打ち',
      '百鬼で円陣、ここから景色が反転',
      '耳の奥で、まだ回ってるループ',
    ],
    audio: 'video',
  },
  {
    id: 'outro-08',
    src: 'yokai-cipher/scene-08.mp4',
    trimBefore: 210,
    trimAfter: 282,
    durationInFrames: 72,
    mode: 'scene',
    title: 'GLOW LEFT BEHIND',
    subtitle: '灯りだけが残る',
    audio: 'none',
  },
];

export const yokaiCipherRapJaDurationInFrames = rapClips.reduce(
  (sum, clip) => sum + clip.durationInFrames,
  0,
);

const clipStarts = rapClips.reduce<number[]>((acc, clip, index) => {
  if (index === 0) {
    acc.push(0);
    return acc;
  }

  acc.push(acc[index - 1] + rapClips[index - 1].durationInFrames);
  return acc;
}, []);

const rapRanges = rapClips
  .map((clip, index) => ({clip, start: clipStarts[index], end: clipStarts[index] + clip.durationInFrames}))
  .filter((item) => item.clip.mode === 'rap');

const isInsideRap = (frame: number) => {
  return rapRanges.some((range) => frame >= range.start && frame < range.end);
};

const beatVolume = (frame: number, durationInFrames: number) => {
  const insideRap = isInsideRap(frame);
  const fadeIn = interpolate(frame, [0, 20], [0, 0.9], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const fadeOut = interpolate(frame, [durationInFrames - 40, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (insideRap ? 0.32 : 0.82) * fadeIn * fadeOut;
};

const ClipCard: React.FC<{
  clip: ClipDef;
  accent: string;
}> = ({clip, accent}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const drift = interpolate(frame, [0, clip.durationInFrames], [1.03, 1.0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const floatY = interpolate(frame, [0, clip.durationInFrames], [16, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const fadeInEnd = Math.min(12, Math.max(1, Math.floor(clip.durationInFrames / 3)));
  const fadeOutStart = Math.max(fadeInEnd + 1, clip.durationInFrames - Math.min(20, Math.floor(clip.durationInFrames / 3)));
  const titleOpacity = interpolate(frame, [0, fadeInEnd, fadeOutStart, clip.durationInFrames], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{backgroundColor: '#02030A'}}>
      <Video
        src={staticFile(clip.src)}
        trimBefore={clip.trimBefore}
        trimAfter={clip.trimAfter}
        muted={clip.audio !== 'video'}
        volume={clip.audio === 'video' ? 1 : 0}
        objectFit="cover"
        style={{
          width: '100%',
          height: '100%',
          transform: `scale(${drift}) translateY(${floatY}px)`,
          filter: clip.mode === 'rap' ? 'contrast(1.08) saturate(1.08)' : 'contrast(1.05) saturate(1.02)',
        }}
      />

      <Img
        src={
          clip.mode === 'rap'
            ? staticFile('yokai-cipher/ref-shot-07.webp')
            : staticFile('yokai-cipher/ref-shot-01.webp')
        }
        style={{
          position: 'absolute',
          inset: -60,
          width: width + 120,
          height: height + 120,
          objectFit: 'cover',
          filter: 'blur(36px) brightness(0.22) saturate(1.1)',
          opacity: 0.35,
          zIndex: -1,
        }}
      />

      <AbsoluteFill
        style={{
          background:
            clip.mode === 'rap'
              ? 'linear-gradient(180deg, rgba(4,5,11,0.08) 0%, rgba(4,5,11,0.18) 52%, rgba(4,5,11,0.88) 100%)'
              : 'linear-gradient(180deg, rgba(4,5,11,0.18) 0%, rgba(4,5,11,0.22) 52%, rgba(4,5,11,0.9) 100%)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: 36,
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
            const lineIn = index * 60;
            const lineOut = lineIn + 86;
            const lineOpacity = interpolate(frame, [lineIn, lineIn + 12, lineOut - 10, lineOut], [0, 1, 1, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            return (
              <div
                key={`${clip.id}-${line}`}
                style={{
                  opacity: lineOpacity,
                  transform: `translateY(${interpolate(frame, [lineIn, lineIn + 12], [14, 0], {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                  })}px)`,
                  background: 'rgba(4,5,11,0.52)',
                  border: '1px solid rgba(244,241,234,0.1)',
                  backdropFilter: 'blur(8px)',
                  padding: '10px 16px 12px',
                  borderRadius: 14,
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
        妖怪 CIPHER / JA RAP CUT
      </div>
    </AbsoluteFill>
  );
};

type Props = {
  manifest: ShotpackManifest;
};

export const YokaiCipherRapJa: React.FC<Props> = ({manifest}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const accent = manifest.theme.accent;
  const activeRap = rapRanges.find((range) => frame >= range.start && frame < range.end);

  return (
    <AbsoluteFill style={{backgroundColor: manifest.theme.background, overflow: 'hidden'}}>
      <Audio
        src={staticFile('yokai-cipher/audio/yokai-cipher-score.wav')}
        loop
        volume={(f) => beatVolume(f, durationInFrames)}
      />

      {rapClips.map((clip, index) => (
        <Sequence key={clip.id} from={clipStarts[index]} durationInFrames={clip.durationInFrames}>
          <ClipCard clip={clip} accent={accent} />
        </Sequence>
      ))}

      <YokaiCipherAmbient3D seed="YokaiCipherRapJa" opacity={0.26} />

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
        {rapClips.map((clip, index) => {
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

      {activeRap ? (
        <div
          style={{
            position: 'absolute',
            right: 40,
            bottom: 54,
            background: 'rgba(4,5,11,0.55)',
            border: '1px solid rgba(244,241,234,0.08)',
            borderRadius: 999,
            padding: '8px 14px',
            color: '#F4F1EA',
            fontFamily: '"Bebas Neue", sans-serif',
            fontSize: 24,
            letterSpacing: 2,
          }}
        >
          FOX MASK MC / JAPANESE RAP
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
