# PixVerse CLI Exit Codes + Retry Logic

PixVerse CLI 1.0.3 を前提にした retry 方針。
CLI の validation 上限は `10s` だが、この skill は **実行前に `8s` cap** を入れる。

## Exit Code Table

| Code | Name | 意味 | エージェントのアクション |
|------|------|------|------------------------|
| 0 | Success | コマンド成功 | 続行。JSON から ID とメタデータを保持 |
| 1 | General Error | 予期しないエラー | ログに記録。必要なら 1 回だけ retry |
| 2 | Unknown Error | 不明なエラー | ログに記録して skip。retry しない |
| 3 | Auth Error | トークン期限切れ | `pixverse auth login --json` → 元コマンドを 1 回だけ retry |
| 4 | Credits Exhausted | クレジット不足 | **即停止**。生成済み分だけで部分レポートを出す |
| 5 | Generation Failed | 生成処理の失敗 | 同条件で **1 回だけ** retry |
| 6 | Validation Error | パラメータ不正 | エラー内容を補正して **1 回だけ** retry |

## Decision Flow

```text
コマンド実行
  │
  ├─ exit 0 → 成功。ID を記録して次へ
  │
  ├─ exit 3 → 認証回復
  │    ├─ pixverse auth login --json
  │    ├─ pixverse account info --json で .email を確認
  │    └─ 元コマンドを 1 回だけ再試行
  │
  ├─ exit 4 → クレジット不足
  │    ├─ pixverse account info --json で .credits.total を再取得
  │    ├─ 生成済みショットだけで manifest / log / credits report を出す
  │    └─ 停止
  │
  ├─ exit 5 → 生成失敗
  │    ├─ retry_count < 1 → 同条件で再試行
  │    └─ retry_count >= 1 → skip
  │
  ├─ exit 6 → バリデーションエラー
  │    ├─ duration > 8 → 8 に cap
  │    ├─ duration > 10 → まず 8 に cap
  │    ├─ invalid aspect ratio → 16:9 に戻す
  │    ├─ invalid ID → 数値 ID を使っているか確認
  │    └─ 1 回だけ再試行
  │
  └─ exit 1 / 2 → ログに残して終了または skip
```

## 認証回復手順

```bash
pixverse auth login --json
pixverse account info --json
```

確認ポイント:

- `email` が返る
- `credits.total` が取得できる

## よくある Validation Error (exit 6)

| エラーメッセージ例 | 原因 | 修正方法 |
|-------------------|------|---------|
| `duration must be between 1 and 10` | duration 超過 | skill 側では 8 に cap して再試行 |
| `invalid aspect ratio` | サポート外比率 | `16:9` / `9:16` / `1:1` のいずれかに変更 |
| `prompt is required` | prompt 空 | storyboard / prompt assembly を確認 |
| `image file not found` | I2V 画像パス不正 | パス存在確認 |
| `too many keyframes` | transition の画像が多すぎる | 2 枚に絞る |
| `Invalid ID — must be a number` | `task wait` / download の ID 不正 | 数値 ID を渡す |

## Retry Budget

- 1 ショットあたり最大 **1 回**
- exit 4 は retry しない
- exit 2 は retry しない
- wide pass と vertical pass は予算を分けて扱う
