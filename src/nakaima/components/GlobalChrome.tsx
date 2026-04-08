import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {getSectionAtFrame, nakaimaDurationInFrames, nakaimaFps, nakaimaTheme} from '../data';

const formatTimestamp = (frame: number) => {
  const totalSeconds = Math.floor(frame / nakaimaFps);
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
};

export const GlobalChrome: React.FC = () => {
  const frame = useCurrentFrame();
  const section = getSectionAtFrame(frame);
  const progress = (frame / nakaimaDurationInFrames) * 100;
  const headingOpacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          top: 28,
          left: 32,
          padding: '14px 16px',
          borderRadius: 18,
          background: 'linear-gradient(180deg, rgba(8,10,18,0.46), rgba(8,10,18,0.2))',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(18px)',
          opacity: headingOpacity,
        }}
      >
        <div
          style={{
            fontFamily: '"Bebas Neue", sans-serif',
            fontSize: 20,
            letterSpacing: '0.24em',
            color: nakaimaTheme.paper,
          }}
        >
          NAKAIMA
        </div>
        <div
          style={{
            marginTop: 4,
            fontFamily: '"Noto Sans JP", "Hiragino Sans", "Yu Gothic", sans-serif',
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: section.accent,
          }}
        >
          {section.labelJa}
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          top: 34,
          right: 36,
          display: 'flex',
          gap: 16,
          alignItems: 'center',
          color: 'rgba(243,246,255,0.78)',
          fontFamily: '"Bebas Neue", sans-serif',
          letterSpacing: '0.18em',
          fontSize: 22,
          textShadow: '0 0 22px rgba(0,0,0,0.52)',
        }}
      >
        <span>{formatTimestamp(frame)}</span>
        <span style={{opacity: 0.46}}>/</span>
        <span style={{opacity: 0.64}}>02:33</span>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 40,
          right: 40,
          bottom: 28,
          height: 2,
          borderRadius: 999,
          background: 'rgba(255,255,255,0.12)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            borderRadius: 999,
            background: `linear-gradient(90deg, rgba(190,208,255,0.84), ${section.accent})`,
            boxShadow: `0 0 22px ${section.accent}`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
