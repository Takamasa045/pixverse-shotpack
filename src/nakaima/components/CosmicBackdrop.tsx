import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {nakaimaPlateFiles, nakaimaTheme, type NakaimaSection} from '../data';
import {VideoPlate} from './VideoPlate';

const ParticleField: React.FC<{accent: string; energy: number}> = ({accent, energy}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {new Array(30).fill(true).map((_, index) => {
        const size = index % 5 === 0 ? 5 : index % 3 === 0 ? 3 : 2;
        const baseX = ((index * 61) % 100) / 100;
        const baseY = ((index * 37) % 100) / 100;
        const drift = 12 + (index % 7) * 3;
        const x = `calc(${(baseX * 100).toFixed(2)}% + ${Math.sin(frame / (18 + index) + index) * drift}px)`;
        const y = `calc(${(baseY * 100).toFixed(2)}% + ${Math.cos(frame / (24 + index) + index) * drift * 0.7}px)`;
        const opacity =
          0.08 +
          ((Math.sin(frame / (20 + index) + index * 1.4) + 1) * 0.5 * (0.12 + energy * 0.08));

        return (
          <div
            key={`particle-${index}`}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: '50%',
              background: index % 4 === 0 ? accent : 'rgba(243,246,255,0.95)',
              opacity,
              boxShadow:
                index % 4 === 0
                  ? `0 0 ${10 + size * 2}px ${accent}`
                  : '0 0 12px rgba(243,246,255,0.65)',
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const HaloRings: React.FC<{accent: string; accentSoft: string; energy: number}> = ({
  accent,
  accentSoft,
  energy,
}) => {
  const frame = useCurrentFrame();
  const pulse = 1 + Math.sin(frame / 14) * (0.015 + energy * 0.02);

  return (
    <AbsoluteFill style={{pointerEvents: 'none', justifyContent: 'center', alignItems: 'center'}}>
      {[0, 1, 2].map((index) => {
        const size = 360 + index * 170;
        const localPulse = 1 + (pulse - 1) * (1 - index * 0.22);
        return (
          <div
            key={`ring-${index}`}
            style={{
              position: 'absolute',
              width: size,
              height: size,
              borderRadius: '50%',
              border: `1px solid ${index === 0 ? accent : 'rgba(243,246,255,0.12)'}`,
              opacity: 0.18 - index * 0.03,
              transform: `scale(${localPulse})`,
              boxShadow: index === 0 ? `0 0 48px ${accentSoft}` : undefined,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const FilamentMesh: React.FC<{accent: string; energy: number}> = ({accent, energy}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width="100%" height="100%" viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
        {new Array(5).fill(true).map((_, index) => {
          const offset = index * 160;
          const controlA = 180 + Math.sin(frame / 22 + index) * 90;
          const controlB = 780 + Math.cos(frame / 26 + index * 0.6) * 110;
          const y = 140 + offset;

          return (
            <path
              key={`filament-${index}`}
              d={`M -120 ${y} C ${controlA} ${y - 90}, ${controlB} ${y + 110}, 2040 ${y - 40}`}
              stroke={index % 2 === 0 ? accent : 'rgba(243,246,255,0.52)'}
              strokeWidth={index % 2 === 0 ? 2 : 1.25}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={index % 2 === 0 ? '18 22' : '8 18'}
              strokeDashoffset={-frame * (1.8 + index * 0.22)}
              opacity={0.16 + energy * 0.14}
              filter="url(#nakaima-filament-glow)"
            />
          );
        })}
        <defs>
          <filter id="nakaima-filament-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>
    </AbsoluteFill>
  );
};

const PulseBeams: React.FC<{accent: string; energy: number}> = ({accent, energy}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const beamOpacity = interpolate(frame, [0, 6, durationInFrames], [0, 0.26, 0.12], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width="100%" height="100%" viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
        {new Array(14).fill(true).map((_, index) => {
          const angle = (index / 14) * Math.PI * 2;
          const radius = 280 + Math.sin(frame / 12 + index) * 40 + energy * 60;
          const x2 = 960 + Math.cos(angle) * radius;
          const y2 = 540 + Math.sin(angle) * radius;

          return (
            <line
              key={`beam-${index}`}
              x1={960}
              y1={540}
              x2={x2}
              y2={y2}
              stroke={index % 3 === 0 ? accent : 'rgba(243,246,255,0.6)'}
              strokeWidth={index % 3 === 0 ? 2.2 : 1.1}
              opacity={beamOpacity}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

const VerseBars: React.FC<{accentSoft: string}> = ({accentSoft}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {new Array(6).fill(true).map((_, index) => {
        const width = 160 + index * 120;
        const left = 72 + index * 110;
        const translateX = Math.sin(frame / (20 + index * 5) + index) * 28;

        return (
          <div
            key={`bar-${index}`}
            style={{
              position: 'absolute',
              bottom: 170 + index * 18,
              left,
              width,
              height: 2,
              transform: `translateX(${translateX}px)`,
              background: `linear-gradient(90deg, rgba(255,255,255,0), ${accentSoft}, rgba(255,255,255,0))`,
              opacity: 0.35 - index * 0.04,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

export const CosmicBackdrop: React.FC<{section: NakaimaSection}> = ({section}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const glowOpacity = interpolate(frame, [0, 8, durationInFrames], [0.28, 0.48, 0.2], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const glowPosition =
    section.variant === 'hook'
      ? '50% 50%'
      : section.variant === 'bridge'
      ? '50% 44%'
      : section.variant === 'verse'
      ? '62% 62%'
      : '50% 56%';

  return (
    <AbsoluteFill style={{backgroundColor: nakaimaTheme.night}}>
      <AbsoluteFill
        style={{
          background: [
            `radial-gradient(circle at ${glowPosition}, ${section.accentSoft} 0%, rgba(2,4,10,0) 34%)`,
            'linear-gradient(180deg, rgba(4,7,18,0.08) 0%, rgba(4,7,18,0.26) 46%, rgba(2,4,10,0.9) 100%)',
          ].join(','),
          opacity: glowOpacity,
        }}
      />

      {section.plateLayers.map((plateLayer) => (
        <VideoPlate
          key={`${section.id}-${plateLayer.plateId}`}
          src={nakaimaPlateFiles[plateLayer.plateId]}
          opacity={plateLayer.opacity}
          darken={plateLayer.darken}
          tint={plateLayer.tint}
          blur={plateLayer.blur}
          blendMode={plateLayer.blendMode}
          scaleFrom={plateLayer.scaleFrom}
          scaleTo={plateLayer.scaleTo}
          driftX={plateLayer.driftX}
          driftY={plateLayer.driftY}
          trimBefore={plateLayer.trimBefore}
        />
      ))}

      <AbsoluteFill
        style={{
          background:
            'radial-gradient(circle at 50% 0%, rgba(243,246,255,0.08) 0%, rgba(2,4,10,0) 22%), radial-gradient(circle at 50% 100%, rgba(2,4,10,0) 0%, rgba(2,4,10,0.84) 76%)',
        }}
      />

      <ParticleField accent={section.accent} energy={section.energy} />
      {section.variant === 'hook' || section.id === 'verse-2' || section.variant === 'outro' ? (
        <FilamentMesh accent={section.accent} energy={section.energy} />
      ) : null}
      {section.variant === 'hook' ? (
        <PulseBeams accent={section.accent} energy={section.energy} />
      ) : null}
      {section.variant === 'verse' ? <VerseBars accentSoft={section.accentSoft} /> : null}
      {section.variant === 'intro' || section.variant === 'bridge' || section.variant === 'outro' ? (
        <HaloRings accent={section.accent} accentSoft={section.accentSoft} energy={section.energy} />
      ) : null}
    </AbsoluteFill>
  );
};
