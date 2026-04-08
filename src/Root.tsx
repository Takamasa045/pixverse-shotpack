import {Composition} from 'remotion';
import manifestJson from '../public/shotpack-sample/manifest.json';
import {Shotpack} from './Shotpack';
import {LinkedParticles} from './scenes/LinkedParticles';
import type {ShotpackManifest} from './types';

const manifest = manifestJson as ShotpackManifest;
const deliverable =
  manifest.deliverables.find((item) => item.id === manifest.project.primaryDeliverable) ??
  manifest.deliverables[0];

export const Root = () => {
  return (
    <>
      <Composition
        id="LinkedParticles"
        component={LinkedParticles}
        durationInFrames={180}
        fps={deliverable.fps}
        width={deliverable.width}
        height={deliverable.height}
        defaultProps={{seed: 'pixverse-shotpack'}}
        calculateMetadata={() => ({
          durationInFrames: 180,
          width: deliverable.width,
          height: deliverable.height,
          fps: deliverable.fps,
          defaultOutName: 'linked-particles.mp4',
        })}
      />
      <Composition
        id="Shotpack"
        component={Shotpack}
        durationInFrames={deliverable.durationInFrames}
        fps={deliverable.fps}
        width={deliverable.width}
        height={deliverable.height}
        defaultProps={{manifest}}
        calculateMetadata={({props}) => {
          const target =
            props.manifest.deliverables.find(
              (item) => item.id === props.manifest.project.primaryDeliverable,
            ) ?? props.manifest.deliverables[0];

          return {
            durationInFrames: target.durationInFrames,
            width: target.width,
            height: target.height,
            fps: target.fps,
            defaultOutName: `${props.manifest.project.id}.mp4`,
          };
        }}
      />
    </>
  );
};
