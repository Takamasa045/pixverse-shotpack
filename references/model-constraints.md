# Model Constraints Reference

Director と Shot Generator が共有する制約表。V6 の公開確認は済んでいるが、duration の完全な公開マトリクスはまだ薄いため、公開済み情報と repo safe default を分けて書く。CLI validation がこれと矛盾する場合は CLI を優先する。

## Video Models

| モデル | 公開済み duration 情報 | repo safe default | 推奨 quality | repo で使う workflow | 備考 |
|-------|-----------------------|------------------|-------------|---------------------|------|
| `v6` | official pricing は `per-second` 課金を公開、max duration 行列は未確認 | `5-8s` | `720p`, `1080p` | `t2v`, `i2v` | 既定モデル。`audio` と `multi_shot` を活かせる |
| `v5.6` | `1-10s` | `5-8s` | `720p`, `1080p` | `t2v`, `i2v` | fallback |
| `sora-2-pro` | `4s`, `8s`, `12s` | `8s` | `1080p` | `t2v`, `i2v` | 長めの cinematic shot 向き |
| `veo-3.1-standard` | `4s`, `6s`, `8s` | `6s` | `1080p` | `t2v`, `i2v` | 安定性優先 |
| `grok-imagine` | `1-15s` | `4-8s` | `720p`, `1080p` | `t2v` | 実行前 validation を強めに見る |

## Image Generation

| モデル | 推奨 quality | 推奨 aspect | 用途 |
|-------|-------------|------------|------|
| `seedream-5.0-lite` | `1800p` | `16:9` | I2V 用 reference still |

## Repository-Level Rules

1. primary pass は常に `16:9`
2. `9:16` は Gate 2 承認後の second pass のみ
3. duration は整数秒で扱う
4. Director は Gate 1 前に out-of-range duration を弾く
5. `prompt_negative` には最低限 `blurry, distorted faces, watermark` を含める
6. `multi_shot` は `v6` のみで有効扱いにする
7. `multi_shot` を使う shot は 1 clip 内の内部カメラ変化に限定する

## V6 Notes

- 2026-03-30 の公式発表で、V6 は camera control、character performance、native audio、multi-shot generation を強化
- CLI 1.0.6 では `--audio` と `--multi-shot` が利用可能
- multilingual in-frame text も V6 の改善点だが、この repo では引き続き Remotion 後入れを基本とする

## Post-Process Chain

後処理順序は固定。

```text
extend -> upscale -> sound -> speech
```

この順序を変えない。
