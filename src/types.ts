export type ShotpackScene = {
  id: string;
  music_section: string;
  objective: string;
  emotion: string;
  motif: string;
  hookText: string | null;
  transition: string;
  startSec: number;
  endSec: number;
  durationSec: number;
  startFrame: number;
  durationInFrames: number;
  assets: {
    videoSrc: string;
    stills: string[];
  };
  prompt: string;
  model: string;
  shot_id: string;
  multi_shot: boolean;
};

export type ShotpackManifest = {
  project: {
    id: string;
    name: string;
    version: string;
    primaryDeliverable: string;
    textPolicy: string;
    editPolicy: string;
    protagonistPolicy: string;
    motifs: string[];
    body: string;
    artistNotes: string | null;
    referenceNotes: string | null;
  };
  audio: {
    src: string;
    durationInSeconds: number;
    bpm?: number;
  };
  theme: {
    background: string;
    accent: string;
    text: string;
  };
  deliverables: Array<{
    id: string;
    width: number;
    height: number;
    fps: number;
    compositionId: string;
    durationInFrames: number;
    sceneCount: number;
  }>;
  visualPeakSection: string;
  quietSection: string;
  thumbnail: {
    sceneId: string;
    frame: number;
  };
  scenes: ShotpackScene[];
};
