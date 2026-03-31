# Workflow: Orchestrator Flow

Orchestrator は creative も CLI 実行も担当しない。開始フェーズの決定、Gate 提示、state 管理だけを行う。

## Responsibilities

1. 入力ファイルから開始位置を判定する
2. Gate で承認 / 修正 / 中止を受け取る
3. 出力ファイルを次フェーズへ渡す

## Start Detection

| 条件 | 開始フェーズ |
|------|-------------|
| `brief.md` のみ | Director |
| `brief.md` + `storyboard.yaml` | Gate 1 |
| `storyboard.yaml` のみ | Gate 1 |
| `dist/` + `storyboard.yaml` | Gate 2 |
| `dist/manifest.json` が存在 | Assembler |

## State Transition

```text
director
  -> gate-1-storyboard
  -> shot-generator
  -> gate-1.5-reference-stills (optional)
  -> gate-2-shot-quality
  -> post-processor
  -> assembler
```

## Gate Definitions

### Gate 1

提示内容:

- storyboard 全体
- workflow
- 推定クレジット
- post_process の有無

操作:

- `approve`
- `revise`
- `abort`

### Gate 1.5

提示内容:

- 参照画像一覧
- 画像生成実績クレジット
- 再生成候補

操作:

- `approve`
- `retry`
- `abort`

### Gate 2

提示内容:

- primary output 一覧
- プレビューまたはファイル情報
- 実績クレジット
- `run-log.md` の要点

操作:

- `approve_all`
- `retry_specific`
- `abort`

## pipeline-state.json

更新タイミング:

- 各 phase 完了直後
- Gate に入る直前
- retry 実行後
- abort / infrastructure error 発生時

最低限の保持項目:

- `pipeline_id`
- `current_phase`
- `phases_completed`
- `phases_remaining`
- `credits_consumed`
- `credits_budget`
- `retry_count`
- `errors`

完全例は `examples/pipeline-state.example.json` を参照。

## Resume Rules

1. `phases_completed` にある phase は再実行しない
2. `run-log.md` に `success` がある `shot_id` は再生成しない
3. Gate 再開時は直近の提示対象だけを再表示する
4. Assembler 再実行時は既存アセットを削除せず、manifest と report だけ再構築する

## Dry Run

dry run では PixVerse CLI を呼ばず、次だけ行う。

- 開始フェーズ判定
- Gate 提示内容の組み立て
- 予定コマンドの列挙
- 予定ファイルの列挙
- `dist/manifest.json` の skeleton 出力

## Migration Note

現時点は Pattern A を採用するが、将来は各 phase を `claude --task` で分離する。

移行時に追加するもの:

- `orchestrator.sh`
- phase ごとのサブプロセス起動
- Gate 入出力の明示的な橋渡し
