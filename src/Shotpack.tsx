import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {ShotpackAmbient3D} from './ShotpackAmbient3D';
import type {ShotpackManifest, ShotpackScene} from './types';

type ShotpackProps = {
  manifest: ShotpackManifest;
};

const sampleAsset = (file: string) => staticFile(`shotpack-sample/${file}`);

const SceneCard: React.FC<{
  manifest: ShotpackManifest;
  scene: ShotpackScene;
  sceneIndex: number;
}> = ({manifest, scene, sceneIndex}) => {
  const frame = useCurrentFrame();
  const {durationInFrames, fps} = useVideoConfig();
  const accent = manifest.theme.accent;
  const text = manifest.theme.text;
  const background = manifest.theme.background;
  const sceneLabel = `${String(sceneIndex + 1).padStart(2, '0')} / ${String(manifest.scenes.length).padStart(2, '0')}`;
  const cardIn = spring({
    fps,
    frame,
    config: {
      damping: 200,
      stiffness: 140,
    },
  });
  const cardOut = interpolate(
    frame,
    [Math.max(durationInFrames - 18, 0), durationInFrames],
    [1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    },
  );
  const overlayOpacity = Math.min(cardIn, cardOut);
  const mediaScale = interpolate(frame, [0, durationInFrames], [1.06, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const stillSrc = scene.assets.stills[0] ? sampleAsset(scene.assets.stills[0]) : null;
  const title = scene.hookText ?? scene.objective;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: background,
        overflow: 'hidden',
      }}
    >
      {stillSrc ? (
        <AbsoluteFill
          style={{
            transform: `scale(${mediaScale})`,
          }}
        >
          <Img
            src={stillSrc}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'saturate(0.82) brightness(0.68) blur(6px)',
            }}
          />
        </AbsoluteFill>
      ) : null}
      <AbsoluteFill
        style={{
          transform: `scale(${mediaScale})`,
        }}
      >
        <OffthreadVideo
          src={sampleAsset(scene.assets.videoSrc)}
          muted
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(180deg, rgba(5,8,15,0.12) 0%, rgba(5,8,15,0.3) 42%, rgba(5,8,15,0.72) 100%)',
        }}
      />
      <AbsoluteFill
        style={{
          opacity: 0.18,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '120px 120px',
          mixBlendMode: 'soft-light',
        }}
      />
      <AbsoluteFill
        style={{
          justifyContent: 'space-between',
          padding: '72px',
          color: text,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 24,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              maxWidth: 900,
              opacity: overlayOpacity,
              transform: `translateY(${interpolate(frame, [0, 24], [24, 0], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              })}px)`,
            }}
          >
            <div
              style={{
                fontSize: 18,
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: accent,
              }}
            >
              PixVerse Shotpack Sample
            </div>
            <div
              style={{
                fontSize: 60,
                fontWeight: 700,
                lineHeight: 1.04,
              }}
            >
              {manifest.project.name}
            </div>
          </div>
          <div
            style={{
              border: `1px solid ${accent}66`,
              padding: '16px 18px',
              backgroundColor: 'rgba(7, 10, 18, 0.45)',
              fontSize: 18,
              letterSpacing: '0.16em',
              color: `${text}CC`,
              opacity: overlayOpacity,
            }}
          >
            {sceneLabel}
          </div>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.5fr) minmax(320px, 0.8fr)',
            gap: 36,
            alignItems: 'end',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              opacity: overlayOpacity,
              transform: `translateY(${interpolate(frame, [0, 24], [32, 0], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              })}px)`,
            }}
          >
            <div
              style={{
                fontSize: 24,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: `${text}B8`,
              }}
            >
              {scene.id}
            </div>
            <div
              style={{
                fontSize: 54,
                lineHeight: 1.08,
                fontWeight: 700,
                maxWidth: 1180,
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontSize: 22,
                lineHeight: 1.45,
                color: `${text}C8`,
                maxWidth: 1100,
              }}
            >
              {scene.prompt}
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              padding: '24px 28px',
              border: `1px solid ${accent}55`,
              backgroundColor: 'rgba(7, 10, 18, 0.62)',
              backdropFilter: 'blur(12px)',
              opacity: overlayOpacity,
            }}
          >
            <div
              style={{
                fontSize: 16,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: accent,
              }}
            >
              Scene Notes
            </div>
            <div style={{fontSize: 24, lineHeight: 1.35, color: text}}>
              {scene.objective}
            </div>
            <div style={{fontSize: 20, lineHeight: 1.4, color: `${text}C8`}}>
              Emotion: {scene.emotion || 'neutral'}
            </div>
            <div style={{fontSize: 20, lineHeight: 1.4, color: `${text}C8`}}>
              Motif: {scene.motif || 'n/a'}
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Shotpack: React.FC<ShotpackProps> = ({manifest}) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: manifest.theme.background,
      }}
    >
      <Audio src={sampleAsset(manifest.audio.src)} />
      <ShotpackAmbient3D seed={manifest.project.id} />
      {manifest.scenes.map((scene, index) => (
        <Sequence
          key={scene.id}
          from={scene.startFrame}
          durationInFrames={scene.durationInFrames}
        >
          <SceneCard manifest={manifest} scene={scene} sceneIndex={index} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
