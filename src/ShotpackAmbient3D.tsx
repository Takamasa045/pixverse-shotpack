import React from 'react';
import {AbsoluteFill} from 'remotion';
import {LinkedParticles} from './scenes/LinkedParticles';

type ShotpackAmbient3DProps = {
  seed: string;
  opacity?: number;
};

export const ShotpackAmbient3D: React.FC<ShotpackAmbient3DProps> = ({
  seed,
  opacity = 0.24,
}) => {
  return (
    <AbsoluteFill
      style={{
        pointerEvents: 'none',
        opacity,
      }}
    >
      <AbsoluteFill
        style={{
          mixBlendMode: 'screen',
        }}
      >
        <LinkedParticles seed={seed} showGUI={false} />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(72% 72% at 50% 50%, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 68%), linear-gradient(180deg, rgba(4,7,16,0.14) 0%, rgba(4,7,16,0.5) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};
