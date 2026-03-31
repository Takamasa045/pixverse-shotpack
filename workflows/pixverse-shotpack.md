# Workflow: PixVerse Shot Generator (T2V)

`meta.workflow: "t2v"` の storyboard を受け取り、PixVerse CLI で primary pass のショット群を生成するための runbook。Orchestrator から Gate 1 承認後に呼ばれる前提。PixVerse ネイティブモデルは `v6` を標準とする。

## Inputs

- `storyboard.yaml`
- `dist/pipeline-state.json` があれば resume 情報

## Outputs

- `dist/shot-01-primary.mp4` などの primary asset
- `dist/run-log.md`
- `dist/pipeline-state.json`

## Preconditions

1. `storyboard.yaml` は Gate 1 承認済み
2. `meta.workflow` は `t2v`
3. すべての CLI コマンドに `--json` を付ける
4. credit 見積もりは `references/credit-estimation.md` を使う

## Step 1: Preflight

```bash
pixverse auth status --json
pixverse account info --json
```

判定:

- exit `3`: `pixverse auth login` を実行して 1 回だけ再試行
- 残高不足: `credit_insufficient` を Orchestrator へ返却して停止
- 予算が残高の 80% 超: `credit_warning` を Gate に出す

## Step 2: Submit Jobs

各 shot に対して:

```bash
pixverse create video \
  --prompt "<shot.prompt>" \
  --model "<shot.model>" \
  --quality "<shot.quality>" \
  --duration <shot.duration> \
  --aspect-ratio "<shot.aspect_ratio>" \
  $( [ "<shot.audio>" = "true" ] && echo "--audio" ) \
  $( [ "<shot.multi_shot>" = "true" ] && echo "--multi-shot" ) \
  --no-wait \
  --json
```

ジョブキューには最低限以下を持つ。

```json
{
  "shot_id": "shot-01",
  "video_id": 100001,
  "submitted_at": "2026-03-30T14:40:00+09:00"
}
```

## Step 3: Wait and Retry

```bash
pixverse task wait <video_id> --json --timeout 300
```

終了コード契約:

- exit `0`: 完了
- exit `2`: timeout を `600` に上げて 1 回だけ再試行
- exit `5`: `meta.prompt_negative` を補強して最大 2 回まで再投入
- exit `6`: validation error。値を記録して停止。再投入しない

`v6` で `multi_shot: true` の場合は、1 クリップの内部に複数カメラ遷移を持たせる。scene 分割の代替には使わない。

詳細は `references/exit-codes.md` を正とする。

## Step 4: Download

```bash
pixverse asset download <video_id> --dest dist/ --json
```

download 後は新規ファイルを検出し、対象 shot に対応付けて以下へ rename する。

- primary: `dist/shot-01-primary.mp4`
- failed retry temp: `dist/.retry-shot-01-<n>.mp4`

## Step 5: Run Log

`dist/run-log.md` に追記する内容:

- shot ごとの投入時刻 / 完了時刻
- 実行した model / duration / quality
- `multi_shot` の有無
- 消費クレジット
- retry 回数
- 最終 status (`success`, `retried`, `permanent_failure`)

例は `examples/run-log.example.md` を参照。

## Step 6: Pipeline State

フェーズの節目ごとに `dist/pipeline-state.json` を更新する。

- `current_phase`
- `phases_completed`
- `phases_remaining`
- `credits_consumed`
- `retry_count["shot-generator"]`
- `errors`

## Dry Run

`--dry-run` では:

- コマンド文字列だけ組み立てる
- `dist/shot-01-primary.mp4` などの予定ファイルを一覧化する
- `run-log.md` は skeleton のみ出す

## Handoff

全ショットの primary output が揃ったら、Orchestrator は Gate 2 へ進む。
