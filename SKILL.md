---
name: pixverse-shotpack
description: >
  brief.mdとstoryboard.yamlからPixVerse CLIでショット群を生成し、
  Remotion互換のmanifest.jsonを出力する。
  「ショットパック作って」「briefからクリップ生成」「PixVerseでRemotionショット」「shotpack生成」
  "generate shotpack", "create clips from brief", "PixVerse Remotion shots", "build shotpack" で発動。
allowed-tools: [Bash, Read, Write, Edit, Glob, Grep]
---

# PixVerse Shotpack

## Overview

brief または storyboard を読み、PixVerse CLI で 6〜8 本のショットを生成し、ダウンロード → リネーム → `manifest.json` 出力までを一気通貫で行う。Primary pass は `16:9` を正とし、必要なら `9:16` は second pass で追加生成する。

現行の `RenderManifest` は scene ごとに 1 本の `videoSrc` しか持てないため、`manifest.json` には **primary の 16:9 アセットだけ** を結び付ける。`9:16` で生成したファイルは side output として `dist/` に残し、`run-log.md` と `credits-report.json` で追跡する。

既存 consumer にそのまま渡す場合、現行実装は `manifest.audio.src` を必須で読む。したがって shotpack でも `dist/audio/shotpack-placeholder.wav` のような無音プレースホルダを用意し、manifest の `audio` を欠落させないこと。

## When to Use

| 入力パターン | 判断 |
|-------------|------|
| `brief.md` のみ | brief を読んで storyboard を自動生成 → Gate 1 承認 → 生成実行 |
| `storyboard.yaml` のみ | スキーマ検証 → Gate 1 承認 → 生成実行 |
| 両方あり | storyboard がショット定義の正、brief は prompt 補強に使用 |
| どちらもなし | ユーザーにどちらかの提供を求める |

### 生成パイプラインの選択

| パイプライン | 使いどき | ワークフロー |
|-------------|---------|-------------|
| **T2V（テキスト→動画）** | 素早くプロトタイプしたい、ショット間の統一感が二次的 | `workflows/pixverse-shotpack.md` |
| **Image-First I2V（画像→動画）** | ブランド映像・PV・紹介動画など世界観統一が最優先 | `workflows/image-first-i2v-pipeline.md` |

**Image-First I2V の利点:**
- Nano Banana でリファレンス画像を先に生成 → 色調・質感・構図を事前レビュー
- 承認後に PixVerse I2V でアニメーション化 → 全ショットが同じ世界観
- リテイクが画像単位で可能（動画を全部作り直さなくて済む）
- I2V は T2V より低クレジット

## Inputs

- **`brief.md`** — ルートでそのまま編集して使うスターター brief（具体例: `examples/brief.example.md`）
- **`storyboard.yaml`** — ルートでそのまま編集して使うスターター storyboard（具体例: `examples/storyboard.sample.yaml`）
- **参照画像**（任意） — I2V や transition の keyframe に使う
- **リファレンス画像生成**（推奨） — Nano Banana で事前に全ショットの画像を生成し、世界観を統一してから I2V で動画化する。詳細は `workflows/image-first-i2v-pipeline.md`

## Defaults

| パラメータ | デフォルト値 | 備考 |
|-----------|------------|------|
| model | `v5.6` | PixVerse CLI 1.0.3 の video 系デフォルトに合わせる |
| duration | `5s` | storyboard で `3〜8s` にオーバーライド可 |
| quality | `1080p` | transition だけ `720p` を許容可 |
| aspect_ratio | `16:9` | `9:16` は Gate 2 承認後に second pass |
| shot_count | `6〜8` | brief から自動決定、最低 6 本 |
| fps | `30` | manifest 計算用 |

---

## CLI Usage

> **必須:** すべての PixVerse CLI コマンドに `--json` を付ける。

コマンドテンプレートと実行手順は `workflows/pixverse-shotpack.md` を正とする。

## Shot Generation Rules

### Model Selection

| ショットタイプ | CLI コマンド | デフォルトモデル |
|--------------|-------------|----------------|
| video (T2V / I2V) | `pixverse create video` | `v5.6` |
| transition | `pixverse create transition` | `v5.6` |
| image (still) | `pixverse create image` | `pixverse create image --help` で確認 |

storyboard の `model` フィールドでショット単位の override は可。

### Duration

- 1 ショットの推奨尺は **3〜8 秒**
- storyboard で `duration` 未指定なら `5s`
- PixVerse CLI の validation 上限は `10s` だが、**skill 側の運用上限は `8s`**
- `duration > 8` は `8s` に cap し、cap した理由を `run-log.md` に残す

### Aspect Ratio

- **Primary pass:** まず `16:9` で全ショット生成
- **Second pass:** `meta.aspects` に `"9:16"` がある場合だけ、wide 完了後に Gate 2 で追加承認を取って再生成
- `9:16` の side output は `dist/` に保存するが、現行 `manifest.json` には結び付けない

### Hero Shot

storyboard で `hero: true` のショットは生成後に `pixverse create upscale` で 1080p へ上げる。

## Camera Movement

