---
name: pixverse-shotpack
description: >
  brief.md または storyboard.yaml から、Orchestrator が Director / Shot Generator /
  Post-Processor / Assembler を段階実行し、Gate と state file を介して
  dist/manifest.json まで組み立てる。
allowed-tools: [Bash, Read, Write, Edit, Glob, Grep]
---

# PixVerse Shotpack Orchestrator

## Overview

この skill は親 Orchestrator 用。責務は 3 つだけに限定する。

1. 開始フェーズの判定
2. Gate での承認取得
3. サブエージェント間のファイル受け渡し

creative 判断は `skills/director.skill.md`、PixVerse CLI 実行は `skills/shot-generator.skill.md`、後処理は `skills/post-processor.skill.md`、manifest 構築は `skills/assembler.skill.md` を正とする。PixVerse ネイティブモデルは `v6` を優先し、`v5.6` は fallback として扱う。

## Current Operating Pattern

- 現時点の運用は Pattern A: 単一エージェント + フェーズ分離
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

`--dry-run` では PixVerse CLI を実行しない。代わりに以下を出力する。

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
9. `v6` の `multi_shot` は opt-in。1 scene = 1 file の契約は崩さない

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

VPS から Mac mini への契約ファイルは `dist/manifest.json` を正とし、コストと再開情報は補助ファイルとして別送する。
