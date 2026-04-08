import '@fontsource/bebas-neue/400.css';
import '@fontsource/noto-sans-jp/500.css';
import '@fontsource/noto-sans-jp/700.css';
import React from 'react';
import {Audio, Video} from '@remotion/media';
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  spring,
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
  trimBefore: number;
  mode: 'source' | 'lipsync';
  label?: string;
};

type LyricCue = {
  id: string;
  from: number;
  durationInFrames: number;
  lines: string[];
  align: 'left' | 'center' | 'right';
  tag: string;
};

const fps = 30;
const s = (seconds: number) => Math.round(seconds * fps);
const yFont = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Sans JP", serif';
const source = 'yokai-cipher/yokai-cipher-full-source.mp4';
const scene01 = 'yokai-cipher/scene-01.mp4';
const scene02 = 'yokai-cipher/scene-02.mp4';
const scene03 = 'yokai-cipher/scene-03.mp4';
const scene04 = 'yokai-cipher/scene-04.mp4';
const scene05 = 'yokai-cipher/scene-05.mp4';
const scene06 = 'yokai-cipher/scene-06.mp4';
const scene07 = 'yokai-cipher/scene-07.mp4';
const scene08 = 'yokai-cipher/scene-08.mp4';

const clips: ClipDef[] = [
  {id: 'src-01', src: scene01, trimBefore: 0, durationInFrames: 32, mode: 'source', label: 'ENTRY'},
  {id: 'src-02', src: scene01, trimBefore: 38, durationInFrames: 40, mode: 'source'},
  {id: 'src-03', src: scene02, trimBefore: 8, durationInFrames: 22, mode: 'source'},
  {id: 'src-04', src: scene03, trimBefore: 20, durationInFrames: 36, mode: 'source'},
  {id: 'src-05', src: scene04, trimBefore: 8, durationInFrames: 18, mode: 'source'},
  {id: 'src-06', src: scene02, trimBefore: 54, durationInFrames: 35, mode: 'source'},
  {id: 'src-07', src: scene07, trimBefore: 0, durationInFrames: 60, mode: 'source', label: 'CROWD RISE'},
  {id: 'src-08', src: scene04, trimBefore: 52, durationInFrames: 34, mode: 'source'},
  {id: 'src-09', src: scene06, trimBefore: 0, durationInFrames: 30, mode: 'source', label: 'WATER STEP'},
  {id: 'src-10', src: scene03, trimBefore: 78, durationInFrames: 20, mode: 'source'},
  {id: 'src-11', src: scene07, trimBefore: 66, durationInFrames: 44, mode: 'source'},
  {id: 'src-12', src: scene02, trimBefore: 110, durationInFrames: 24, mode: 'source'},
  {id: 'lip-02a', src: 'yokai-cipher/rap-ja-v2/CUT_02-speech-flat.mp4', trimBefore: 0, durationInFrames: 38, mode: 'lipsync', label: 'HOOK CALL'},
  {id: 'src-13', src: scene07, trimBefore: 114, durationInFrames: 26, mode: 'source'},
  {id: 'src-14', src: source, trimBefore: s(17.8), durationInFrames: 42, mode: 'source'},
  {id: 'src-15', src: scene04, trimBefore: 94, durationInFrames: 36, mode: 'source', label: 'HOOK SNAP'},

  {id: 'lip-04a', src: 'yokai-cipher/rap-ja-v2/CUT_04-speech-flat.mp4', trimBefore: 0, durationInFrames: 44, mode: 'lipsync', label: 'LURE'},
  {id: 'src-16', src: scene03, trimBefore: 48, durationInFrames: 18, mode: 'source'},
  {id: 'lip-04b', src: 'yokai-cipher/rap-ja-v2/CUT_04-speech-flat.mp4', trimBefore: 44, durationInFrames: 50, mode: 'lipsync'},
  {id: 'src-17', src: scene04, trimBefore: 132, durationInFrames: 16, mode: 'source'},
  {id: 'src-18', src: scene06, trimBefore: 40, durationInFrames: 40, mode: 'source'},
  {id: 'src-19', src: scene07, trimBefore: 146, durationInFrames: 27, mode: 'source', label: 'NO EXIT'},

  {id: 'verse-05a', src: scene05, trimBefore: 0, durationInFrames: 48, mode: 'source', label: 'VERSE SHAKE'},
  {id: 'src-20', src: scene03, trimBefore: 134, durationInFrames: 14, mode: 'source'},
  {id: 'verse-05b', src: scene05, trimBefore: 52, durationInFrames: 50, mode: 'source'},
  {id: 'src-21', src: scene06, trimBefore: 74, durationInFrames: 10, mode: 'source'},
  {id: 'verse-05c', src: scene05, trimBefore: 108, durationInFrames: 48, mode: 'source'},
  {id: 'src-22', src: scene04, trimBefore: 150, durationInFrames: 12, mode: 'source'},
  {id: 'verse-06a', src: scene06, trimBefore: 86, durationInFrames: 50, mode: 'source'},
  {id: 'src-23', src: scene03, trimBefore: 146, durationInFrames: 12, mode: 'source'},
  {id: 'verse-06b', src: scene06, trimBefore: 118, durationInFrames: 50, mode: 'source'},
  {id: 'src-24', src: scene07, trimBefore: 170, durationInFrames: 10, mode: 'source'},
  {id: 'verse-06c', src: source, trimBefore: s(31.8), durationInFrames: 45, mode: 'source'},
  {id: 'src-25', src: scene05, trimBefore: 24, durationInFrames: 28, mode: 'source', label: 'NECK WAVE'},

  {id: 'lip-08a', src: 'yokai-cipher/rap-ja-v2/CUT_08-speech-flat.mp4', trimBefore: 0, durationInFrames: 44, mode: 'lipsync', label: 'CIPHER PEAK'},
  {id: 'src-26', src: scene07, trimBefore: 78, durationInFrames: 14, mode: 'source'},
  {id: 'lip-08b', src: 'yokai-cipher/rap-ja-v2/CUT_08-speech-flat.mp4', trimBefore: 44, durationInFrames: 46, mode: 'lipsync'},
  {id: 'src-27', src: scene06, trimBefore: 126, durationInFrames: 12, mode: 'source'},
  {id: 'src-28', src: source, trimBefore: s(42.0), durationInFrames: 44, mode: 'source'},
  {id: 'src-29', src: scene04, trimBefore: 30, durationInFrames: 14, mode: 'source'},
  {id: 'src-30', src: scene08, trimBefore: 120, durationInFrames: 39, mode: 'source'},
  {id: 'src-31', src: scene08, trimBefore: 190, durationInFrames: 33, mode: 'source', label: 'END'},
];

