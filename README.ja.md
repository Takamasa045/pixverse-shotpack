# PixVerse Shotpack

[English README](./README.md)

PixVerse CLI ベースの shotpack ワークフローを、Orchestrator + 4 つのサブエージェント構成で運用するためのドキュメント集です。`brief.md` または `storyboard.yaml` から始めて、Gate 承認を挟みながら `dist/manifest.json` と `dist/credits-report.json` まで整えます。

2026年3月31日時点では、PixVerse ネイティブモデルの既定値を `v6` として扱います。旧 `v5.6` は fallback とし、価格と制約の出典は `references/` に寄せています。

このリポジトリには Remotion project、本体ランタイム、Node ベースの render pipeline は含みません。別の consumer に渡すための素材と、Remotion 互換 manifest を用意する producer 側のワークフローです。

## アーキテクチャ

```text
Orchestrator
  -> Director
  -> Gate 1
  -> Shot Generator
  -> Gate 1.5 (i2v only)
  -> Gate 2
  -> Post-Processor
  -> Assembler
```

責務分離の目的:

- creative 判断と CLI 実行を混ぜない
- クレジット消費前に必ず承認を挟む
- `dist/pipeline-state.json` を使って中断再開できるようにする

## 最初に見るファイル

1. [SKILL.md](./SKILL.md)
2. [workflows/orchestrator-flow.md](./workflows/orchestrator-flow.md)
3. [brief.md](./brief.md) または [storyboard.yaml](./storyboard.yaml)

## ワークフロー選択

| workflow | 用途 | 参照 |
|---------|------|------|
| `t2v` | まず速く作りたい | `workflows/pixverse-shotpack.md` |
| `i2v` | 世界観の統一を優先したい | `workflows/image-first-i2v-pipeline.md` |

## ディレクトリ

| パス | 説明 |
|------|------|
| `skills/` | サブエージェントごとの責務定義 |
| `workflows/` | フェーズごとの実行手順 |
| `references/` | manifest・終了コード・制約・見積もりの参照資料 |
| `examples/` | state / report / log を含むサンプル |
| `dist/` | 生成結果の出力先 |

## 主な出力

- `dist/scene-01.mp4` などの primary asset
- `dist/vertical/*.mp4` の side output
- `dist/audio/shotpack-placeholder.wav`
- `dist/manifest.json`
- `dist/credits-report.json`
- `dist/run-log.md`
- `dist/pipeline-state.json`

## 互換性に関する注意

`dist/manifest.json` は、既存 Remotion consumer が読む `RenderManifest` 互換を維持します。要件定義で欲しい追加の運用情報は `pipeline-state.json` と `credits-report.json` に逃がし、consumer 契約は壊しません。
