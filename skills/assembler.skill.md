# Assembler Skill

## Responsibility

最終 asset を整理し、Remotion consumer が読む `dist/manifest.json` と `dist/credits-report.json` を構築する。creative 判断も PixVerse CLI も使わない。

## Inputs / Outputs

| 項目 | 内容 |
|------|------|
| 入力 | `dist/shot-*-primary.mp4`, `dist/ref-shot-*.webp`, `storyboard.yaml`, `dist/run-log.md` |
| 出力 | `dist/scene-*.mp4`, `dist/manifest.json`, `dist/credits-report.json`, `dist/run-log.md` |
| 読む参照 | `references/manifest-schema.md` |
| 禁止 | PixVerse CLI 実行、creative 変更 |

## Rules

1. primary asset を storyboard 順で `scene-01.mp4`, `scene-02.mp4` に揃える
2. `9:16` side output は `dist/vertical/` に残し、manifest へ入れない
3. duration は実ファイル長から計算する
4. placeholder audio を必ず `dist/audio/shotpack-placeholder.wav` に置く
5. `credits-report.json` は `run-log.md` 実績から集計する

## Manifest Policy

- 既存 consumer が読む `RenderManifest` 互換を維持する
- scene 単位の `prompt`, `model`, `shot_id` は追加可
- `pipeline_id` などの運用メタデータは manifest に入れない

## Credits Report Minimum Fields

- `pipeline_id`
- `total_credits_consumed`
- `breakdown`
- `per_shot`
- `account_balance_after`

## Validation Checklist

- [ ] `scene-*` が storyboard 順に揃っている
- [ ] manifest の frame 合計が一致する
- [ ] audio placeholder が存在する
- [ ] `credits-report.json` が parse できる
