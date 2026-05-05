# Model Constraints Reference

Director と Shot Generator が共有する制約表。PixVerse CLI / PixVerseAI skills の Supported Models を優先し、CLI validation がこの表と矛盾する場合は CLI を正とする。

## Source Snapshot

- CLI: `pixverse@1.1.6`
- Source: `PixVerseAI/skills` Supported Models
- Updated: 2026-05-05

## Video Models

| モデル | CLI value | mode | quality | duration | aspect ratio | repo notes |
|-------|-----------|------|---------|----------|--------------|------------|
| PixVerse V6 | `v6` | Video, Transition, Extend | `360p`, `540p`, `720p`, `1080p` | `1-15s` | `16:9`, `4:3`, `1:1`, `3:4`, `9:16`, `3:2`, `2:3`, `21:9` | 既定モデル。native audio と multi-shot を使う場合の第一候補 |
| PixVerse C1 | `pixverse-c1` | Video, Transition, Reference | `360p`, `540p`, `720p`, `1080p` | `1-15s` | `16:9`, `4:3`, `1:1`, `3:4`, `9:16`, `3:2`, `2:3` | character/reference 系の候補 |
| PixVerse v5.6 | `v5.6` | Video, Transition, Reference, Extend, Motion Control | `360p`, `540p`, `720p`, `1080p` | `1-10s` | `16:9`, `4:3`, `1:1`, `3:4`, `9:16`, `3:2`, `2:3` | fallback。motion control が必要な場合の候補 |
| Sora 2 | `sora-2` | Video | `720p` | `4s`, `8s`, `12s` | `16:9`, `9:16` | fixed duration 前提で使う |
| Sora 2 Pro | `sora-2-pro` | Video | `720p`, `1080p` | `4s`, `8s`, `12s` | `16:9`, `9:16` | 1080p が必要な Sora 系候補 |
| Veo 3.1 Standard | `veo-3.1-standard` | Video, Transition | `720p`, `1080p` | `4s`, `6s`, `8s` | `16:9`, `9:16` | 安定性優先の third-party 候補 |
| Veo 3.1 Fast | `veo-3.1-fast` | Video, Transition | `720p`, `1080p` | `4s`, `6s`, `8s` | `16:9`, `9:16` | speed 優先の Veo 候補 |
| Veo 3.1 Lite | `veo-3.1-lite` | Video | `720p`, `1080p` | `4s`, `5s`, `6s` | `16:9`, `9:16` | short shot 向き |
| Grok Imagine | `grok-imagine` | Video, Extend, Reference | `480p`, `720p` | `1-15s` | `16:9`, `4:3`, `1:1`, `9:16`, `3:4`, `3:2`, `2:3` | 720p 前提。広めの aspect 選択が必要な場合 |
| Happy Horse 1.0 | `happyhorse-1.0` | Video | `720p`, `1080p` | `3-15s` | `16:9`, `9:16`, `1:1`, `4:3`, `3:4` | stylized / motion-heavy shot の候補 |
| Seedance 2.0 Standard | `seedance-2.0-standard` | Video, Reference, Transition | `480p`, `720p` | `4-15s` | `16:9`, `4:3`, `1:1`, `3:4`, `9:16`, `21:9` | 21:9 や reference が必要な候補 |
| Seedance 2.0 Fast | `seedance-2.0-fast` | Video, Reference, Transition | `480p`, `720p` | `4-15s` | `16:9`, `4:3`, `1:1`, `3:4`, `9:16`, `21:9` | speed 優先の Seedance 候補 |
| Kling O3 Pro | `kling-o3-pro` | Video, Reference, Transition | `720p` | `3-15s` | `16:9`, `9:16`, `1:1` | Kling O3 高品質側 |
| Kling O3 Standard | `kling-o3-standard` | Video, Reference, Transition | `720p` | `3-15s` | `16:9`, `9:16`, `1:1` | Kling O3 標準側 |
| Kling 3.0 Pro | `kling-3.0-pro` | Video, Transition | `720p` | `3-15s` | `16:9`, `9:16`, `1:1` | Kling 3.0 高品質側 |
| Kling 3.0 Standard | `kling-3.0-standard` | Video, Transition | `720p` | `3-15s` | `16:9`, `9:16`, `1:1` | Kling 3.0 標準側 |

