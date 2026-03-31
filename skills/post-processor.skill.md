# Post-Processor Skill

## Responsibility

生成済み asset に対して後処理を適用する。新規ショット生成は行わず、既存動画に対する `extend`, `upscale`, `sound`, `speech` だけを担当する。

## Inputs / Outputs

| 項目 | 内容 |
|------|------|
| 入力 | `dist/shot-*-primary.mp4`, `storyboard.yaml` |
| 出力 | 更新後の `dist/shot-*-primary.mp4`, `dist/raw/*`, `dist/run-log.md` |
| 読む参照 | `references/exit-codes.md` |
| CLI | `create extend`, `create upscale`, `create sound`, `create speech`, `task wait`, `asset download` |

## Skip Rules

次のいずれかなら何もせず成功終了する。

- 全 shot の `post_process` が `null`
- 全フィールドが `null`
- Orchestrator が `--skip-post-process` を渡した

## Chain Order

必ず以下の順で実行する。

```text
extend -> upscale -> sound -> speech
```

## File Handling

1. 対象ファイルを `dist/raw/` にバックアップ
2. 各 step 完了後に最新出力で上書き
3. 失敗時は `dist/raw/` から復元

## Logging

`dist/run-log.md` に追加する項目:

- shot_id
- 実行した step
- 成否
- 追加クレジット
- 復元の有無

## Failure Rule

- 1 step でも失敗したら、その shot はバックアップへ戻す
- 他 shot の後処理は継続してよい
- Orchestrator へは shot 単位で失敗を返す