const lyricCues: LyricCue[] = [
  {id: 'lyric-01', from: s(0.0), durationInFrames: s(3.08), lines: ['提灯チカチカ', '路地裏 midnight'], align: 'left', tag: '提灯'},
  {id: 'lyric-02', from: s(3.08), durationInFrames: s(3.12), lines: ['鳥居のかげから', 'low な bad sign'], align: 'right', tag: '鳥居'},
  {id: 'lyric-03', from: s(6.2), durationInFrames: s(3.18), lines: ['誰もいないはず', 'でも気配が満開'], align: 'left', tag: '気配'},
  {id: 'lyric-04', from: s(9.38), durationInFrames: s(3.24), lines: ['今夜この路地が', '俺らの会場'], align: 'center', tag: '会場'},
  {id: 'lyric-05', from: s(12.62), durationInFrames: s(3.16), lines: ['妖怪サイファー', '輪になり集合'], align: 'right', tag: '集'},
  {id: 'lyric-06', from: s(15.78), durationInFrames: s(3.18), lines: ['こっちとあっちの', '真ん中で集合'], align: 'center', tag: '境'},
  {id: 'lyric-07', from: s(18.81), durationInFrames: s(3.23), lines: ['提灯が誘導'], align: 'left', tag: '誘導'},
  {id: 'lyric-08', from: s(22.04), durationInFrames: s(3.45), lines: ['目が合ったその秒で', '逃げ場は空洞'], align: 'right', tag: '空洞'},
  {id: 'lyric-09', from: s(25.34), durationInFrames: s(3.14), lines: ['ろくろ首', 'するする伸びてく neck'], align: 'center', tag: '首'},
  {id: 'lyric-10', from: s(28.48), durationInFrames: s(3.18), lines: ['月まで届きそうな', '長めの phrase'], align: 'left', tag: '月'},
  {id: 'lyric-11', from: s(31.66), durationInFrames: s(3.2), lines: ['体はじっとでも', '目だけは move'], align: 'right', tag: '目'},
  {id: 'lyric-12', from: s(34.86), durationInFrames: s(3.18), lines: ['こわさがいつの間にか', '変わって groove'], align: 'center', tag: '舞'},
  {id: 'lyric-13', from: s(37.89), durationInFrames: s(3.57), lines: ['百鬼で cypher', '真ん中が hot'], align: 'left', tag: '百鬼'},
  {id: 'lyric-14', from: s(41.46), durationInFrames: s(3.69), lines: ['バケモノばっか', 'なのに品は top'], align: 'right', tag: '宴'},
];