## Image Generation

| モデル | CLI value | quality | aspect ratio | repo notes |
|-------|-----------|---------|--------------|------------|
| Qwen Image | `qwen-image` | `720p`, `1080p` | `1:1`, `16:9`, `9:16`, `4:3`, `3:4`, `5:4`, `4:5`, `3:2`, `2:3`, `21:9` | CLI default |
| GPT Image 2 | `gpt-image-2.0` | `1080p`, `1440p`, `2160p` | quality 依存 | `detailLevel` / `detail_level` が必須 |
| Seedream 5.0 Lite | `seedream-5.0-lite` | `1440p`, `1800p`, `auto` | `1:1`, `16:9`, `9:16`, `4:3`, `3:4`, `5:4`, `4:5`, `3:2`, `2:3`, `21:9` | I2V reference still の既定 |
| Seedream 4.5 | `seedream-4.5` | `1440p`, `2160p`, `auto` | `1:1`, `16:9`, `9:16`, `4:3`, `3:4`, `5:4`, `4:5`, `3:2`, `2:3`, `21:9` | 高解像 reference |
| Seedream 4.0 | `seedream-4.0` | `1080p`, `1440p`, `2160p`, `auto` | `1:1`, `16:9`, `9:16`, `4:3`, `3:4`, `5:4`, `4:5`, `3:2`, `2:3`, `21:9` | fallback |
| Gemini 2.5 Flash | `gemini-2.5-flash` | `1080p`, `auto` | `1:1`, `16:9`, `9:16`, `4:3`, `3:4`, `5:4`, `4:5`, `3:2`, `2:3`, `21:9` | Nano Banana |
| Gemini 3.0 | `gemini-3.0` | `1080p`, `1440p`, `2160p`, `auto` | `1:1`, `16:9`, `9:16`, `4:3`, `3:4`, `5:4`, `4:5`, `3:2`, `2:3`, `21:9` | Nano Banana Pro |
| Gemini 3.1 Flash | `gemini-3.1-flash` | `512p`, `1080p`, `1440p`, `2160p`, `auto` | `1:1`, `16:9`, `9:16`, `4:3`, `3:4`, `5:4`, `4:5`, `3:2`, `2:3`, `21:9` | Nano Banana 2 |
| Kling Image O3 | `kling-image-o3` | `1080p`, `1440p`, `2160p` | `16:9`, `9:16`, `1:1`, `4:3`, `3:4`, `3:2`, `2:3`, `21:9` | Kling image |
| Kling Image V3 | `kling-image-v3` | `1080p`, `1440p` | `16:9`, `9:16`, `1:1`, `4:3`, `3:4`, `3:2`, `2:3`, `21:9` | Kling image fallback |

### GPT Image 2 Aspect Matrix

| quality | aspect ratio |
|---------|--------------|
| `1080p` | `1:1`, `3:2`, `2:3` |
| `1440p` | `1:1`, `16:9`, `9:16` |
| `2160p` | `16:9`, `9:16` |

`project.yaml` では `generation.image.detailLevel`、`storyboard.yaml` では `image_generation.detail_level` に `low`, `medium`, `high` のいずれかを指定する。

## Repository-Level Rules

1. `model` は pipeline 内で固定 enum にせず、PixVerse CLI に渡す。
2. known model は `src/pipeline/core.ts` の validation で quality / duration / aspect ratio を事前確認する。
3. unknown model は warning に留め、CLI validation を正とする。
4. duration は整数秒で扱う。
5. primary pass の標準は `16:9`。`9:16` などを primary にする場合は render 設定と manifest consumer を合わせる。
6. `multi_shot` は opt-in。対応外モデルで CLI が warning / validation error を返した場合は、その shot だけ `multi_shot: false` にして再投入する。
7. `audio` は opt-in。対応外モデルで CLI が warning / validation error を返した場合は、その shot だけ `audio: false` にして再投入する。

## Post-Process Chain

後処理順序は固定。

```text
extend -> upscale -> sound -> speech
```

この順序を変えない。
