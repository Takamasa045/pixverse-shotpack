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
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {YokaiCipherAmbient3D} from './YokaiCipherAmbient3D';
import type {ShotpackManifest, ShotpackScene} from './types';

export type YokaiCipherFullProps = {
  manifest: ShotpackManifest;
};

const LABELS: Record<
  string,
  {
    index: string;
    en: string;
    jp: string;
    callout: string;
  }
> = {
  'scene-01': {
    index: '01',
    en: 'SHRINE ENTRY',
    jp: '神社裏イントロ',
    callout: 'Lanterns breathe before the first hit.',
  },
  'scene-02': {
    index: '02',
    en: 'MASKED MASTER',
    jp: '狐面導師',
    callout: 'The cipher gets its gravity.',
  },
  'scene-03': {
    index: '03',
    en: 'SINGLE EYE POP',
    jp: '一つ目の視線',
    callout: 'Shoulders strike like warnings.',
  },
  'scene-04': {
    index: '04',
    en: 'UMBRELLA FOOTWORK',
    jp: 'からかさの足運び',
    callout: 'One leg, no mercy.',
  },
  'scene-05': {
    index: '05',
    en: 'NECK WAVE',
    jp: 'ろくろ首ウェーブ',
    callout: 'The body stays low. The nightmare rises.',
  },
  'scene-06': {
    index: '06',
    en: 'WATER STEP',
    jp: '河童の水打ち',
    callout: 'Every splash lands on the snare.',
  },
  'scene-07': {
    index: '07',
    en: 'CIPHER PEAK',
    jp: '百鬼サイファー',
    callout: 'Full circle. No escape.',
  },
  'scene-08': {
    index: '08',
    en: 'LAST LANTERN',
    jp: '最後の灯り',
    callout: 'Only the glow survives.',
  },
};

const sceneAsset = (file: string) => staticFile(`yokai-cipher/${file}`);

