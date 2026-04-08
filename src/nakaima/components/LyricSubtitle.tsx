import React from 'react';
import {AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {
  getLyricCuesForSection,
  nakaimaTheme,
  secToFrames,
  type NakaimaLyricCue,
} from '../data';

const emphasisGlow = (emphasis: NakaimaLyricCue['emphasis'], accent: string) => {
  if (emphasis === 'warm') {
    return 'rgba(255, 208, 143, 0.44)';
  }

  if (emphasis === 'bright') {
    return accent;
  }

  return 'rgba(190, 208, 255, 0.34)';
};

const SubtitleBlock: React.FC<{
  cue: NakaimaLyricCue;
  accent: string;
}> = ({cue, accent}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const opacity = interpolate(
    frame,
    [0, 5, Math.max(6, durationInFrames - 8), durationInFrames],
    [0, 1, 1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    },
  );
  const slideY = interpolate(frame, [0, 7], [18, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const justifyContent =
    cue.align === 'left' ? 'flex-start' : cue.align === 'right' ? 'flex-end' : 'center';
  const textAlign = cue.align === 'center' ? 'center' : cue.align;
  const glow = emphasisGlow(cue.emphasis, accent);
  const secondLineOpacity = interpolate(frame, [4, 12, durationInFrames], [0, 1, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'flex-end',
        padding: '0 56px 64px',
        pointerEvents: 'none',
      }}
    >
      <div style={{display: 'flex', justifyContent}}>
        <div
          style={{
            minWidth: 520,
            maxWidth: 920,
            opacity,
            transform: `translateY(${slideY}px)`,
          }}
        >
          <div
            style={{
              height: 2,
              width: cue.align === 'center' ? '18%' : '14%',
              background: `linear-gradient(90deg, rgba(255,255,255,0), ${glow}, rgba(255,255,255,0))`,
              marginBottom: 14,
              marginLeft: cue.align === 'right' ? 'auto' : undefined,
              marginRight: cue.align === 'left' ? 'auto' : undefined,
              opacity: 0.72,
            }}
          />
          {cue.lines.map((line, index) => (
            <div
              key={`${cue.id}-${index}`}
              style={{
                fontFamily: '"Noto Sans JP", "Hiragino Sans", "Yu Gothic", sans-serif',
                fontWeight: index === 0 ? 700 : 500,
                fontSize: index === 0 ? 40 : 34,
                lineHeight: 1.26,
                letterSpacing: index === 0 ? '0.06em' : '0.05em',
                color: nakaimaTheme.text,
                textAlign,
                textShadow: `0 0 20px ${glow}, 0 2px 18px rgba(0,0,0,0.92)`,
                opacity: index === 0 ? 1 : secondLineOpacity * 0.92,
                transform: `translateY(${index === 0 ? 0 : 2}px)`,
              }}
            >
              {line}
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const LyricSubtitle: React.FC<{
  sectionId: string;
  sectionStartSec: number;
  accent: string;
}> = ({sectionId, sectionStartSec, accent}) => {
  const cues = getLyricCuesForSection(sectionId);

  return (
    <>
      {cues.map((cue) => (
        <Sequence
          key={cue.id}
          from={secToFrames(cue.fromSec - sectionStartSec)}
          durationInFrames={Math.max(1, secToFrames(cue.endSec - cue.fromSec))}
          layout="none"
        >
          <SubtitleBlock cue={cue} accent={accent} />
        </Sequence>
      ))}
    </>
  );
};
