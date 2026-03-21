# Manifest Schema Reference

## 概要

`dist/manifest.json` は、現在の consumer が読む `RenderManifest` 互換 JSON として扱う。
正規ソースは、実際にこの manifest を読む Remotion 側アプリケーションの型定義。

重要:

- 現 consumer は `manifest.audio.src` を直接読む
- そのため shotpack でも **`audio` は non-null**
- `9:16` side output は現 schema では表現できないため、manifest は **primary の wide のみ** を指す

## 現行型

```typescript
type RenderManifest = {
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
    hookText?: string;
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
  }[];
};
```

## Shotpack で入れる値

### project

| フィールド | 値 |
|-----------|----|
| `id` | `meta.title` を kebab-case に slug 化 |
| `name` | `meta.title` をそのまま使う |
| `version` | `"1.0.0"` |
| `primaryDeliverable` | `"wide"` |
| `textPolicy` | `""` |
| `editPolicy` | `""` |
| `protagonistPolicy` | `""` |
| `motifs` | shot の `motif` を集約 |
| `body` | `""` |
| `artistNotes` | `null` |
| `referenceNotes` | `null` |

### audio

audio を null にしない。consumer 互換を保つため、無音プレースホルダを使う。

| フィールド | 値 |
|-----------|----|
| `src` | `audio/shotpack-placeholder.wav` |
| `durationInSeconds` | shot 合計秒数 |
| `bpm` | `90` などの固定値、または consumer 側で扱いやすい保守値 |

### theme

brief に指定があればそれを使い、なければ:

- `background`: `#0A0A0A`
- `accent`: `#FF6B35`
- `text`: `#FFFFFF`

### deliverables

現行 schema では scene ごとに asset path を 1 本しか持てないため、shotpack manifest は **wide だけ** を持つ。

| フィールド | 値 |
|-----------|----|
| `id` | `"wide"` |
| `width` | `1920` |
| `height` | `1080` |
| `fps` | `meta.fps` または `30` |
| `compositionId` | `"Shotpack"` |
| `durationInFrames` | 全 scene の `durationInFrames` 合計 |
| `sceneCount` | `scenes.length` |

### scenes

| フィールド | 値 |
|-----------|----|
| `id` | storyboard の `shot.id` |
| `music_section` | `""` |
| `objective` | storyboard の `objective`、なければ `""` |
| `emotion` | storyboard の `emotion`、なければ `""` |
| `motif` | storyboard の `motif`、なければ `""` |
| `transition` | `cut`, `crossfade`, `morph` のいずれか |
| `startSec` | 前 scene の `endSec` |
| `endSec` | `startSec + durationSec` |
| `durationSec` | shot duration |
| `startFrame` | `Math.round(startSec * fps)` |
| `durationInFrames` | `Math.round(durationSec * fps)` |
| `assets.videoSrc` | video / transition は `clips/...` |
| `assets.stills` | image は `["stills/..."]`、それ以外は `[]` |

transition タイプの clip も、manifest 上は `assets.videoSrc: "clips/shot-05-trans.mp4"` のように扱う。

## Timing 計算

```text
fps = meta.fps || 30

for each shot in order:
  startSec = previous.endSec or 0
  endSec = startSec + durationSec
  startFrame = Math.round(startSec * fps)
  durationInFrames = Math.round(durationSec * fps)
```

ギャップやオーバーラップは許容しない。

## ファイル配置

```text
<remotion-project>/
└── public/
    └── assets/
        └── shotpack/
            ├── data/
            │   └── manifest.json
            ├── video/
            │   ├── shot-01-wide.mp4
            │   └── shot-05-trans.mp4
            ├── stills/
            │   └── shot-06-still.png
            └── audio/
                └── shotpack-placeholder.wav
```

## 読み込み時の注意

```typescript
<Audio src={staticFile(manifest.audio.src)} />
```

を consumer が直接呼ぶ前提なので、`audio.src` の参照先ファイルが必要。

`9:16` の side output を作っても、現行 `RenderManifest` だけでは切り替えできない。vertical を使うには consumer 側で別 manifest または aspect-aware asset mapping を追加する必要がある。

## バリデーションチェックリスト

- [ ] `audio` が non-null
- [ ] `thumbnail` がある
- [ ] `scenes` が 1 件以上ある
- [ ] `deliverables[0].durationInFrames` が scene 合計と一致する
- [ ] `startSec` / `startFrame` が連続している
- [ ] `videoSrc` または `stills` の参照先ファイルが存在する
- [ ] `jq . dist/manifest.json` で parse できる
