# Submission Email Drafts

This file contains ready-to-edit draft emails for PixVerse CLI feedback / skill submission.

## Recommended Subject

English:
- `[CLI Feedback/Skill Submission] Takamasa - PixVerse Shotpack`

Japanese:
- `[CLI Feedback/Skill Submission] Takamasa - PixVerse Shotpack`

## English Draft

Hello Naomi,

I am submitting a reusable PixVerse CLI workflow / skill called **PixVerse Shotpack**.

This project is designed for agent-driven video generation workflows. It is a workflow / skill submission package rather than a standalone app, and it turns a structured `brief.md` or `storyboard.yaml` into a reusable shot pack and a Remotion-compatible `manifest.json`, with practical handling for CLI output, retry logic, aspect-ratio passes, output naming, and downstream composition.

What I think is valuable here:

- PixVerse CLI used as an agent-first interface, not just a one-off prompt tool
- A repeatable structured workflow from brief/storyboard to generated clips
- A standard T2V path as the main workflow, plus an image-first I2V extension for stronger visual consistency
- Output shaped for downstream Remotion-based editing / rendering workflows

The repository includes:

- reusable starter inputs
- neutral examples
- workflow documentation
- a skill spec for agent use

I believe this is a good example of how PixVerse CLI can fit into real production-oriented creator and AI-agent pipelines.

Repository summary:
- Name: PixVerse Shotpack
- Focus: PixVerse CLI + structured workflow + Remotion-compatible output
- Submission type: Skill / workflow submission

If helpful, I can also share follow-up notes on how I would extend this into a broader library of PixVerse CLI skills and standardized generation patterns.

Best,
Takamasa

## Japanese Draft

Naomi 様

PixVerse CLI を使った再利用可能な workflow / skill として、**PixVerse Shotpack** を提出します。

このリポジトリは、単体アプリではなく workflow / skill submission パッケージとして、構造化された `brief.md` または `storyboard.yaml` から、再利用可能なショットパックと Remotion 互換の `manifest.json` を生成することを目的にしています。CLI の `--json` 出力、リトライ方針、アスペクト比ごとの生成、出力命名、下流の動画合成への受け渡しまでを、実運用寄りに整理しています。

今回の提出で特に価値があると考えている点は以下です。

- PixVerse CLI を単発プロンプトではなく、agent-first な interface として使っていること
- brief / storyboard から生成までを、再利用可能な構造化ワークフローにしていること
- 標準の T2V フローを主導線にしつつ、画像先行 I2V の拡張フローも用意していること
- Remotion ベースの編集 / 合成ワークフローに接続しやすい出力形式を用意していること

リポジトリには以下を含めています。

- 汎用スターター入力
- 中立なサンプル
- 実行ワークフロー文書
- エージェント利用向けの skill 定義

PixVerse CLI を、実際の制作ワークフローや AI Agent のパイプラインへ組み込む具体例として、十分に価値がある提出物になっていると考えています。

必要であれば、この skill を起点にした PixVerse CLI 用の派生 skill 群や、標準化した生成パターン案も追加で共有できます。

よろしくお願いいたします。

Takamasa

## Short Pitch

English:
- A reusable PixVerse CLI workflow that turns structured creative inputs into Remotion-ready shot packs.

Japanese:
- 構造化された制作入力を、Remotion で扱いやすい shot pack に変換する、再利用可能な PixVerse CLI workflow です。

## Suggested Attachments / Links

- Repository link
- Short note describing which workflow is the main entrypoint
- Optional sample render or screenshot if you choose to share outputs separately