const soundtrackVolume = (frame: number, durationInFrames: number) => {
  const fadeIn = interpolate(frame, [0, 24], [0, 0.92], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const fadeOut = interpolate(frame, [durationInFrames - 45, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return fadeIn * fadeOut;
};

const flashAtBoundary = (frame: number, manifest: ShotpackManifest) => {
  const boundaries = manifest.scenes.slice(1).map((scene) => scene.startFrame);
  return boundaries.reduce((maxOpacity, boundary) => {
    const distance = Math.abs(frame - boundary);
    const local = interpolate(distance, [0, 3, 10, 18], [0.92, 0.58, 0.12, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    return Math.max(maxOpacity, local);
  }, 0);
};

const SceneFrame: React.FC<{
  scene: ShotpackScene;
  index: number;
  accent: string;
}> = ({scene, index, accent}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const sceneFrames = scene.durationInFrames;
  const introSpring = spring({
    fps,
    frame,
    config: {
      damping: 20,
      mass: 0.9,
      stiffness: 90,
    },
    durationInFrames: 26,
  });
  const panelScale = interpolate(frame, [0, sceneFrames], [1.045, 1.01], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const panelLift = interpolate(frame, [0, sceneFrames], [18, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const orbit = Math.sin((frame / Math.max(sceneFrames, 1)) * Math.PI * 2);
  const tagOpacity = interpolate(frame, [0, 10, 42, 60], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const label = LABELS[scene.id];
  const liveAudio = scene.id === 'scene-08';

  return (
    <AbsoluteFill style={{backgroundColor: '#020308'}}>
      <Img
        src={sceneAsset(scene.assets.stills[0])}
        style={{
          position: 'absolute',
          inset: -64,
          width: width + 128,
          height: height + 128,
          objectFit: 'cover',
          filter: 'blur(42px) saturate(1.15) brightness(0.42)',
          transform: `scale(${1.12 + index * 0.008})`,
          opacity: 0.96,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(circle at 50% 40%, rgba(229,136,43,0.18), transparent 38%), linear-gradient(180deg, rgba(4,5,11,0.2) 0%, rgba(4,5,11,0.82) 100%)',
        }}
      />
      <AbsoluteFill
        style={{
          padding: '84px 104px 108px',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            borderRadius: 34,
            overflow: 'hidden',
            backgroundColor: '#05060C',
            boxShadow: '0 36px 120px rgba(0,0,0,0.62)',
            border: '1px solid rgba(255,255,255,0.08)',
            transform: `translateY(${panelLift}px) scale(${panelScale}) rotate(${orbit * (index % 2 === 0 ? 0.45 : -0.45)}deg)`,
          }}
        >
          <Video
            src={sceneAsset(scene.assets.videoSrc)}
            muted={!liveAudio}
            objectFit="cover"
            volume={
              liveAudio
                ? (f) =>
                    interpolate(f, [0, 110, scene.durationInFrames - 70, scene.durationInFrames], [0, 0.22, 0.26, 0], {
                      extrapolateLeft: 'clamp',
                      extrapolateRight: 'clamp',
                    })
                : 0
            }
            style={{
              width: '100%',
              height: '100%',
              filter: `contrast(1.08) saturate(${1.04 + introSpring * 0.1}) brightness(0.98)`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 24%, rgba(0,0,0,0.16) 100%)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(circle at 50% 50%, transparent 40%, rgba(0,0,0,0.26) 100%)',
              pointerEvents: 'none',
            }}
          />
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{pointerEvents: 'none'}}>
        <div
          style={{
            position: 'absolute',
            top: 52,
            left: 58,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            opacity: tagOpacity,
            transform: `translateY(${interpolate(frame, [0, 32], [18, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            })}px)`,
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 16,
              alignItems: 'baseline',
              color: '#F6F0E7',
            }}
          >
            <span
              style={{
                fontFamily: '"Bebas Neue", sans-serif',
                fontSize: 72,
                letterSpacing: 3,
                lineHeight: 0.9,
              }}
            >
              {label.index}
            </span>
            <span
              style={{
                fontFamily: '"Bebas Neue", sans-serif',
                fontSize: 42,
                letterSpacing: 4,
                lineHeight: 1,
              }}
            >
              {label.en}
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              gap: 14,
              alignItems: 'center',
            }}
          >
            <span
              style={{
                width: 52,
                height: 4,
                borderRadius: 999,
                background: accent,
                boxShadow: `0 0 24px ${accent}`,
              }}
            />
            <span
              style={{
                color: '#F6F0E7',
                fontFamily: '"Noto Sans JP", sans-serif',
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: 1,
              }}
            >
              {label.jp}
            </span>
          </div>
          <div
            style={{
              maxWidth: 660,
              color: 'rgba(244,241,234,0.82)',
              fontFamily: '"Noto Sans JP", sans-serif',
              fontSize: 18,
              fontWeight: 500,
              lineHeight: 1.4,
            }}
          >
            {label.callout}
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            right: 54,
            top: 54,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 10,
            color: '#F4F1EA',
            textAlign: 'right',
          }}
        >
          <div
            style={{
              fontFamily: '"Bebas Neue", sans-serif',
              fontSize: 28,
              letterSpacing: 3,
              opacity: 0.84,
            }}
          >
            {scene.music_section.toUpperCase()}
          </div>
          <div
            style={{
              fontFamily: '"Noto Sans JP", sans-serif',
              fontSize: 15,
              fontWeight: 500,
              lineHeight: 1.55,
              color: 'rgba(244,241,234,0.72)',
              maxWidth: 420,
            }}
          >
            {scene.objective}
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            right: 22,
            top: 120,
            writingMode: 'vertical-rl',
            fontFamily: '"Noto Sans JP", sans-serif',
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: 3,
            color: 'rgba(244,241,234,0.5)',
          }}
        >
          妖怪 CIPHER
        </div>

        <div
          style={{
            position: 'absolute',
            left: 42,
            right: 42,
            bottom: 34,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: 'rgba(244,241,234,0.7)',
            fontFamily: '"Bebas Neue", sans-serif',
            letterSpacing: 2,
            fontSize: 24,
          }}
        >
          <span>{scene.emotion.toUpperCase()}</span>
          <span style={{color: accent}}>{scene.motif.toUpperCase()}</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const IntroTitle: React.FC<{manifest: ShotpackManifest}> = ({manifest}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const introFrames = 76;
  const progress = spring({
    fps,
    frame,
    config: {
      damping: 18,
      stiffness: 80,
      mass: 0.8,
    },
    durationInFrames: 32,
  });
  const fade = interpolate(frame, [0, 12, introFrames - 12, introFrames], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const blur = interpolate(frame, [0, 18], [18, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  if (frame > introFrames) {
    return null;
  }

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        opacity: fade,
        pointerEvents: 'none',
        background:
          'radial-gradient(circle at 50% 50%, rgba(4,5,11,0.2) 0%, rgba(4,5,11,0.9) 76%, rgba(4,5,11,1) 100%)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
          transform: `translateY(${interpolate(frame, [0, introFrames], [38, -18], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })}px) scale(${0.9 + progress * 0.12})`,
          filter: `blur(${blur}px)`,
        }}
      >
        <div
          style={{
            fontFamily: '"Bebas Neue", sans-serif',
            color: manifest.theme.text,
            fontSize: 184,
            letterSpacing: 10,
            lineHeight: 0.86,
            textShadow: `0 0 42px ${manifest.theme.accent}55`,
          }}
        >
          YOKAI
        </div>
        <div
          style={{
            display: 'flex',
            gap: 20,
            alignItems: 'center',
          }}
        >
          <span
            style={{
              width: 120,
              height: 5,
              background: manifest.theme.accent,
              boxShadow: `0 0 24px ${manifest.theme.accent}`,
            }}
          />
          <div
            style={{
              fontFamily: '"Bebas Neue", sans-serif',
              color: manifest.theme.text,
              fontSize: 112,
              letterSpacing: 12,
              lineHeight: 0.9,
            }}
          >
            CIPHER
          </div>
          <span
            style={{
              width: 120,
              height: 5,
              background: manifest.theme.accent,
              boxShadow: `0 0 24px ${manifest.theme.accent}`,
            }}
          />
        </div>
        <div
          style={{
            fontFamily: '"Noto Sans JP", sans-serif',
            color: 'rgba(244,241,234,0.88)',
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: 4,
          }}
        >
          妖怪サイファー / OCCULT HIP-HOP RITE
        </div>
      </div>
    </AbsoluteFill>
  );
};

const OutroTitle: React.FC<{manifest: ShotpackManifest}> = ({manifest}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const start = durationInFrames - 88;
  if (frame < start) {
    return null;
  }

  const local = frame - start;
  const fade = interpolate(local, [0, 14, 64, 88], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'flex-end',
        padding: '0 72px 70px',
        opacity: fade,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          color: manifest.theme.text,
        }}
      >
        <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
          <div
            style={{
              fontFamily: '"Bebas Neue", sans-serif',
              fontSize: 68,
              letterSpacing: 5,
              lineHeight: 0.9,
            }}
          >
            YOKAI CIPHER
          </div>
          <div
            style={{
              fontFamily: '"Noto Sans JP", sans-serif',
              fontSize: 19,
              fontWeight: 500,
              letterSpacing: 1,
              color: 'rgba(244,241,234,0.76)',
            }}
          >
            moonlit shrine cut / fox-mask master / last lantern
          </div>
        </div>
        <div
          style={{
            fontFamily: '"Bebas Neue", sans-serif',
            fontSize: 34,
            letterSpacing: 3,
            color: manifest.theme.accent,
          }}
        >
          APR 03 2026
        </div>
      </div>
    </AbsoluteFill>
  );
};

const GrainOverlay: React.FC<{accent: string; manifest: ShotpackManifest}> = ({accent, manifest}) => {
  const frame = useCurrentFrame();
  const beatGlow = Math.max(0, Math.sin((frame / useVideoConfig().fps) * Math.PI * 2 * ((manifest.audio.bpm ?? 92) / 60)));
  return (
    <>
      <AbsoluteFill
        style={{
          opacity: 0.15,
          backgroundImage:
            'linear-gradient(0deg, rgba(255,255,255,0.10) 50%, rgba(0,0,0,0.12) 50%), repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 4px)',
          backgroundSize: '100% 4px, 4px 100%',
          transform: `translate(${(frame % 3) - 1}px, ${(frame % 5) - 2}px)`,
          mixBlendMode: 'soft-light',
          pointerEvents: 'none',
        }}
      />
      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          background:
            'radial-gradient(circle at 50% 50%, transparent 48%, rgba(0,0,0,0.28) 100%)',
        }}
      />
      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          background: `radial-gradient(circle at 50% 100%, ${accent}${Math.round(
            (0.08 + beatGlow * 0.08) * 255,
          )
            .toString(16)
            .padStart(2, '0')} 0%, transparent 54%)`,
        }}
      />
    </>
  );
};