PixVerse CLI に専用の camera フラグはない。**camera 指示は prompt に注入する。** 未指定だとズーム寄りになりやすいので、必ず `camera.movement` を指定すること。

### 語彙テーブル

| movement | プロンプト注入テキスト |
|----------|----------------------|
| `static` | `locked-off static camera` |
| `dolly-in` | `slow dolly push-in` |
| `dolly-out` | `slow dolly pull-out` |
| `pan-left` | `slow camera pan left to right` |
| `pan-right` | `slow camera pan right to left` |
| `tilt-up` | `slow camera tilt upward` |
| `tilt-down` | `slow camera tilt downward` |
| `orbit` | `slow orbit around subject` |
| `tracking` | `tracking shot following subject` |
| `aerial-drift` | `slow aerial drone drifting forward` |
| `crane-up` | `slow crane shot rising upward` |
| `handheld` | `subtle handheld camera movement` |
| `zoom-in` | `slow zoom in` |
| `zoom-out` | `slow zoom out` |

### プロンプト組み立て

```text
[Subject + characteristics], [Action / state], [Environment], [Lighting],
[Camera movement text], [Mood / atmosphere], [meta.style_notes]
```

CLI 1.0.3 には negative prompt 専用フラグがないため、negative 指示は prompt 末尾へ `avoiding: <meta.prompt_negative>` として付加する。

### 多様性ルール

1. `zoom-in` / `zoom-out` は **6〜8 ショットで最大 1 回**
2. **連続ショットで同じ movement を使わない**
3. パック全体で **4 種類以上** の movement を使う
4. `camera.movement` 未指定のショットは上記ルールに従って自動補完する

## Composition Framework

brief → storyboard 自動生成時、または storyboard review 時に以下を守る。

### 3-Act Structure

全映像を 3 幕で構成し、各ショットに `act: 1 | 2 | 3` を割り当てる。

| Act | 名前 | 尺の割合 | 30s の目安 | 目的 |
|-----|------|---------|-----------|------|
| 1 | Hook | 20-25% | 0-7s | 視覚的な問いかけ。ロゴ・テキストは最初の 3s に入れない |
| 2 | Body | 50-55% | 7-22s | 2-3 個のビジュアルアイデアを展開。クライマックスは全体の 65-75% 地点 |
| 3 | Resolution | 20-25% | 22-30s | ペースを落とし余韻。5-8s の長尺ホールドを置く |

### Shot Pacing

| ルール | 値 | 強制度 |
|--------|-----|-------|
| 30s shotpack のショット数 | 6-8 本 | HARD |
| 60s shotpack のショット数 | 10-14 本 | HARD |
| Duration variance ratio | 最短:最長 ≥ 1:3 | HARD |
| Act 1 クリップ尺 | 1.5-3s | SOFT |
| Act 2 クリップ尺 | 3-6s | SOFT |
| Act 3 クリップ尺 | 5-8s | SOFT |
| 全クリップ均一尺 | **禁止** | HARD |

### Shot Size Vocabulary

| framing | 略称 | 役割 | プロンプトキーワード |
|---------|------|------|-------------------|
| `wide` | W | WHERE | `wide shot`, `establishing shot` |
| `medium` | M | WHO | `medium shot`, `waist-up` |
| `medium-close` | MC | WHO + WHAT | `medium close-up`, `chest-up` |
| `close-up` | CU | WHAT | `close-up`, `face detail` |
| `extreme-close-up` | ECU | DETAIL | `extreme close-up`, `macro` |

### Shot Size Progression Rules

| ルール | 強制度 |
|--------|-------|
| 連続ショットは最低 1 サイズステップ以上ずらす | HARD |
| ECU は 6〜8 ショットで最大 2 本 | HARD |
| Act 転換点には Wide を置く | SOFT |
| 標準パターン: W → M → CU → M → W | SOFT |
| フックの逆パターン: ECU → W | SOFT |

### Transition Hierarchy

| transition | 使用条件 | 頻度 |
|-----------|---------|------|
| `cut` | デフォルト | 全体の 80% 以上 |
| `crossfade` | 冒頭または Act 境界のみ | 1-2 回 |
| `whiteout` / `blackout` | 最大 1 回、Act 3 入りのみ | 0-1 回 |
| `morph` | transition タイプの shot を明示生成する場合のみ | 明示指定時だけ |

### Color / Mood Arc

storyboard の各ショットに `color_temp: warm | neutral | cool` を割り当てる。

| パターン名 | Act 1 | Act 2 | Act 3 | 印象 |
|-----------|-------|-------|-------|------|
| `cool-to-warm` | cool | neutral | warm | 期待 → 成就 |
| `warm-to-cool` | warm | neutral | cool | 温もり → 喪失 |
| `mono-burst` | neutral | neutral + accent | neutral | プレミアム |

### AI Artifact Suppression

- 物理法則を意識した動詞を使う: `steam rising` のように書く
- キャラクター一貫性は前提にしない
- Wide は silhouette / rear view、ECU は手元や物体を優先
- `meta.style_notes` は全ショットで共通に保つ

## Composition Validation Checklist

**HARD（違反したら修正必須）**

