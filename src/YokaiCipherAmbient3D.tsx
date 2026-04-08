import React from 'react';
import {AbsoluteFill} from 'remotion';
import {LinkedParticles} from './scenes/LinkedParticles';

type YokaiCipherAmbient3DProps = {
  seed: string;
  opacity?: number;
};

export const YokaiCipherAmbient3D: React.FC<YokaiCipherAmbient3DProps> = ({
  seed,
  opacity = 0.28,
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
            'radial-gradient(70% 70% at 50% 50%, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 68%), linear-gradient(180deg, rgba(2,3,8,0.08) 0%, rgba(2,3,8,0.42) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};
