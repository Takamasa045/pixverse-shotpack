# PixVerse Shotpack

[English README](./README.md)

PixVerse CLI を使って、`brief.md` や `storyboard.yaml` のような構造化入力から、Remotion で使いやすいショットパックと `manifest.json` を作るための workflow / skill submission パッケージです。

単発案件の成果物ではなく、繰り返し使える skill / workflow submission として整理しています。

## 一言でいうと

企画メモから毎回その場で手順を組み立てるのではなく、PixVerse CLI で安定して動画ショットを作るための再利用可能な型です。

単体アプリや npm パッケージというより、skill 定義、スターター入力、実行手順書をまとめた提出物です。

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

この提出物の主導線です。

まず速く作りたいときに使います。

参照:
- `workflows/pixverse-shotpack.md`

### Image-First I2V

世界観統一を強めたい場合の拡張フローです。

世界観の統一感を優先したいときに使います。先に reference still を作って確認し、その後 PixVerse I2V で動画化します。

参照:
- `workflows/image-first-i2v-pipeline.md`

## 最初に触るファイル

まず試すなら次のどちらかを編集します。

1. `brief.md`
2. `storyboard.yaml`
3. その後は `workflows/pixverse-shotpack.md` から読む
4. 画像先行の派生フローが必要な場合のみ `workflows/image-first-i2v-pipeline.md` を使う

参考サンプル:

- `examples/brief.example.md`
- `examples/storyboard.sample.yaml`
- `examples/manifest.example.json`

## 主なファイル

- `SKILL.md`
  エージェント向けの本体定義
- `EMAIL_FINAL.md`
  そのまま送れる応募メール文面
- `SUBMISSION_CHECKLIST.md`
  repo link 提出 / zip 提出の確認用チェックリスト
- `GITHUB_RELEASE_CHECKLIST.md`
  GitHub 公開前の最終確認用
- `brief.md`
  新規案件用の brief スターター
- `storyboard.yaml`
  新規案件用の storyboard スターター
- `templates/`
  再利用用テンプレート
- `examples/`
  中立なサンプル
- `workflows/`
  実行手順
- `references/`
  manifest 仕様や exit code などの補足
- `SUBMISSION_EMAIL.md`
  応募文の英語版・日本語版

## なぜ PixVerse CLI 向けに意味があるか

これは単なる prompt 集ではありません。
PixVerse CLI を実制作フローに入れる時に必要なものをまとめています。

- 構造化された入力
- 再利用しやすいコマンドパターン
- エージェントで扱いやすい安全なデフォルト
- 予測しやすいファイル命名
- 下流の動画合成システムに渡しやすい出力形式

## 提出時に共有するもの

skill / workflow submission として共有するなら、次を含めます。

- `README.md`
- `README.ja.md`
- `EMAIL_FINAL.md`
- `SUBMISSION_CHECKLIST.md`
- `GITHUB_RELEASE_CHECKLIST.md`
- `SUBMISSION_EMAIL.md`
- `SKILL.md`
- `brief.md`
- `storyboard.yaml`
- `templates/`
- `examples/`
- `workflows/`
- `references/`

`dist/` は含めません。
過去のローカル生成物が入るため、`.gitignore` で除外しています。

## 出力の前提

このワークフローで最終的に想定している出力:

- PixVerse で生成した clips または stills
- 下流 consumer が `manifest.audio.src` を必要とする場合の placeholder audio
- `references/manifest-schema.md` の契約に沿った `dist/manifest.json`

## 重要な前提

- primary 出力は `16:9`
- `9:16` は second pass で追加可能
- PixVerse CLI コマンドは `--json` 前提
- image model 名は固定せず CLI help で確認する
