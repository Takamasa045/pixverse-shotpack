# PixVerse Shotpack

[English README](./README.md)

このリポジトリは `project.yaml` を正本にした、PixVerse から Remotion までの一気通貫パイプラインです。自然言語の依頼を `project.yaml` / `brief.md` / `storyboard.yaml` に正規化し、検証、計画、dry run、アセット生成または取り込み、`dist/manifest.json` 構築、最終 MP4 render まで同じ repo で回せます。

2026年3月31日時点では、PixVerse ネイティブモデルの既定値を `v6` として扱います。旧 `v5.6` は fallback とし、価格と制約の出典は `references/` に寄せています。

契約の正本は引き続き `dist/manifest.json` ですが、同じ repo に producer 側のワークフロー、CLI、Remotion consumer を同居させています。

## クイックスタート

1. まずこのリポジトリを clone します。

   ```bash
   git clone https://github.com/Takamasa045/pixverse-shotpack.git
   cd pixverse-shotpack
   ```

2. Remotion finisher 用の依存を入れます。

   ```bash
   npm install
   ```

3. PixVerse CLI はこのリポジトリの外で、事前にインストールしておきます。
4. 実行前に認証状態とアカウント情報を確認します。

   ```bash
   pixverse auth login
   pixverse auth status --json
   pixverse account info --json
   ```

5. エージェントに自然言語で依頼します。これがこのテンプレートの基本運用です。

   依頼例:

   - 「`brief.md` と `storyboard.yaml` を見て、`project.yaml` を整えて」
   - 「この repo の設定を検証して、実行計画を見せて」
   - 「dry-run して、問題があれば直して」
   - 「PixVerse 生成から render まで最後まで進めて」
   - 「consumer 側だけ見たいので Remotion を起動して」

6. エージェントは必要に応じて `project.yaml`、`brief.md`、`storyboard.yaml` を更新し、検証、計画、dry-run、本実行、render まで進めます。

まだ `dist/manifest.json` が無い場合は、`public/shotpack-sample/manifest.json` の軽量スターター manifest で起動します。重いサンプル media はテンプレに含めません。

## エージェントへの依頼例

| やりたいこと | 自然言語の依頼例 |
|---------|------|
| 設定の整合性確認 | 「`project.yaml` と `storyboard.yaml` を検証して」 |
| 実行計画の確認 | 「この設定で実行計画を出して」 |
| PixVerse を呼ばずに確認 | 「dry-run で manifest と計画だけ作って」 |
| 本番実行 | 「shotpack を生成して render まで進めて」 |
| 既存 manifest から再 render | 「今ある manifest で再 render して」 |
| consumer だけ触る | 「Remotion consumer を起動して `Shotpack` を確認して」 |

## 手動コマンド

エージェントを使わずに自分で叩く場合だけ、次を使います。

```bash
./bin/pipeline validate --config ./project.yaml
./bin/pipeline plan --config ./project.yaml
./bin/pipeline run --config ./project.yaml --dry-run
./bin/pipeline run --config ./project.yaml
./bin/pipeline render --config ./project.yaml
```

consumer 側だけ手動で触る場合:

```bash
npm run prepare:assets
npm run start
npm run render:3d-linked
npm run render:shotpack
```

npm script 版は `npm run pipeline:validate -- --config ./project.yaml`、`npm run pipeline:plan -- --config ./project.yaml`、`npm run pipeline:run -- --config ./project.yaml`、`npm run pipeline:render -- --config ./project.yaml` です。

## project.yaml

`project.yaml` はエージェントが読む主設定です。通常は自然言語の依頼をもとに、必要な変更をエージェントがこのファイルへ反映します。現在の schema は次のトップレベルで構成しています。

- `project`: slug、title、date、version
- `inputs`: `brief.md` と `storyboard.yaml` のパス
- `assets`: `local` または `pixverse`、コピー元パターン、音声パス
- `generation`: workflow、model、quality、aspect ratio、必要なら静止画生成設定
- `render`: composition、fps、サイズ、最終 MP4 出力先
- `theme`: built-in finisher に渡す配色
- `manifest`: `dist/manifest.json` に畳み込む text / edit policy

運用モードは 2 つです。

- `assets.mode: local`: 既存 asset を source directory から `dist/` に staging して render
- `assets.mode: pixverse`: PixVerse CLI で静止画や動画を生成し、`dist/` に保存してから render

## アーキテクチャ

```text
Natural language request
  -> project.yaml
  -> validate
  -> plan
  -> run --dry-run
  -> run
  -> render
```

内部の producer 実行は引き続き次の責務分離で組みます。

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

この構成の目的:

- `project.yaml` を単一の checked-in 実行契約にする
- creative 判断と CLI 実行を混ぜない
- `dist/pipeline-state.json` を使って中断再開できるようにする
- manifest 契約は維持したまま、同じ repo に Remotion finisher を同居させる

## 最初に見るファイル

1. [project.yaml](./project.yaml)
2. [SKILL.md](./SKILL.md)
3. [workflows/orchestrator-flow.md](./workflows/orchestrator-flow.md)
4. [brief.md](./brief.md) と [storyboard.yaml](./storyboard.yaml)

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
| `src/` | Remotion consumer composition |
| `scripts/` | asset 準備とローカル音声生成 |
| `public/` | 軽量スターター manifest と runtime 同期先 |

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

## ローカル Consumer

- `LinkedParticles` は 3D の単体確認用 composition です。
- `Shotpack` は manifest 駆動の汎用 finisher composition です。
- `scripts/prepare-public-assets.mjs` は、`dist/manifest.json` があるときだけ参照 asset を `public/shotpack-sample/` に同期します。
- テンプレートには大きいサンプル動画や `nakaima` media pack を同梱しません。`assets.mode: local` を使う場合は、自前 asset を `public/shotpack-sample/` に置いてください。
