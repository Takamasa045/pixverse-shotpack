# Shot Generator Skill

## Responsibility

承認済み `storyboard.yaml` を読み、PixVerse CLI でショット群を生成する。非同期ジョブ管理、クレジット確認、終了コード処理、部分 retry はここに集約する。既定値は `v6` だが、利用可能モデルは `references/model-constraints.md` を正とする。

## Inputs / Outputs

| 項目 | 内容 |
|------|------|
| 入力 | Gate 1 承認済み `storyboard.yaml` |
| 出力 | `dist/shot-*-primary.mp4`, `dist/ref-shot-*.webp`, `dist/run-log.md` |
| 読む参照 | `references/exit-codes.md`, `references/credit-estimation.md`, `references/model-constraints.md` |
| CLI | `auth`, `account info`, `create video`, `create image`, `task wait`, `asset download` |

## Core Rules

1. すべての CLI に `--json`
2. 並列投入前に残高チェック
3. retry は shot 単位
4. 生成済み asset を消さない
5. `run-log.md` に全 retry を残す
6. `multi_shot: true` なら `--multi-shot` を付ける。対応外モデルで validation error が出たら、その shot だけ false にして再投入する

## Preflight

```bash
pixverse auth status --json
pixverse account info --json
```

- 残高不足なら `credit_insufficient`
- 80% 超の予算なら `credit_warning`

## T2V Flow

1. storyboard を読む
2. 各 shot の video job を `--no-wait` で投入
3. `pixverse task wait` で完了待機
4. `pixverse asset download` で保存
5. `dist/shot-01-primary.mp4` に rename

基本コマンド断片:

```bash
pixverse create video \
  --model "$MODEL" \
  $( [ "$AUDIO" = "true" ] && echo "--audio" ) \
  $( [ "$MULTI_SHOT" = "true" ] && echo "--multi-shot" ) \
  --json
```

## I2V Flow

1. `image_ref: "generate"` の shot だけ still を生成
2. `dist/ref-shot-01.webp` に保存
3. Gate 1.5 を待つ
4. `--image dist/ref-shot-01.webp` 付きで video job を投入

## Exit Codes

`references/exit-codes.md` をそのまま適用する。

- exit `2`: timeout 倍増で 1 回だけ再試行
- exit `3`: 再認証後に 1 回だけ再試行
- exit `4`: 即停止
- exit `5`: `prompt_negative` 補強で最大 2 回 retry
- exit `6`: validation error。ログを書いて停止

## Run Log Minimum Fields

- shot_id
- model
- duration
- multi_shot
- output path
- submitted_at
- completed_at
- retries
- credits
- final status

## Gate 2 Handoff

Orchestrator へ渡す内容:

- 生成済みファイル一覧
- permanent failure の一覧
- 消費クレジット実績
- preview 候補ファイル