const ProgressRail: React.FC<{manifest: ShotpackManifest}> = ({manifest}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const accent = manifest.theme.accent;
  const progress = frame / Math.max(durationInFrames - 1, 1);
  return (
    <div
      style={{
        position: 'absolute',
        left: 104,
        right: 104,
        bottom: 20,
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        pointerEvents: 'none',
      }}
    >
      {manifest.scenes.map((scene) => {
        const start = scene.startFrame / durationInFrames;
        const end = (scene.startFrame + scene.durationInFrames) / durationInFrames;
        const active = progress >= start && progress < end;
        return (
          <div
            key={scene.id}
            style={{
              flex: scene.durationInFrames,
              height: active ? 8 : 4,
              borderRadius: 999,
              background: active ? accent : 'rgba(244,241,234,0.18)',
              boxShadow: active ? `0 0 28px ${accent}` : 'none',
            }}
          />
        );
      })}
    </div>
  );
};

export const YokaiCipherFull: React.FC<YokaiCipherFullProps> = ({manifest}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const accent = manifest.theme.accent;
  const flashOpacity = flashAtBoundary(frame, manifest);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: manifest.theme.background,
        color: manifest.theme.text,
        overflow: 'hidden',
      }}
    >
      <Audio
        src={sceneAsset(manifest.audio.src)}
        volume={(f) => soundtrackVolume(f, durationInFrames)}
      />

      {manifest.scenes.map((scene, index) => (
        <Sequence
          key={scene.id}
          from={scene.startFrame}
          durationInFrames={scene.durationInFrames}
        >
          <SceneFrame scene={scene} index={index} accent={accent} />
        </Sequence>
      ))}

      <YokaiCipherAmbient3D seed="YokaiCipherFull" opacity={0.22} />

      <AbsoluteFill
        style={{
          opacity: flashOpacity,
          pointerEvents: 'none',
          background:
            'linear-gradient(135deg, rgba(244,241,234,0.72) 0%, rgba(229,136,43,0.52) 38%, rgba(4,5,11,0) 100%)',
          mixBlendMode: 'screen',
        }}
      />

      <AbsoluteFill
        style={{
          opacity: flashOpacity * 0.52,
          pointerEvents: 'none',
          background:
            'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.48) 0%, rgba(229,136,43,0.18) 22%, transparent 58%)',
        }}
      />

      <GrainOverlay accent={accent} manifest={manifest} />
      <IntroTitle manifest={manifest} />
      <OutroTitle manifest={manifest} />
      <ProgressRail manifest={manifest} />
    </AbsoluteFill>
  );
};
