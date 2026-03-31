# Credit Estimation Reference

Gate 1 の判断に使う見積もり表。V6 / V5.6 / post-process の数値は、2026-03-31 時点で公開されている公式 pricing を優先している。image generation だけは現行の公開表が薄いため provisional 扱いにする。

## Planning Baseline

| フェーズ | モデル / 処理 | 条件 | 見積もり |
|---------|---------------|------|---------|
| shot generation | `v6` | 360p / no audio | `5 cr / sec` |
| shot generation | `v6` | 540p / no audio | `7 cr / sec` |
| shot generation | `v6` | 720p / no audio | `9 cr / sec` |
| shot generation | `v6` | 1080p / no audio | `18 cr / sec` |
| shot generation | `v6` | 360p / with audio | `7 cr / sec` |
| shot generation | `v6` | 540p / with audio | `9 cr / sec` |
| shot generation | `v6` | 720p / with audio | `12 cr / sec` |
| shot generation | `v6` | 1080p / with audio | `23 cr / sec` |
| shot generation | `v5.6` | 720p / 5s / no audio | `45 cr` |
| shot generation | `v5.6` | 720p / 5s / with audio | `80 cr` |
| shot generation | `v5.6` | 1080p / 5s / no audio | `75 cr` |
| shot generation | `v5.6` | 1080p / 5s / with audio | `150 cr` |
| image generation | `seedream-5.0-lite` | 1800p / 16:9 | provisional `1 cr / image` |
| post-processing | `extend` | `v6` | 元の quality / audio 条件の `per-second` 課金 |
| post-processing | `sound` | sound effect | `2 cr / sec` |
| post-processing | `speech` | lip sync | `4 cr / sec` |
| post-processing | `upscale` | 1 asset | official public table not yet published |

## Estimation Formula

### wide pass

```text
wide_estimate = sum(
  duration_sec * per_second_rate(model, quality, audio)
)
```

`v5.6` を使う shot だけは fixed table を優先してよい。

### i2v reference stills

```text
image_estimate = generated_reference_count * provisional_image_rate
```

### post process

```text
post_estimate = extend + upscale + sound + speech
```

### display budget

Gate 1 では次を提示する。

```text
display_estimate = wide_estimate + image_estimate + post_estimate
warning_threshold = account_balance * 0.8
```

## Warning Rules

- `display_estimate > balance * 0.8`: `credit_warning`
- `display_estimate > balance`: `credit_insufficient`
- 並列投入前に全 shot 分の wide pass 予算が確保できていること

## Source Notes

- V6 pricing: PixVerse Platform `Model & Pricing`
- V5.6 pricing: 同ページ
- sound / lip sync pricing: 同ページ
- image generation pricing: 2026-03-31 時点で public pricing table 未確認

## Calibration Rule

実行後は必ず `credits-report.json` の実績と比較し、差が大きいモデルだけこの表を修正する。
