---
name: pixverse-shotpack
description: >
  自然言語の依頼を project.yaml / brief.md / storyboard.yaml に正規化し、
  validate / plan / run --dry-run / run / render を通して
  dist/manifest.json と final MP4 まで組み立てる。
allowed-tools: [Bash, Read, Write, Edit, Glob, Grep]
---

# PixVerse Shotpack Orchestrator

## Overview

この skill は親 Orchestrator 用。実行面では `project.yaml` を単一の入口として扱う。責務は 4 つに限定する。

1. 自然言語依頼を `project.yaml` / `brief.md` / `storyboard.yaml` に正規化する
2. 開始フェーズを判定する
3. Gate での承認を管理する
4. サブエージェント間のファイル受け渡しと CLI 実行を管理する

creative 判断は `skills/director.skill.md`、PixVerse CLI 実行は `skills/shot-generator.skill.md`、後処理は `skills/post-processor.skill.md`、manifest 構築は `skills/assembler.skill.md` を正とする。既定モデルは `v6` だが、`pixverse-c1`、`happyhorse-1.0`、`seedance-*`、`kling-*` など最新 CLI 対応モデルは `references/model-constraints.md` を見て選ぶ。

Remotion consumer 側の composition は `src/` を正とし、producer 契約は変更しない。consumer が参照する入口 manifest は通常 `dist/manifest.json` だが、ローカル preview では `public/shotpack-sample/manifest.json` を fallback として使える。

## Runtime Entry

必ず `project.yaml` を正本として扱う。最低限の運用順は次のとおり。

1. `./bin/pipeline validate --config ./project.yaml`
2. `./bin/pipeline plan --config ./project.yaml`
3. `./bin/pipeline run --config ./project.yaml --dry-run`
4. `./bin/pipeline run --config ./project.yaml`
5. 必要なら `./bin/pipeline render --config ./project.yaml`

`assets.mode` は次のどちらかに限定する。

- `local`: 既存 asset を `sourceDir` から `dist/` に staged copy する
- `pixverse`: PixVerse CLI を実行して静止画と動画を生成し、`dist/` に保存する

## Current Operating Pattern

- 現時点の運用は Pattern A: 単一エージェント + `project.yaml` 駆動 + フェーズ分離
- `skills/` 配下の各 skill を独立責務として扱い、不要な判断を混在させない
- 将来の `claude --task` 分離手順は `workflows/orchestrator-flow.md` を参照

## Start Phase Detection

| 入力パターン | 開始位置 | ルール |
|-------------|---------|-------|
| `brief.md` のみ | Director | `storyboard.yaml` を新規生成して Gate 1 へ進む |
| `brief.md` + `storyboard.yaml` | Gate 1 | `storyboard.yaml` を正とし、brief は補足参照のみ |
| `storyboard.yaml` のみ | Gate 1 | schema と制約を確認して承認待ちに入る |
| `dist/` + `storyboard.yaml` | Gate 2 | 既存アセットを再利用し、品質確認から再開する |
| `dist/manifest.json` のみ | Assembler | manifest の再組み立てまたは整合確認だけ行う |

## Phase Map

```text
Director
  -> Gate 1: storyboard approval
  -> Shot Generator
  -> Gate 1.5: reference still approval (i2v + image_ref=generate のみ)
  -> Gate 2: shot quality approval
  -> Post-Processor (skip 可)
  -> Assembler
```

## Gate Rules

### Gate 1: storyboard approval

必ず提示する内容:

- ショット一覧
- workflow (`t2v` / `i2v`)
- 推定クレジット消費量
- shot ごとの model / duration / `multi_shot` / post_process 有無

許可する操作:

- `approve`: Shot Generator へ進む
- `revise`: 修正指示付きで Director を再実行
- `abort`: 停止。生成済みファイルは保持

備考:

- storyboard 修正ループは 3 回を上限の目安にする

### Gate 1.5: reference still approval

`meta.workflow: i2v` かつ `image_ref: "generate"` がある場合のみ発生する。

- `approve`: 参照画像を固定して I2V を開始
- `retry`: 指定ショットの静止画だけ再生成
- `abort`: 停止

### Gate 2: shot quality approval

必ず提示する内容:

- `dist/` の primary output 一覧
- vertical side output の有無
- `run-log.md` の要点
- 実績クレジット

許可する操作:

- `approve_all`: Post-Processor へ進む。対象ゼロなら Assembler へスキップ
- `retry_specific`: 指定 `shot_id` だけ Shot Generator を再実行
- `abort`: 停止

## State Management

状態は `dist/pipeline-state.json` に書き出す。最低限の必須キー:

- `pipeline_id`
- `current_phase`
- `started_at`
- `phases_completed`
- `phases_remaining`
- `credits_consumed`
- `credits_budget`
- `retry_count`
- `errors`

構造の完全例は `examples/pipeline-state.example.json` を参照。

## Dry Run

`./bin/pipeline run --config ./project.yaml --dry-run` では PixVerse CLI を実行しない。代わりに以下を出力する。

- 実行予定コマンド一覧
- 推定クレジット消費量
- 生成予定ファイル一覧
- `dist/manifest.json` のスケルトン

dry run でも Gate 表示内容は通常運用と同等に組み立てる。

## Non-Negotiable Rules

1. すべての PixVerse CLI コマンドに `--json` を付ける
2. `dist/manifest.json` は既存 consumer が読める `RenderManifest` 互換を維持する
3. manifest に含めるのは primary pass の `16:9` だけ
4. partial failure があっても `dist/` の成果物を消さない
5. retry 契約は `references/exit-codes.md` を正とする
6. モデル制約は `references/model-constraints.md` を正とする
7. クレジット見積もりは `references/credit-estimation.md` を正とする
8. `run-log.md` と `credits-report.json` は Assembler 完了前に必ず揃える
9. `multi_shot` は opt-in。1 scene = 1 file の契約は崩さない

## File Contracts

| 役割 | ファイル |
|------|---------|
| Orchestrator runbook | `workflows/orchestrator-flow.md` |
| T2V shot generation | `workflows/pixverse-shotpack.md` |
| I2V shot generation | `workflows/image-first-i2v-pipeline.md` |
| Director skill | `skills/director.skill.md` |
| Shot Generator skill | `skills/shot-generator.skill.md` |
| Post-Processor skill | `skills/post-processor.skill.md` |
| Assembler skill | `skills/assembler.skill.md` |
| Manifest contract | `references/manifest-schema.md` |
| Exit codes | `references/exit-codes.md` |
| Credit heuristics | `references/credit-estimation.md` |
| Model limits | `references/model-constraints.md` |

## Handoff

最終成果物は以下。

- `dist/manifest.json`
- `dist/credits-report.json`
- `dist/run-log.md`
- `dist/pipeline-state.json`
- `dist/renders/*.mp4`

ローカル consumer の確認手段は以下。

- `./bin/pipeline render --config ./project.yaml`
- `npm run start`
- `npm run render:3d-linked`
- `npm run render:shotpack`

VPS から Mac mini への契約ファイルは `dist/manifest.json` を正とし、コストと再開情報は補助ファイルとして別送する。