export const yokaiCipherDigest45DurationInFrames = clips.reduce(
  (sum, clip) => sum + clip.durationInFrames,
  0,
);

const clipStarts = clips.reduce<number[]>((acc, clip, index) => {
  if (index === 0) {
    acc.push(0);
    return acc;
  }

  acc.push(acc[index - 1] + clips[index - 1].durationInFrames);
  return acc;
}, []);

const AnimatedLyricLine: React.FC<{
  text: string;
  lineIndex: number;
  accent: string;
}> = ({text, lineIndex, accent}) => {
  const frame = useCurrentFrame();
  const chars = Array.from(text);

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '0 2px',
      }}
    >
      {chars.map((char, index) => {
        const charDelay = lineIndex * 5 + index * 1.35;
        const inStart = charDelay;
        const inEnd = charDelay + 6;
        const charOpacity = interpolate(frame, [inStart, inEnd], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const charY = interpolate(frame, [inStart, inEnd], [28, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const charRotate = interpolate(frame, [inStart, inEnd], [-8, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const ghost = 0.32 + Math.max(0, Math.sin((frame - charDelay) / 3) * 0.18);

        return (
          <span
            key={`${text}-${index}-${char}`}
            style={{
              position: 'relative',
              display: 'inline-block',
              whiteSpace: char === ' ' ? 'pre' : 'normal',
              transform: `translateY(${charY}px) rotate(${charRotate}deg)`,
              opacity: charOpacity,
              color: '#F7F1E6',
              fontFamily: yFont,
              fontSize: 74 - lineIndex * 8,
              fontWeight: 700,
              lineHeight: 1.04,
              letterSpacing: `${Math.max(1.5, 5 - lineIndex * 1.2)}px`,
              WebkitTextStroke: '1px rgba(18,10,7,0.9)',
              textShadow: `0 0 8px rgba(255,243,220,0.35), 0 0 22px ${accent}${Math.round(ghost * 255)
                .toString(16)
                .padStart(2, '0')}, 0 14px 38px rgba(0,0,0,0.38)`,
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        );
      })}
    </div>
  );
};

const YokaiLyricCard: React.FC<{
  cue: LyricCue;
  accent: string;
}> = ({cue, accent}) => {
  const frame = useCurrentFrame();
  const {fps, width} = useVideoConfig();
  const burst = spring({
    fps,
    frame,
    config: {
      damping: 11,
      mass: 0.7,
      stiffness: 150,
    },
    durationInFrames: Math.min(18, Math.max(6, cue.durationInFrames - 6)),
  });
  const fadeOutStart = Math.max(10, cue.durationInFrames - 10);
  const opacity = interpolate(frame, [0, 3, fadeOutStart, cue.durationInFrames], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const blur = interpolate(frame, [0, 6], [18, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const smearX = interpolate(frame, [0, 8], [24, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const justifyContent =
    cue.align === 'left' ? 'flex-start' : cue.align === 'right' ? 'flex-end' : 'center';
  const rotate = cue.align === 'left' ? -3.2 : cue.align === 'right' ? 3.2 : 0;
  const floatY = Math.sin(frame / 4) * 3.5;
  const tagSideStyle =
    cue.align === 'right'
      ? {left: 54 as number | string, right: 'auto' as const}
      : {right: 54 as number | string, left: 'auto' as const};

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'flex-end',
        padding: '0 56px 58px',
        pointerEvents: 'none',
        opacity,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 112,
          writingMode: 'vertical-rl',
          fontFamily: yFont,
          fontSize: 26,
          fontWeight: 700,
          letterSpacing: 6,
          color: 'rgba(244,241,234,0.32)',
          textShadow: `0 0 24px ${accent}22`,
          ...tagSideStyle,
        }}
      >
        {cue.tag}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent,
        }}
      >
        <div
          style={{
            position: 'relative',
            width: Math.min(960, width - 112),
            padding: '26px 30px 28px',
            borderRadius: 28,
            overflow: 'hidden',
            transform: `translateY(${(1 - burst) * 34 + floatY}px) scale(${0.88 + burst * 0.12}) rotate(${rotate * (1 - burst)}deg)`,
            filter: `blur(${blur}px)`,
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 28,
              background:
                'linear-gradient(135deg, rgba(8,10,18,0.88) 0%, rgba(20,12,9,0.74) 56%, rgba(8,10,18,0.88) 100%)',
              border: '1px solid rgba(244,241,234,0.12)',
              boxShadow: '0 18px 54px rgba(0,0,0,0.45)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 28,
              background: `linear-gradient(90deg, transparent 0%, ${accent}33 22%, transparent 60%)`,
              transform: `translateX(${smearX * (cue.align === 'right' ? -1 : 1)}px)`,
              mixBlendMode: 'screen',
              opacity: 0.72,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 12,
              left: cue.align === 'right' ? 'auto' : 24,
              right: cue.align === 'right' ? 24 : 'auto',
              width: 148,
              height: 6,
              borderRadius: 999,
              background: `linear-gradient(90deg, ${accent}, rgba(244,241,234,0.82))`,
              boxShadow: `0 0 24px ${accent}`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 28,
              opacity: 0.2,
              transform: `translate(${cue.align === 'right' ? -10 : 10}px, 8px) scale(1.01)`,
              filter: 'blur(12px)',
              color: accent,
              fontFamily: yFont,
              fontSize: 78,
              fontWeight: 700,
              lineHeight: 1.02,
              letterSpacing: '4px',
              padding: '28px 34px',
            }}
          >
            {cue.lines.join(' / ')}
          </div>
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
              textAlign: 'center',
            }}
          >
            {cue.lines.map((line, index) => (
              <AnimatedLyricLine
                key={`${cue.id}-${line}`}
                text={line}
                lineIndex={index}
                accent={accent}
              />
            ))}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const DigestClip: React.FC<{
  clip: ClipDef;
  accent: string;
}> = ({clip, accent}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const fadeInEnd = Math.min(6, Math.max(1, Math.floor(clip.durationInFrames / 3)));
  const fadeOutStart = Math.max(
    fadeInEnd + 1,
    clip.durationInFrames - Math.min(8, Math.max(1, Math.floor(clip.durationInFrames / 3))),
  );
  const glowPeak =
    clip.durationInFrames <= 1 ? 1 : Math.min(6, Math.max(1, Math.floor((clip.durationInFrames - 1) / 2)));
  const drift = interpolate(frame, [0, clip.durationInFrames], [1.05, 1.0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const glow =
    clip.durationInFrames <= 1
      ? 0.18
      : interpolate(frame, [0, glowPeak, clip.durationInFrames], [0.15, 0.3, 0.14], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
  const tagOpacity = interpolate(frame, [0, fadeInEnd, fadeOutStart, clip.durationInFrames], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{backgroundColor: '#02030A'}}>
      <Img
        src={
          clip.mode === 'lipsync'
            ? staticFile('yokai-cipher/rap-ja-v2/rokuro-C.png')
            : staticFile('yokai-cipher/ref-shot-07.webp')
        }
        style={{
          position: 'absolute',
          inset: -54,
          width: width + 108,
          height: height + 108,
          objectFit: 'cover',
          filter: 'blur(40px) brightness(0.16) saturate(1.18)',
          opacity: 0.48,
        }}
      />
      <Video
        src={staticFile(clip.src)}
        trimBefore={clip.trimBefore}
        muted
        objectFit="cover"
        style={{
          width: '100%',
          height: '100%',
          transform: `scale(${drift})`,
          filter: clip.mode === 'lipsync' ? 'contrast(1.09) saturate(1.09)' : 'contrast(1.06) saturate(1.04)',
        }}
      />
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(180deg, rgba(4,5,11,0.14) 0%, rgba(4,5,11,0.18) 38%, rgba(4,5,11,0.82) 100%)',
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 12%, rgba(229,136,43,${glow}), transparent 22%)`,
          mixBlendMode: 'screen',
        }}
      />

      {clip.label ? (
        <div
          style={{
            position: 'absolute',
            top: 28,
            left: 34,
            opacity: tagOpacity,
            background: 'rgba(4,5,11,0.5)',
            border: '1px solid rgba(244,241,234,0.08)',
            borderRadius: 999,
            padding: '7px 14px',
            color: '#F4F1EA',
            fontFamily: '"Bebas Neue", sans-serif',
            fontSize: 24,
            letterSpacing: 2,
          }}
        >
          {clip.label}
        </div>
      ) : null}

      {clip.mode === 'lipsync' ? (
        <div
          style={{
            position: 'absolute',
            right: 26,
            top: 32,
            opacity: tagOpacity,
            background: 'rgba(4,5,11,0.52)',
            border: '1px solid rgba(244,241,234,0.08)',
            borderRadius: 999,
            padding: '7px 14px',
            color: accent,
            fontFamily: yFont,
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: 2,
          }}
        >
          ろくろ首
        </div>
      ) : null}

      {clip.mode === 'source' ? (
        <div
          style={{
            position: 'absolute',
            right: 34,
            bottom: 116,
            writingMode: 'vertical-rl',
            opacity: 0.36,
            color: 'rgba(244,241,234,0.62)',
            fontFamily: yFont,
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: 3,
          }}
        >
          百鬼夜行
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

type Props = {
  manifest: ShotpackManifest;
};

export const YokaiCipherDigest45: React.FC<Props> = ({manifest}) => {
  const frame = useCurrentFrame();
  const accent = manifest.theme.accent;
  const sfxVolume = interpolate(frame, [0, 12, yokaiCipherDigest45DurationInFrames - 30, yokaiCipherDigest45DurationInFrames], [0, 1.18, 1.18, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{backgroundColor: manifest.theme.background, overflow: 'hidden'}}>
      <Audio src={staticFile('yokai-cipher/audio/yokai-cipher-digest-45.wav')} />
      <Audio src={staticFile('yokai-cipher/audio/yokai-cipher-digest-sfx.wav')} volume={sfxVolume} />

      {clips.map((clip, index) => (
        <Sequence key={clip.id} from={clipStarts[index]} durationInFrames={clip.durationInFrames}>
          <DigestClip clip={clip} accent={accent} />
        </Sequence>
      ))}

      {lyricCues.map((cue) => (
        <Sequence key={cue.id} from={cue.from} durationInFrames={cue.durationInFrames}>
          <YokaiLyricCard cue={cue} accent={accent} />
        </Sequence>
      ))}

      <YokaiCipherAmbient3D seed="YokaiCipherDigest45" opacity={0.24} />

      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          background:
            'radial-gradient(circle at 50% 100%, rgba(229,136,43,0.14) 0%, transparent 50%), radial-gradient(circle at 50% 0%, rgba(244,241,234,0.05) 0%, transparent 30%)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: 24,
          right: 24,
          bottom: 16,
          display: 'flex',
          gap: 6,
        }}
      >
        {clips.map((clip, index) => {
          const start = clipStarts[index];
          const end = start + clip.durationInFrames;
          const active = frame >= start && frame < end;
          return (
            <div
              key={clip.id}
              style={{
                flex: clip.durationInFrames,
                height: active ? 7 : 3,
                borderRadius: 999,
                background: active ? accent : 'rgba(244,241,234,0.16)',
                boxShadow: active ? `0 0 20px ${accent}` : 'none',
              }}
            />
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
