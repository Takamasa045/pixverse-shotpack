# Director Skill

## Responsibility

creative brief から、制作可能な `storyboard.yaml` を生成する。creative 判断はここに集約し、PixVerse CLI は実行しない。

V6 が利用可能なら PixVerse ネイティブモデルの既定値は `v6`。pricing や duration を強く固定したい案件では `v5.6` fallback も許可する。

## Inputs / Outputs

| 項目 | 内容 |
|------|------|
| 入力 | `brief.md`、任意の参照画像 |
| 出力 | `storyboard.yaml` |
| 読む参照 | `references/model-constraints.md`, `references/credit-estimation.md` |
| 禁止 | PixVerse CLI 実行、manifest 構築、ファイル rename |

## Required Output Schema

```yaml
meta:
  title: string
  fps: 30
  aspects: ["16:9"]
  style_notes: string
  color_arc: string
  prompt_negative: string
  workflow: "t2v" | "i2v"

shots:
  - id: "shot-01"
    prompt: string
    model: string
    quality: string
    duration: integer
    aspect_ratio: "16:9"
    audio: boolean
    multi_shot: boolean
    image_ref: string | null
    post_process:
      extend: integer | null
      upscale: string | null
      sound: string | null
      speech: string | null
    notes: string
```

`workflow: i2v` の場合のみ `image_generation` を追加する。

## Rules

1. 標準 shot 数は `6-8`
2. duration はモデル制約を超えない
3. `prompt_negative` には最低限 `blurry, distorted faces, watermark` を含める
4. わびさびと余白を意識した prompt 設計にする
5. セリフのローマ字表記は入れない
6. Midjourney パラメータを混ぜない
7. `notes` には制作意図だけを書き、CLI 手順は書かない
8. `multi_shot` は `v6` かつ 1 clip 内の内部カメラ遷移が必要なときだけ true

## Workflow Selection

- `t2v`: 速度重視、参照画像なし
- `i2v`: 世界観統一重視、reference still を前提

モデル選択の優先順:

- `v6`: camera control / character continuity / native audio / multi-shot を活かしたい
- `v5.6`: 既知の duration matrix と pricing を優先したい
- 他モデル: 明示的な作風上の理由があるときだけ

`i2v` を選ぶ条件:

- ブランド映像や product film で一貫性が重要
- Gate 1 で静止画レビューを入れたい
- brief に workflow 指定がある

## I2V Addendum

`workflow: i2v` のとき:

- 各 shot の `image_ref` を `"generate"` かローカルパスにする
- `meta.image_generation` を付ける
- 参照画像だけで構図が成立する prompt に寄せる

## Gate 1 Package

Orchestrator に渡す要約:

- workflow
- shot 数
- 各 shot の `id`, `model`, `duration`, `multi_shot`, `post_process`
- 推定クレジット

## Review Checklist

- [ ] schema に必須キーが揃っている
- [ ] duration が `references/model-constraints.md` の範囲内
- [ ] `prompt_negative` が最低語句を含む
- [ ] `workflow: i2v` なら `image_generation` がある
- [ ] post_process は必要な shot だけ設定されている
- [ ] `multi_shot: true` の shot は `v6` を使っている
