# PixVerse Shotpack

## Languages / 言語

多言語切替は [README.md](./README.md) 内に統合しました。

[English](./README.md#en) | [日本語](./README.md#ja) | [中文](./README.md#zh) | [Español](./README.md#es) | [Français](./README.md#fr) | [Deutsch](./README.md#de)

**AI に「こんな動画を作って」と伝えるだけで、企画から完成 MP4 まで自動で進む動画制作パイプラインです。**

## これは何？

PixVerse Shotpack は、自然言語（ふつうの日本語）でやりたいことを伝えると、AI エージェントが以下を自動でやってくれるテンプレートです。

1. あなたの依頼を「企画書」に整理する
2. 企画書をもとに「絵コンテ」を作る
3. AI（PixVerse）で動画素材を生成する
4. 素材を組み合わせて 1 本の MP4 動画に仕上げる

手動でコマンドを打つ必要はありません。エージェントに話しかけるだけで進みます。

## できること / できないこと

このリポジトリは Shotpack 本体です。`git clone` しただけで、外部サービスや別リポジトリまで自動で入るわけではありません。

| やりたいこと | 必要なもの |
|-------------|------------|
| 設定チェック / dry-run | このリポジトリ + `npm install` |
| PixVerse で素材生成 | PixVerse CLI、ログイン、生成クレジット |
| Remotion で MP4 書き出し | このリポジトリの npm 依存 |
| Michibiki / HyperFrames へ引き渡し | 別途 Michibiki を clone / setup |

つまり、Shotpack だけを clone した状態では、PixVerse の生成や Michibiki / HyperFrames 側の動画生成までは完結しません。

## サブエージェントの構造

このパイプラインは、1 人の「監督」と 4 人の「専門スタッフ」で動きます。各ステップの間には、あなたが内容を確認して OK / やり直しを出せる「チェックポイント（Gate）」があります。

```
あなたの依頼（自然言語）
  |
  v
+--------------------------------------------------+
|  Orchestrator（監督）                              |
|  - 全体の進行管理                                  |
|  - チェックポイントであなたに確認を取る              |
|  - 途中で止まっても再開できる                       |
+--------------------------------------------------+
  |
  v
+--------------------------------------------------+
|  Director（演出家）                                |
|  - 依頼内容から「絵コンテ」を作成                   |
|  - カット割り・構図・尺を決める                     |
|  - AI への指示文（プロンプト）を設計                 |
+--------------------------------------------------+
  |
  v  [ Gate 1: 絵コンテ確認 ]
  |    OK / やり直し / 中止
  v
+--------------------------------------------------+
|  Shot Generator（撮影担当）                        |
|  - PixVerse AI で動画クリップを生成                 |
|  - 失敗したカットだけ自動リトライ                   |
|  - クレジット（生成コスト）を管理                   |
+--------------------------------------------------+
  |
  v  [ Gate 1.5: 参照画像確認 ]  ※ i2v モードのみ
  |
  v  [ Gate 2: 生成結果確認 ]
  |    OK / 特定カットだけやり直し / 中止
  v
+--------------------------------------------------+
|  Post-Processor（仕上げ担当）                      |
|  - 尺の延長（extend）                              |
|  - 高解像度化（upscale）                           |
|  - 効果音・ナレーション付与                         |
+--------------------------------------------------+
  |
  v
+--------------------------------------------------+
|  Assembler（編集・納品担当）                        |
|  - 素材を正しい順番に並べる                         |
|  - Remotion が読める形式に変換                      |
|  - コスト報告書・ログを出力                         |
+--------------------------------------------------+
  |
  v
+--------------------------------------------------+
|  Remotion（映像レンダラー）                         |
|  - 最終的な 1 本の MP4 を書き出す                   |
+--------------------------------------------------+
  |
  v
  完成 MP4
```

## 始め方

### 1. リポジトリを取得する

```bash
git clone https://github.com/Takamasa045/pixverse-shotpack.git
cd pixverse-shotpack
```

### 2. 依存パッケージをインストールする

```bash
npm install
```

### 3. PixVerse CLI にログインする

PixVerse CLI は別途インストールが必要です。

```bash
npm install -g pixverse@latest
pixverse auth login
pixverse auth status --json
pixverse account info --json
```

### 4. まず環境診断する

```bash
npm run pipeline:doctor -- --format markdown
```

`doctor` は Node.js、依存パッケージ、PixVerse CLI のバージョン、認証状態、Remotion の有無をまとめて確認します。古い PixVerse CLI が入っている場合は `npm install -g pixverse@latest` を案内します。

### 5. エージェントに話しかける

Claude Code を開いて、自然言語で依頼するだけです。

## 自然言語で使う

Shotpack は「コマンド集」ではなく、エージェントに自然言語で頼んで動かす制作ワークスペースとして使えます。作りたい動画を文章で伝えると、エージェントが `brief.md`、`storyboard.yaml`、`project.yaml`、dry-run、Gate 確認、生成、render までを必要に応じて進めます。

コマンドは、自分で細かく制御したい場合や自動化したい場合の補助です。通常は次のように依頼します。

| やりたいこと | 自然言語での頼み方 |
|-------------|-------------------|
| 最初から動画を作る | 「PixVerse Shotpack で 30 秒のシネマティックなプロモ動画を作って。brief と storyboard を作り、dry-run まで進めて Gate 1 で確認させて」 |
| キャラや場所の一貫性を重視する | 「image-first の i2v で進めて。まず design bible と keyframe を作って、動画生成前に確認を取って」 |
| 既存素材から続きだけ進める | 「今の `dist/` と `manifest.json` を確認して、既存素材から最終 MP4 だけ再 render して」 |
| Michibiki に渡す | 「この Shotpack project を Michibiki 用の VideoSpec に export して、Editframe project を作れる状態にして」 |
| Michibiki 側で編集を続ける | 「Shotpack から Michibiki handoff を実行して、編集 project と preview まで作って。cloud render は使わないで」 |

## Michibiki 連携（オプション）

Shotpack は、制作内容を Michibiki が扱いやすい `VideoSpec` に書き出せます。これはオプション連携です。Michibiki はこのリポジトリに同梱されず、Git submodule でもありません。

Michibiki は、構造化された `VideoSpec` を読み取り、Editframe / HyperFrames / Remotion などの編集 project、preview、render workflow へ変換する別リポジトリの制作ルーターです。このリポジトリでは Shotpack が企画と PixVerse 素材生成を担当し、Michibiki はその計画を受け取って編集・納品側へつなぐ役割です。

### 1. Michibiki を別に用意する

```bash
cd ..
git clone https://github.com/Takamasa045/michibiki.git
cd michibiki
node scripts/setup.mjs
```

### 2. Shotpack から引き渡しファイルを書き出す

```bash
cd ../pixverse-shotpack
./bin/pipeline export --config ./project.yaml --engine editframe
```

このコマンドは PixVerse も Michibiki も呼びません。`dist/video-spec.json` と `dist/michibiki-handoff.json` を作るだけです。

書き出した spec は Michibiki 側から直接読めます。

```bash
cd ../michibiki
pnpm michibiki decide --spec ../pixverse-shotpack/dist/video-spec.json
pnpm michibiki generate --spec ../pixverse-shotpack/dist/video-spec.json --engine editframe
```

Michibiki 側で生成される編集 project、preview、render 成果物は、Michibiki リポジトリ内の `outputs/jobs/<job-id>/` にまとまります。

### 3. Michibiki CLI まで呼びたい場合

```bash
./bin/pipeline export \
  --config ./project.yaml \
  --engine editframe \
  --michibiki-path ../michibiki \
  --run-michibiki
```

これは Michibiki を `pnpm michibiki generate --spec dist/video-spec.json` として実行します。コマンドは Michibiki リポジトリ上で動くため、編集 project、preview、最終 render は Shotpack 内ではなく `../michibiki/outputs/jobs/<job-id>/` に保存されます。最終 MP4 の render は Michibiki 側で確認してから実行してください。クラウド render が必要な場合は、明示的に `--allow-cloud-render` を付けます。

### 出力の使い分け

| 出力 | 用途 |
|------|------|
| `dist/video-spec.json` | Michibiki 互換の企画・尺・scene・asset 情報 |
| `dist/michibiki-handoff.json` | 実行コマンド、Michibiki パス、実行結果の記録 |
| `../michibiki/outputs/jobs/<job-id>/` | Michibiki 側の編集 project、preview、render 成果物 |
| `--engine editframe` | Editframe プロジェクトを作りたい場合 |
| `--engine hyperframes` | HyperFrames 互換プロジェクトを作りたい場合 |
| `--engine remotion` | Remotion 側へ寄せたい場合 |
| `--engine auto` | Michibiki の router に判断させたい場合 |

## 依頼の例

| やりたいこと | エージェントへの言い方 |
|-------------|---------------------|
| まず環境が正しいか確認したい | 「doctor で環境診断して」 |
| まず設定が正しいか確認したい | 「設定を検証して」 |
| どんな計画になるか見たい | 「実行計画を見せて」 |
| AI を呼ばずに事前チェックしたい | 「dry-run して問題があれば直して」 |
| 最初から最後まで全部やってほしい | 「shotpack を生成して MP4 まで仕上げて」 |
| 前に作った素材で動画だけ作り直したい | 「今ある manifest で再 render して」 |
| 編集画面だけ確認したい | 「Remotion を起動して Shotpack を確認して」 |
| Michibiki / HyperFrames に渡したい | 「Michibiki 用に export して」 |

## 2 つの制作モード

| モード | どんなとき使う？ | 説明 |
|--------|----------------|------|
| `t2v`（テキスト→動画） | スピード重視 | テキスト指示だけで素早く動画を生成 |
| `i2v`（画像→動画） | 世界観の統一重視 | まず参照画像を作り、それをベースに動画を生成 |

## 対応モデルの目安

2026-05-28 時点では `pixverse@1.1.10` と PixVerse 公式 docs の C1 / V6 を基準にしています。

| モデル | 使いどころ | 備考 |
|--------|------------|------|
| `v6` | 通常制作、extend、multi-shot | 既定モデル。1-15 秒、最大 1080p |
| `pixverse-c1` | cinematic / action / reference 重視 | 1-15 秒、最大 1080p。公式 API 名 `c1` は CLI 用に `pixverse-c1` へ正規化 |
| `seedance-2.0-standard` | 高品質な third-party 生成 | `1080p` まで validation 対応 |
| `veo-3.1-standard` / `veo-3.1-fast` | Veo 系の比較候補 | `2160p` まで validation 対応 |

完全な制約表は [references/model-constraints.md](./references/model-constraints.md) を見てください。

## 主なファイルの役割

| ファイル / フォルダ | 何が入っている？ |
|--------------------|-----------------|
| `project.yaml` | プロジェクトの全設定（エージェントが読み書きする中心ファイル） |
| `brief.md` | あなたの依頼内容（企画書） |
| `storyboard.yaml` | 絵コンテ（カット割り・プロンプト・尺など） |
| `dist/` | 生成された動画・画像・ログなどの出力先 |
| `dist/manifest.json` | 生成物の一覧表（Remotion が読む） |
| `skills/` | 各スタッフ（サブエージェント）の役割定義 |
| `workflows/` | 制作フローの手順書 |
| `references/` | AI モデルの制約・コスト・エラーコードなどの参考資料 |
| `src/` | Remotion の映像テンプレート |

## 完成物

パイプラインが完了すると、`dist/` フォルダに以下が出力されます。

| ファイル | 内容 |
|---------|------|
| `dist/scene-01.mp4` など | 各カットの動画素材 |
| `dist/vertical/*.mp4` | 縦型（9:16）バージョン |
| `dist/manifest.json` | 全素材の一覧と設定 |
| `dist/credits-report.json` | 使用クレジット（コスト）の報告 |
| `dist/run-log.md` | 実行ログ |
| `dist/renders/*.mp4` | 最終完成動画 |

## 手動で操作したい場合

エージェントに任せず自分でコマンドを打ちたい場合は、以下を使います。

```bash
# パイプライン全体
./bin/pipeline doctor --config ./project.yaml     # 環境診断
./bin/pipeline validate --config ./project.yaml   # 設定チェック
./bin/pipeline plan --config ./project.yaml       # 実行計画作成
./bin/pipeline plan --config ./project.yaml --format markdown  # Gate 用サマリ
./bin/pipeline run --config ./project.yaml --dry-run  # 予行演習
./bin/pipeline run --config ./project.yaml        # 本番実行
./bin/pipeline render --config ./project.yaml     # MP4 書き出し
./bin/pipeline export --config ./project.yaml --engine editframe  # Michibiki 用に書き出し

# Remotion だけ触る場合
npm run start              # プレビュー画面を開く
npm run render:shotpack    # MP4 を書き出す
```

dry-run は PixVerse を呼ばず、`dist/dry-run-plan.json`、`dist/dry-run.md`、`dist/dry-run-manifest.json` を出力します。
`export` は PixVerse を呼ばず、既存の絵コンテと見つかった素材から `dist/video-spec.json` と `dist/michibiki-handoff.json` を出力します。

## もっと詳しく知りたい場合

1. [project.yaml](./project.yaml) - 設定ファイルの実物
2. [SKILL.md](./SKILL.md) - エージェントの詳細仕様
3. [workflows/orchestrator-flow.md](./workflows/orchestrator-flow.md) - 進行管理の詳細
4. [brief.md](./brief.md) / [storyboard.yaml](./storyboard.yaml) - 企画書と絵コンテの実物
