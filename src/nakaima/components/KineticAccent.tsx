import React from 'react';
import {AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {nakaimaTheme, secToFrames, type NakaimaAccentCue} from '../data';

const accentPlacement = (position: NakaimaAccentCue['position']) => {
  if (position === 'left') {
    return {left: '9%', top: '24%', alignItems: 'flex-start'};
  }

  if (position === 'right') {
    return {right: '9%', top: '24%', alignItems: 'flex-end'};
  }

  return {left: '50%', top: '34%', alignItems: 'center', translateX: '-50%'};
};

const AccentPhrase: React.FC<{
  cue: NakaimaAccentCue;
  accent: string;
  accentSoft: string;
}> = ({cue, accent, accentSoft}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const entry = spring({
    fps,
    frame,
    config: {
      damping: cue.style === 'impact' ? 7 : 13,
      stiffness: cue.style === 'impact' ? 220 : 130,
      mass: cue.style === 'kanji' ? 0.95 : 0.72,
    },
    durationInFrames: Math.min(22, durationInFrames),
  });
  const opacity = interpolate(
    frame,
    [0, 3, Math.max(6, durationInFrames - 10), durationInFrames],
    [0, 1, 1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    },
  );
  const pulseScale = 1 + Math.sin(frame / 8) * 0.022;
  const placement = accentPlacement(cue.position);
  const isKanji = cue.style === 'kanji';
  const isTrace = cue.style === 'trace';
  const isImpact = cue.style === 'impact';
  const isHalo = cue.style === 'halo';
  const serifFont = '"Hiragino Mincho ProN", "Yu Mincho", serif';
  const gothicFont = '"Noto Sans JP", "Hiragino Sans", "Yu Gothic", sans-serif';
  const textColor = isImpact ? accent : nakaimaTheme.text;
  const fontSize = isKanji ? 360 : isTrace ? 76 : isHalo ? 118 : 164;
  const letterSpacing = isTrace ? '0.18em' : isKanji ? '0.04em' : '0.1em';
  const translateY = isKanji ? 34 - entry * 34 : 18 - entry * 18;
  const baseScale = isImpact ? 1.18 - entry * 0.18 : isKanji ? 1.16 - entry * 0.16 : 1.08 - entry * 0.08;
  const wipe = interpolate(frame, [0, Math.min(10, durationInFrames)], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const ghostOpacity = interpolate(frame, [0, 6, durationInFrames], [0, 0.15, 0.04], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          ...placement,
          transform: `${placement.translateX ? `translateX(${placement.translateX}) ` : ''}translateY(${translateY}px)`,
          opacity,
        }}
      >
        {isKanji ? (
          <>
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: `translate(-50%, -50%) scale(${1.08 + (1 - entry) * 0.22})`,
                fontFamily: serifFont,
                fontWeight: 400,
                fontSize: fontSize * 1.05,
                color: nakaimaTheme.text,
                opacity: ghostOpacity,
                filter: 'blur(6px)',
              }}
            >
              {cue.text}
            </div>
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: `translate(-50%, -50%) scale(${0.94 + pulseScale * 0.08})`,
                fontFamily: serifFont,
                fontWeight: 400,
                fontSize: fontSize * 1.02,
                color: accent,
                opacity: ghostOpacity * 0.35,
                filter: 'blur(18px)',
              }}
            >
              {cue.text}
            </div>
          </>
        ) : null}
        {isHalo ? (
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 280,
              height: 280,
              borderRadius: '50%',
              border: `1px solid ${accent}`,
              transform: `translate(-50%, -50%) scale(${pulseScale})`,
              boxShadow: `0 0 68px ${accentSoft}`,
              opacity: 0.24,
            }}
          />
        ) : null}
        {isTrace ? (
          <div
            style={{
              position: 'absolute',
              left: cue.position === 'right' ? 'auto' : 0,
              right: cue.position === 'right' ? 0 : 'auto',
              top: '56%',
              width: 220,
              height: 2,
              background: `linear-gradient(90deg, rgba(255,255,255,0), ${accent}, rgba(255,255,255,0))`,
              transform: cue.position === 'center' ? 'translate(-50%, -50%)' : 'translateY(-50%)',
              opacity: 0.86,
            }}
          />
        ) : null}
        {isImpact ? (
          <>
            <div
              style={{
                position: 'absolute',
                inset: '-24px -40px',
                background: `radial-gradient(circle at center, ${accentSoft} 0%, rgba(0,0,0,0) 62%)`,
                opacity: 0.5,
                filter: 'blur(18px)',
              }}
            />
            {[-1, 1].map((dir) => (
              <div
                key={dir}
                style={{
                  position: 'absolute',
                  left: dir === -1 ? -10 : 10,
                  top: dir === -1 ? -6 : 6,
                  fontFamily: gothicFont,
                  fontWeight: 700,
                  fontSize,
                  letterSpacing,
                  color: nakaimaTheme.text,
                  opacity: ghostOpacity * 0.7,
                  filter: 'blur(2px)',
                }}
              >
                {cue.text}
              </div>
            ))}
          </>
        ) : null}
        <div
          style={{
            position: 'relative',
            fontFamily: isKanji || isHalo ? serifFont : gothicFont,
            fontWeight: isKanji ? 400 : 700,
            fontSize,
            letterSpacing,
            color: textColor,
            transform: `scale(${(isImpact || isKanji ? baseScale * pulseScale : baseScale)})`,
            textShadow: `0 0 ${isKanji ? 54 : 34}px ${accentSoft}, 0 0 14px rgba(0,0,0,0.82), 0 14px 36px rgba(0,0,0,0.36)`,
            whiteSpace: 'nowrap',
            clipPath: isTrace ? `polygon(0 0, ${wipe}% 0, ${wipe}% 100%, 0 100%)` : undefined,
            filter: isTrace ? 'blur(0.2px)' : undefined,
          }}
        >
          {cue.text}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const KineticAccent: React.FC<{
  sectionStartSec: number;
  accents: NakaimaAccentCue[];
  accent: string;
  accentSoft: string;
}> = ({sectionStartSec, accents, accent, accentSoft}) => {
  return (
    <>
      {accents.map((cue) => (
        <Sequence
          key={`${cue.text}-${cue.fromSec}`}
          from={secToFrames(cue.fromSec - sectionStartSec)}
          durationInFrames={Math.max(1, secToFrames(cue.endSec - cue.fromSec))}
          layout="none"
        >
          <AccentPhrase cue={cue} accent={accent} accentSoft={accentSoft} />
        </Sequence>
      ))}
    </>
  );
};
