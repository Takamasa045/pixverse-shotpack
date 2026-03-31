# Manifest Schema Reference

`dist/manifest.json` は、既存 Remotion consumer が読む `RenderManifest` 互換を維持する。今回の Orchestrator 再設計で必要な運用メタデータは `pipeline-state.json` と `credits-report.json` に逃がし、consumer 境界は壊さない。

## Compatibility Rule

- authoritative contract: 既存 `RenderManifest`
- allowed extension: scene ごとの `prompt`, `model`, `shot_id`, `multi_shot`
- not stored in manifest: `pipeline_id`, `generated_at`, retry 内訳

上記の追加情報は別ファイルに保存する。

## Output Shape

```typescript
type ShotpackManifest = {
  project: {
    id: string;
    name: string;
    version: string;
    primaryDeliverable: "wide";
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
    bpm: number;
  };
  theme: {
    background: string;
    accent: string;
    text: string;
  };
  deliverables: {
    id: string;
    width: number;
    height: number;
    fps: number;
    compositionId: string;
    durationInFrames: number;
    sceneCount: number;
  }[];
  visualPeakSection: string;
  quietSection: string;
  thumbnail: {
    sceneId: string;
    frame: number;
  };
  scenes: {
    id: string;
    music_section: string;
    objective: string;
    emotion: string;
    motif: string;
    hookText?: string | null;
    transition: string;
    startSec: number;
    endSec: number;
    durationSec: number;
    startFrame: number;
    durationInFrames: number;
    assets: {
      videoSrc: string | null;
      stills: string[];
    };
    prompt?: string;
    model?: string;
    shot_id?: string;
    multi_shot?: boolean;
  }[];
};
```

## Mapping Rules

### project

| フィールド | 値 |
|-----------|----|
| `id` | `meta.title` の slug |
| `name` | `meta.title` |
| `version` | `"1.0.0"` |
| `primaryDeliverable` | `"wide"` |
| その他 | 既存 consumer 互換のため空文字または `null` |

### audio

| フィールド | 値 |
|-----------|----|
| `src` | `audio/shotpack-placeholder.wav` |
| `durationInSeconds` | 全 scene の実秒数合計 |
| `bpm` | `90` |

### deliverables

manifest に含めるのは primary `16:9` のみ。

| フィールド | 値 |
|-----------|----|
| `id` | `"wide"` |
| `width` | `1920` |
| `height` | `1080` |
| `fps` | `meta.fps` |
| `compositionId` | `"Shotpack"` |
| `durationInFrames` | scene 合計 |
| `sceneCount` | `scenes.length` |

### scenes

| フィールド | 値 |
|-----------|----|
| `id` | `scene-01`, `scene-02`, ... |
| `transition` | 現フェーズでは固定 `cut`。将来の storyboard 拡張で override 可 |
| `durationSec` | 実ファイル長を `ffprobe` か `mediainfo` で測る |
| `assets.videoSrc` | `scene-01.mp4` など |
| `assets.stills` | I2V 参照画像があれば `["ref-shot-01.webp"]` |
| `prompt` | storyboard の `shot.prompt` |
| `model` | storyboard の `shot.model` |
| `shot_id` | storyboard の `shot.id` |
| `multi_shot` | storyboard の `shot.multi_shot` |

## Timing Rules

```text
fps = meta.fps or 30
startSec = previous.endSec or 0
endSec = startSec + durationSec
startFrame = Math.round(startSec * fps)
durationInFrames = Math.round(durationSec * fps)
```

ギャップとオーバーラップは許容しない。

## File Layout

```text
dist/
├── scene-01.mp4
├── scene-02.mp4
├── ref-shot-01.webp
├── vertical/
│   └── shot-01-secondary.mp4
├── audio/
│   └── shotpack-placeholder.wav
└── manifest.json
```

vertical side output は manifest に含めない。

## Validation Checklist

- [ ] `audio.src` が存在する
- [ ] `deliverables[0].durationInFrames` が scene 合計と一致する
- [ ] `thumbnail.sceneId` が実在する
- [ ] `scene-*` ファイルが storyboard 順に揃っている
- [ ] `jq . dist/manifest.json` で parse できる
