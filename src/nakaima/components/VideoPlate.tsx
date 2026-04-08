import React from 'react';
import {Video} from '@remotion/media';
import {
  AbsoluteFill,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

type VideoPlateProps = {
  src: string;
  opacity: number;
  darken: number;
  tint?: string;
  blur?: number;
  blendMode?: React.CSSProperties['mixBlendMode'];
  scaleFrom?: number;
  scaleTo?: number;
  driftX?: number;
  driftY?: number;
  trimBefore?: number;
};

export const VideoPlate: React.FC<VideoPlateProps> = ({
  src,
  opacity,
  darken,
  tint,
  blur = 0,
  blendMode = 'normal',
  scaleFrom = 1.05,
  scaleTo = 1.14,
  driftX = 16,
  driftY = 10,
  trimBefore = 0,
}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const fadeOpacity = interpolate(
    frame,
    [0, 10, Math.max(12, durationInFrames - 12), durationInFrames],
    [0, opacity, opacity, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    },
  );
  const scale = interpolate(frame, [0, durationInFrames], [scaleFrom, scaleTo], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const translateX = Math.sin((frame + trimBefore) / 34) * driftX;
  const translateY = Math.cos((frame + trimBefore) / 46) * driftY;

  return (
    <AbsoluteFill style={{opacity: fadeOpacity, mixBlendMode: blendMode}}>
      <Video
        src={staticFile(src)}
        muted
        loop
        trimBefore={trimBefore}
        objectFit="cover"
        style={{
          width: '100%',
          height: '100%',
          transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
          filter: `blur(${blur}px) saturate(1.08) contrast(1.04)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `rgba(2, 4, 10, ${darken})`,
        }}
      />
      {tint ? (
        <AbsoluteFill
          style={{
            background: tint,
            mixBlendMode: 'screen',
            opacity: 0.9,
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};
