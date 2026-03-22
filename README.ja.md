# PixVerse Shotpack

[English README](./README.md)

PixVerse CLI を使って、`brief.md` や `storyboard.yaml` のような構造化入力から、Remotion で使いやすいショットパックと `manifest.json` を作るための再利用可能なワークフローです。

## 一言でいうと

企画メモから毎回その場で手順を組み立てるのではなく、PixVerse CLI で安定して動画ショットを作るための再利用可能な型です。

## できること

- 汎用の `brief.md` スターターを使える
- 汎用の `storyboard.yaml` スターターを使える
- エージェント向けの skill 定義を `SKILL.md` で使える
- T2V の標準フローを使える
- 画像先行 I2V の標準フローを使える
- 中立なサンプル入力と manifest 例を参照できる

## 全体の流れ

1. `brief.md` または `storyboard.yaml` を用意する
2. PixVerse CLI でショットを生成する
3. 出力ファイルを一定ルールで整理する
4. 下流の Remotion consumer 用に `manifest.json` を作る

つまり:

`brief.md` -> `storyboard.yaml` -> PixVerse CLI -> `manifest.json`

## どのワークフローを使うか

### T2V Shotpack

まず速く作りたいときに使います。

参照: `workflows/pixverse-shotpack.md`

### Image-First I2V

世界観の統一感を優先したいときに使います。先に reference still を作って確認し、その後 PixVerse I2V で動画化します。

参照: `workflows/image-first-i2v-pipeline.md`

## 最初に触るファイル

1. `brief.md` を開いてプレースホルダを埋める
2. または `storyboard.yaml` を直接編集する
3. `workflows/pixverse-shotpack.md` に沿って実行する
4. 画像先行の派生フローが必要な場合のみ `workflows/image-first-i2v-pipeline.md` を使う

参考サンプル:

- `examples/brief.example.md`
- `examples/storyboard.sample.yaml`
- `examples/manifest.example.json`

## 主なファイル

| ファイル | 説明 |
|---------|------|
| `SKILL.md` | エージェント向けの skill 定義 |
| `brief.md` | 新規案件用の brief スターター |
| `storyboard.yaml` | 新規案件用の storyboard スターター |
| `examples/` | 中立なサンプル |
| `workflows/` | 実行手順 |
| `references/` | manifest 仕様や exit code の補足 |

## 出力

このワークフローで生成されるもの:

- PixVerse で生成した clips / stills（`dist/` に配置）
- 下流 consumer が `manifest.audio.src` を必要とする場合の placeholder audio
- `references/manifest-schema.md` の仕様に沿った `dist/manifest.json`

## 前提

- primary 出力は `16:9`
- `9:16` は second pass で追加可能
- PixVerse CLI コマンドは `--json` 前提
- image model 名は固定せず CLI help で確認する
