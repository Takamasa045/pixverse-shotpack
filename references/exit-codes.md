# PixVerse CLI Exit Codes

本リポジトリでは、PixVerse CLI の終了コードを shot-generator / post-processor の状態遷移へそのままマッピングする。

## Authoritative Mapping

| Exit code | 意味 | Sub-agent の動作 | Orchestrator への報告 |
|-----------|------|------------------|----------------------|
| `0` | 成功 | 次の処理へ進む | 最終集計のみ |
| `2` | timeout | timeout を倍増して 1 回だけ再試行 | 再試行後も失敗なら `timeout_exhausted` |
| `3` | auth expired | `pixverse auth login` 後に 1 回だけ再試行 | 再認証後も失敗なら `auth_failed` |
| `4` | out of credits | 即時停止。未投入ショットは実行しない | `credit_insufficient` |
| `5` | generation failed | `prompt_negative` 補強で最大 2 回再投入 | 2 回失敗で `generation_failed` |
| `6` | validation error | パラメータをログへ残して停止 | `validation_error` |

## Handling Notes

### exit 2

- `pixverse task wait <id> --json --timeout 300`
- failure 時のみ `--timeout 600` で 1 回再試行

### exit 3

```bash
pixverse auth login
pixverse auth status --json
```

- 認証復旧後に元コマンドを 1 回だけ再実行する

### exit 4

- 以降の shot は投入しない
- `run-log.md` と `pipeline-state.json` に残高と消費済み credits を保存する

### exit 5

- retry ごとに `run-log.md` へ理由を書く
- 同一 `shot_id` への再投入は最大 2 回
- Gate 2 では permanent failure を個別に明示する

### exit 6

- value correction はその場では行わない
- Director / storyboard 側の修正事項として戻す
- 代表例: invalid duration, invalid aspect ratio, missing image path

## Other Errors

`1` や未知のコードは infrastructure error 扱いにする。

- `pipeline-state.json` を更新
- 生成済みファイルは保持
- 後日再開可能な状態で停止