- [ ] 全ショットに `act` がある
- [ ] transition タイプ以外は `framing` がある
- [ ] Duration variance ratio ≥ `1:3`
- [ ] 連続ショットで同じ `framing` が続かない
- [ ] ECU が 2 本以下
- [ ] `cut` 比率が 80% 以上
- [ ] `crossfade` は冒頭または Act 境界のみ
- [ ] `duration > 8s` は実行前に cap 済み

**SOFT（警告のみ）**

- [ ] Act 転換点に Wide がある
- [ ] 同一 Act 内で `color_temp` が統一されている
- [ ] Act 3 の尺が Act 1 より長い
- [ ] prompt が Assembly Formula 順になっている
- [ ] `meta.style_notes` が全ショット共通
- [ ] `camera.movement` が 4 種類以上ある

## Error Handling

`references/exit-codes.md` を正とする。要点: exit 4（クレジット不足）は即停止、それ以外は 1 回だけ再試行。

## Output Structure

```text
dist/
├── clips/
│   ├── shot-01-wide.mp4
│   ├── shot-01-vert.mp4      # Gate 2 実行時のみ
│   ├── shot-05-trans.mp4     # transition タイプ
│   └── ...
├── stills/
│   ├── shot-06-still.png
│   └── shot-06-still-vert.png  # optional 9:16 still pass
├── audio/
│   └── shotpack-placeholder.wav
├── manifest.json
├── run-log.md
└── credits-report.json
```

### Naming Convention

- video: `shot-{NN}-{aspect}.mp4`
- transition: `shot-{NN}-trans.mp4`
- still: `shot-{NN}-still.png`
- optional vertical still: `shot-{NN}-still-vert.png`

## Approval Gates

### Gate 1: Shot Plan + Credit Check

storyboard 解釈後、wide pass のショットプランと推定クレジットを **同時に** 提示する。

```text
| # | ID      | Act | Framing | Camera       | Duration | Transition | Est.Cr | Prompt (先頭40字) |
|---|---------|-----|---------|--------------|----------|------------|--------|-------------------|
| 1 | shot-01 | 1   | wide    | aerial-drift | 3s       | crossfade  | 400 cr | Wide aerial shot... |

必要クレジット（wide 推定）: 2,400 cr
リトライバッファ込み: 4,800 cr
現在の残高: 47,271 cr
```

`meta.aspects` に `9:16` が入っていても、この段階では **wide だけ** 見積もる。vertical pass は Gate 2 で別見積もりする。

### Gate 2: 9:16 Second Pass

wide 完了後、`meta.aspects` に `"9:16"` が含まれる場合だけ提示する。

```text
16:9 生成完了。9:16 の second pass を実行しますか？
追加クレジット（推定）: 2,400 cr
現在の残高: 45,100 cr
```

`9:16` で生成したアセットは `dist/` へ保存するが、現行 `manifest.json` には載せない。

### Gate 3: Completion Report

```text
生成結果: 6/6 成功
消費クレジット: 2,100 cr
出力: dist/manifest.json (6 scenes, 28s total)
```

失敗ショットがある場合だけ、再試行するか完了するかを確認する。

## Manifest Format

`references/manifest-schema.md` を正とする。要点:

- `audio` は non-null 必須（placeholder でも可）
- `scenes[].assets.videoSrc` は primary の wide ファイルを指す
- `thumbnail` は必須

## Gotchas

1. **`--json` を忘れる** — すべての CLI コマンドで必須
2. **`task wait` の誤用** — `--no-wait` を付けた時だけ必要
3. **8 秒 cap を忘れる** — CLI は 10 秒まで通るが、この skill は 8 秒まで
4. **全ショットがズームになる** — camera 指示を必ず prompt に注入する
5. **image model を固定文字列で書く** — `pixverse create image --help` で確認
6. **placeholder audio を省略する** — 現行 consumer は `manifest.audio.src` を直接読む
7. **I2V の同時生成上限** — Pro は同時 5 本まで（exit code `500044` でリトライ）
8. **I2V prompt に被写体詳細を書く** — 画像が被写体を担うので、prompt は動きにフォーカス
9. **ナレーションに PixVerse TTS を使う** — lip-sync 用。独立ナレーションは ElevenLabs TTS

## References

| カテゴリ | ファイル | 説明 |
|---------|---------|------|
| **Workflow** | `workflows/pixverse-shotpack.md` | T2V 実行手順（CLI コマンド・ステップ詳細） |
| **Workflow** | `workflows/image-first-i2v-pipeline.md` | 画像先行 I2V パイプライン |
| **Reference** | `references/exit-codes.md` | exit code と retry 方針 |
| **Reference** | `references/manifest-schema.md` | `RenderManifest` 互換仕様 |
| **Starter** | `brief.md` | 作業開始用 brief（直接編集） |
| **Starter** | `storyboard.yaml` | 作業開始用 storyboard（直接編集） |
| **Example** | `examples/brief.example.md` | brief の具体例 |
| **Example** | `examples/storyboard.sample.yaml` | storyboard の具体例 |
| **Example** | `examples/manifest.example.json` | manifest の完全な出力例 |
