# PixVerse Shotpack

## Language Switch

[English](#en) | [日本語](#ja) | [中文](#zh) | [Español](#es) | [Français](#fr) | [Deutsch](#de)

This README contains the full onboarding and command guide in each language. Commands, file names, and engine names stay in their original spelling so they can be copied directly.

<a id="en"></a>
## English

**Tell an AI agent "make me a video like this" and it handles everything from planning to final MP4.**

### What Is This?

PixVerse Shotpack is an agent-operated video production template. Describe a video in plain language, and the agent turns that request into `brief.md`, `storyboard.yaml`, and `project.yaml`, then drives PixVerse and Remotion to produce a final MP4.

The pipeline can:

1. Convert your request into a structured brief.
2. Create a shot-by-shot storyboard.
3. Generate video clips with PixVerse.
4. Build a Remotion-readable manifest.
5. Render the final video.

### What It Does / Does Not Include

This repository is the Shotpack pipeline itself. Cloning it does not automatically install external services or separate repositories.

| Goal | Requirement |
|------|-------------|
| Config checks / dry runs | This repo + `npm install` |
| PixVerse asset generation | PixVerse CLI, auth, and credits |
| Remotion MP4 rendering | This repo's npm dependencies |
| Michibiki / HyperFrames handoff | A separate Michibiki clone/setup |

Shotpack alone is enough to plan, validate, dry-run, and render local assets. PixVerse generation and Michibiki continuation require their own setup.

### How The Agents Work

The pipeline behaves like a small film crew with approval gates:

1. **Orchestrator** manages the full flow and asks for approval at checkpoints.
2. **Director** turns the brief into a storyboard, shot timing, framing, and prompts.
3. **Shot Generator** calls PixVerse, retries failed shots, and tracks credit usage.
4. **Post-Processor** can extend, upscale, add sound, or add narration.
5. **Assembler** orders clips, builds the Remotion manifest, and writes reports.
6. **Remotion** renders the final MP4.

Gate 1 checks the storyboard. Gate 1.5 checks reference images for image-to-video workflows. Gate 2 checks generated shots before final assembly.

### Getting Started

```bash
git clone https://github.com/Takamasa045/pixverse-shotpack.git
cd pixverse-shotpack
npm install
```

PixVerse CLI is installed separately:

```bash
npm install -g pixverse@latest
pixverse auth login
pixverse auth status --json
pixverse account info --json
```

Run the environment doctor:

```bash
npm run pipeline:doctor -- --format markdown
```

`doctor` checks Node.js, dependencies, PixVerse CLI version, auth status, account access, and the local Remotion binary.

### Natural-Language First Usage

The normal entry point is not a command. Ask the agent in natural language:

| Goal | Request |
|------|---------|
| Build from scratch | "Use PixVerse Shotpack to make a 30-second cinematic promo. Create the brief and storyboard, dry-run it, and stop at Gate 1." |
| Keep characters or locations consistent | "Use the image-first i2v flow. Build the design bible and keyframes first, then ask me before video generation." |
| Continue from existing clips | "Inspect `dist/` and `manifest.json`, then re-render the final MP4 from the existing assets." |
| Hand off to Michibiki | "Export this Shotpack project to Michibiki as a VideoSpec and prepare an Editframe project." |

Commands are still available when you want direct control or automation.

### Michibiki Integration

Shotpack can export a Michibiki-friendly `VideoSpec`. Michibiki is a separate video-production router that can turn the exported spec into Editframe, HyperFrames, or Remotion project workflows.

Set up Michibiki separately:

```bash
cd ..
git clone https://github.com/Takamasa045/michibiki.git
cd michibiki
node scripts/setup.mjs
```

Export from Shotpack:

```bash
cd ../pixverse-shotpack
./bin/pipeline export --config ./project.yaml --engine editframe
```

This writes `dist/video-spec.json` and `dist/michibiki-handoff.json` without calling PixVerse or Michibiki.

Run Michibiki directly:

```bash
cd ../michibiki
pnpm michibiki decide --spec ../pixverse-shotpack/dist/video-spec.json
pnpm michibiki generate --spec ../pixverse-shotpack/dist/video-spec.json --engine editframe
```

Or invoke it through Shotpack:

```bash
./bin/pipeline export \
  --config ./project.yaml \
  --engine editframe \
  --michibiki-path ../michibiki \
  --run-michibiki
```

Michibiki outputs live under `../michibiki/outputs/jobs/<job-id>/`, not inside Shotpack.

### Production Modes

| Mode | Use it when | Description |
|------|-------------|-------------|
| `t2v` | Speed matters most | Generate clips directly from text prompts |
| `i2v` | Visual consistency matters most | Generate reference images first, then animate them |

### Supported Model Baseline

As of 2026-05-28, this repo targets `pixverse@1.1.10` and current PixVerse C1 / V6 platform docs.

| Model | Use it for | Notes |
|-------|------------|-------|
| `v6` | Default production, extend, multi-shot | 1-15s, up to 1080p |
| `pixverse-c1` | Cinematic, action, reference-heavy generation | 1-15s, up to 1080p. API name `c1` is normalized to `pixverse-c1` |
| `seedance-2.0-standard` | Higher-quality third-party generation | Validation supports up to `1080p` |
| `veo-3.1-standard` / `veo-3.1-fast` | Veo comparison runs | Validation supports up to `2160p` |

See [`references/model-constraints.md`](./references/model-constraints.md) for the full table.

### Key Files And Outputs

| File / Folder | Purpose |
|---------------|---------|
| `project.yaml` | Main config read and updated by the agent |
| `brief.md` | Creative brief |
| `storyboard.yaml` | Shot breakdown, prompts, duration, framing |
| `dist/` | Generated videos, images, reports, and logs |
| `dist/manifest.json` | Asset inventory consumed by Remotion |
| `dist/credits-report.json` | Credit usage report |
| `dist/run-log.md` | Execution log |
| `dist/renders/*.mp4` | Final rendered videos |
| `skills/` | Sub-agent role definitions |
| `workflows/` | Phase runbooks |
| `references/` | Model limits, credit estimates, error contracts |
| `src/` | Remotion compositions |

### Manual Commands

```bash
./bin/pipeline doctor --config ./project.yaml
./bin/pipeline validate --config ./project.yaml
./bin/pipeline plan --config ./project.yaml
./bin/pipeline plan --config ./project.yaml --format markdown
./bin/pipeline run --config ./project.yaml --dry-run
./bin/pipeline run --config ./project.yaml
./bin/pipeline render --config ./project.yaml
./bin/pipeline export --config ./project.yaml --engine editframe

npm run start
npm run render:shotpack
```

Dry runs do not call PixVerse. `export` writes Michibiki handoff files without generating assets.

### Learn More

1. [`project.yaml`](./project.yaml)
2. [`SKILL.md`](./SKILL.md)
3. [`workflows/orchestrator-flow.md`](./workflows/orchestrator-flow.md)
4. [`brief.md`](./brief.md) / [`storyboard.yaml`](./storyboard.yaml)

<a id="ja"></a>
## 日本語

**AI エージェントに「こんな動画を作って」と伝えるだけで、企画から完成 MP4 まで進める制作パイプラインです。**

### これは何？

PixVerse Shotpack は、AI エージェントに自然言語で依頼して動画を作るためのテンプレートです。作りたい動画を文章で伝えると、エージェントが `brief.md`、`storyboard.yaml`、`project.yaml` に整理し、PixVerse と Remotion を使って最終 MP4 まで進めます。

このパイプラインでできること:

1. 依頼を構造化された企画書に変換する。
2. ショット単位の絵コンテを作る。
3. PixVerse で動画クリップを生成する。
4. Remotion が読める manifest を作る。
5. 最終動画を書き出す。

### できること / できないこと

このリポジトリは Shotpack 本体です。clone しただけで外部サービスや別リポジトリまで自動で入るわけではありません。

| やりたいこと | 必要なもの |
|-------------|------------|
| 設定チェック / dry-run | この repo + `npm install` |
| PixVerse で素材生成 | PixVerse CLI、ログイン、生成クレジット |
| Remotion で MP4 書き出し | この repo の npm 依存 |
| Michibiki / HyperFrames への引き渡し | 別途 Michibiki を clone / setup |

Shotpack だけでも計画、検証、dry-run、ローカル素材の render はできます。PixVerse 生成や Michibiki での続きの編集には、それぞれのセットアップが必要です。

### エージェントの動き方

このパイプラインは、小さな映像制作チームのように動きます。

1. **Orchestrator** が全体を進行し、チェックポイントで確認を取る。
2. **Director** が企画を絵コンテ、尺、構図、プロンプトに落とす。
3. **Shot Generator** が PixVerse を呼び、失敗カットを再試行し、クレジットを記録する。
4. **Post-Processor** が extend、upscale、効果音、ナレーションなどを担当する。
5. **Assembler** がクリップを並べ、Remotion manifest とレポートを作る。
6. **Remotion** が最終 MP4 を render する。

Gate 1 では絵コンテを確認します。Gate 1.5 は image-to-video の参照画像確認です。Gate 2 では生成されたショットを確認します。

### 始め方

```bash
git clone https://github.com/Takamasa045/pixverse-shotpack.git
cd pixverse-shotpack
npm install
```

PixVerse CLI は別途インストールします。

```bash
npm install -g pixverse@latest
pixverse auth login
pixverse auth status --json
pixverse account info --json
```

環境診断を実行します。

```bash
npm run pipeline:doctor -- --format markdown
```

`doctor` は Node.js、依存パッケージ、PixVerse CLI のバージョン、認証状態、アカウントアクセス、ローカル Remotion binary を確認します。

### 自然言語で使う

通常の入口はコマンドではありません。エージェントに自然言語で頼みます。

| やりたいこと | 頼み方 |
|-------------|--------|
| 最初から作る | 「PixVerse Shotpack で 30 秒のシネマティックなプロモ動画を作って。brief と storyboard を作り、dry-run まで進めて Gate 1 で確認させて」 |
| キャラや場所を揃える | 「image-first の i2v で進めて。まず design bible と keyframe を作り、動画生成前に確認を取って」 |
| 既存素材から続ける | 「`dist/` と `manifest.json` を確認して、既存素材から最終 MP4 だけ再 render して」 |
| Michibiki に渡す | 「この Shotpack project を Michibiki 用の VideoSpec に export して、Editframe project を作れる状態にして」 |

細かく制御したい場合や自動化したい場合は、手動コマンドも使えます。

### Michibiki 連携

Shotpack は Michibiki が扱いやすい `VideoSpec` を書き出せます。Michibiki は別リポジトリの動画制作ルーターで、書き出した spec を Editframe、HyperFrames、Remotion の project workflow へつなげます。

Michibiki は別にセットアップします。

```bash
cd ..
git clone https://github.com/Takamasa045/michibiki.git
cd michibiki
node scripts/setup.mjs
```

Shotpack から export します。

```bash
cd ../pixverse-shotpack
./bin/pipeline export --config ./project.yaml --engine editframe
```

このコマンドは PixVerse も Michibiki も呼びません。`dist/video-spec.json` と `dist/michibiki-handoff.json` を書き出すだけです。

Michibiki 側から直接読むこともできます。

```bash
cd ../michibiki
pnpm michibiki decide --spec ../pixverse-shotpack/dist/video-spec.json
pnpm michibiki generate --spec ../pixverse-shotpack/dist/video-spec.json --engine editframe
```

Shotpack から Michibiki を呼び出す場合:

```bash
./bin/pipeline export \
  --config ./project.yaml \
  --engine editframe \
  --michibiki-path ../michibiki \
  --run-michibiki
```

Michibiki の出力は Shotpack 内ではなく `../michibiki/outputs/jobs/<job-id>/` に保存されます。

### 制作モード

| モード | 使う場面 | 説明 |
|--------|----------|------|
| `t2v` | 速さ重視 | テキストプロンプトから直接クリップを作る |
| `i2v` | 見た目の一貫性重視 | 参照画像を先に作り、それを動画化する |

### 対応モデルの目安

2026-05-28 時点では `pixverse@1.1.10` と PixVerse C1 / V6 の docs を基準にしています。

| モデル | 使いどころ | 備考 |
|--------|------------|------|
| `v6` | 通常制作、extend、multi-shot | 1-15 秒、最大 1080p |
| `pixverse-c1` | cinematic / action / reference 重視 | 1-15 秒、最大 1080p。API 名 `c1` は `pixverse-c1` に正規化 |
| `seedance-2.0-standard` | 高品質な third-party 生成 | validation は `1080p` まで対応 |
| `veo-3.1-standard` / `veo-3.1-fast` | Veo 比較 | validation は `2160p` まで対応 |

完全な表は [`references/model-constraints.md`](./references/model-constraints.md) を見てください。

### 主なファイルと出力

| ファイル / フォルダ | 役割 |
|--------------------|------|
| `project.yaml` | エージェントが読む中心設定 |
| `brief.md` | 企画書 |
| `storyboard.yaml` | カット割り、プロンプト、尺、構図 |
| `dist/` | 生成動画、画像、レポート、ログ |
| `dist/manifest.json` | Remotion が読む素材一覧 |
| `dist/credits-report.json` | クレジット使用レポート |
| `dist/run-log.md` | 実行ログ |
| `dist/renders/*.mp4` | 最終 render 動画 |
| `skills/` | サブエージェントの役割定義 |
| `workflows/` | 各フェーズの runbook |
| `references/` | モデル制約、クレジット見積もり、エラー契約 |
| `src/` | Remotion composition |

### 手動コマンド

```bash
./bin/pipeline doctor --config ./project.yaml
./bin/pipeline validate --config ./project.yaml
./bin/pipeline plan --config ./project.yaml
./bin/pipeline plan --config ./project.yaml --format markdown
./bin/pipeline run --config ./project.yaml --dry-run
./bin/pipeline run --config ./project.yaml
./bin/pipeline render --config ./project.yaml
./bin/pipeline export --config ./project.yaml --engine editframe

npm run start
npm run render:shotpack
```

dry-run は PixVerse を呼びません。`export` は素材生成をせず Michibiki handoff ファイルを書き出します。

### もっと詳しく

1. [`project.yaml`](./project.yaml)
2. [`SKILL.md`](./SKILL.md)
3. [`workflows/orchestrator-flow.md`](./workflows/orchestrator-flow.md)
4. [`brief.md`](./brief.md) / [`storyboard.yaml`](./storyboard.yaml)

<a id="zh"></a>
## 中文

**只要告诉 AI 代理“我想做这样的视频”，它就能从策划推进到最终 MP4。**

### 这是什么？

PixVerse Shotpack 是一个由 AI 代理操作的视频制作模板。你用自然语言描述想做的视频，代理会把请求整理成 `brief.md`、`storyboard.yaml`、`project.yaml`，然后使用 PixVerse 和 Remotion 输出最终 MP4。

这个流程可以：

1. 把请求转换成结构化 brief。
2. 创建逐镜头 storyboard。
3. 使用 PixVerse 生成视频片段。
4. 构建 Remotion 可读取的 manifest。
5. 渲染最终视频。

### 包含什么 / 不包含什么

这个仓库是 Shotpack 流水线本体。clone 仓库不会自动安装外部服务或其他仓库。

| 目标 | 需要 |
|------|------|
| 配置检查 / dry-run | 本仓库 + `npm install` |
| PixVerse 素材生成 | PixVerse CLI、登录、生成 credits |
| Remotion MP4 渲染 | 本仓库的 npm 依赖 |
| Michibiki / HyperFrames 交接 | 单独 clone / setup Michibiki |

Shotpack 本身可以做计划、验证、dry-run 和本地素材 render。PixVerse 生成与 Michibiki 后续编辑需要单独设置。

### 代理如何工作

这个流水线像一个小型电影团队：

1. **Orchestrator** 管理整体流程，并在 checkpoint 请求确认。
2. **Director** 把 brief 转换为 storyboard、时长、构图和 prompts。
3. **Shot Generator** 调用 PixVerse，重试失败镜头，并记录 credit 用量。
4. **Post-Processor** 处理 extend、upscale、音效和旁白。
5. **Assembler** 排列 clips，生成 Remotion manifest 和报告。
6. **Remotion** 渲染最终 MP4。

Gate 1 审核 storyboard。Gate 1.5 用于 i2v 的参考图确认。Gate 2 审核已生成的镜头。

### 开始使用

```bash
git clone https://github.com/Takamasa045/pixverse-shotpack.git
cd pixverse-shotpack
npm install
```

PixVerse CLI 需要单独安装：

```bash
npm install -g pixverse@latest
pixverse auth login
pixverse auth status --json
pixverse account info --json
```

运行环境检查：

```bash
npm run pipeline:doctor -- --format markdown
```

`doctor` 会检查 Node.js、依赖、PixVerse CLI 版本、认证状态、账户访问和本地 Remotion binary。

### 自然语言优先

通常入口不是命令，而是自然语言请求：

| 目标 | 请求示例 |
|------|----------|
| 从零开始制作 | "用 PixVerse Shotpack 制作一个 30 秒的电影感宣传视频。先创建 brief 和 storyboard，执行 dry-run，并在 Gate 1 停下来让我确认。" |
| 保持角色或地点一致 | "使用 image-first 的 i2v 流程。先建立 design bible 和 keyframe，在视频生成前让我确认。" |
| 使用已有片段继续 | "检查 `dist/` 和 `manifest.json`，然后用现有素材重新渲染最终 MP4。" |
| 交接给 Michibiki | "把这个 Shotpack project 导出为 Michibiki 用的 VideoSpec，并准备一个 Editframe project。" |

需要直接控制或自动化时，也可以使用命令。

### Michibiki 集成

Shotpack 可以导出 Michibiki 友好的 `VideoSpec`。Michibiki 是独立的视频制作路由器，可以把该 spec 转为 Editframe、HyperFrames 或 Remotion 的 project workflow。

单独设置 Michibiki：

```bash
cd ..
git clone https://github.com/Takamasa045/michibiki.git
cd michibiki
node scripts/setup.mjs
```

从 Shotpack 导出：

```bash
cd ../pixverse-shotpack
./bin/pipeline export --config ./project.yaml --engine editframe
```

该命令不会调用 PixVerse 或 Michibiki，只写入 `dist/video-spec.json` 和 `dist/michibiki-handoff.json`。

也可以在 Michibiki 中直接读取：

```bash
cd ../michibiki
pnpm michibiki decide --spec ../pixverse-shotpack/dist/video-spec.json
pnpm michibiki generate --spec ../pixverse-shotpack/dist/video-spec.json --engine editframe
```

从 Shotpack 调用 Michibiki：

```bash
./bin/pipeline export \
  --config ./project.yaml \
  --engine editframe \
  --michibiki-path ../michibiki \
  --run-michibiki
```

Michibiki 的输出保存在 `../michibiki/outputs/jobs/<job-id>/`，不在 Shotpack 内。

### 制作模式

| 模式 | 适用场景 | 说明 |
|------|----------|------|
| `t2v` | 更重视速度 | 直接从文本 prompt 生成 clips |
| `i2v` | 更重视视觉一致性 | 先生成参考图，再动画化 |

### 模型基线

截至 2026-05-28，本仓库以 `pixverse@1.1.10` 和 PixVerse C1 / V6 文档为基准。

| 模型 | 用途 | 备注 |
|------|------|------|
| `v6` | 默认制作、extend、multi-shot | 1-15 秒，最高 1080p |
| `pixverse-c1` | cinematic / action / reference-heavy 生成 | 1-15 秒，最高 1080p。API 名 `c1` 会标准化为 `pixverse-c1` |
| `seedance-2.0-standard` | 高质量 third-party 生成 | validation 支持到 `1080p` |
| `veo-3.1-standard` / `veo-3.1-fast` | Veo 对比运行 | validation 支持到 `2160p` |

完整表格见 [`references/model-constraints.md`](./references/model-constraints.md)。

### 主要文件与输出

| 文件 / 文件夹 | 用途 |
|---------------|------|
| `project.yaml` | 代理读取和更新的主配置 |
| `brief.md` | 创意 brief |
| `storyboard.yaml` | 镜头拆分、prompt、时长、构图 |
| `dist/` | 生成视频、图片、报告和日志 |
| `dist/manifest.json` | Remotion 使用的素材清单 |
| `dist/credits-report.json` | credit 使用报告 |
| `dist/run-log.md` | 执行日志 |
| `dist/renders/*.mp4` | 最终渲染视频 |
| `skills/` | 子代理角色定义 |
| `workflows/` | 各阶段 runbook |
| `references/` | 模型限制、credit 估算、错误契约 |
| `src/` | Remotion compositions |

### 手动命令

```bash
./bin/pipeline doctor --config ./project.yaml
./bin/pipeline validate --config ./project.yaml
./bin/pipeline plan --config ./project.yaml
./bin/pipeline plan --config ./project.yaml --format markdown
./bin/pipeline run --config ./project.yaml --dry-run
./bin/pipeline run --config ./project.yaml
./bin/pipeline render --config ./project.yaml
./bin/pipeline export --config ./project.yaml --engine editframe

npm run start
npm run render:shotpack
```

dry-run 不会调用 PixVerse。`export` 不生成素材，只写出 Michibiki handoff 文件。

### 了解更多

1. [`project.yaml`](./project.yaml)
2. [`SKILL.md`](./SKILL.md)
3. [`workflows/orchestrator-flow.md`](./workflows/orchestrator-flow.md)
4. [`brief.md`](./brief.md) / [`storyboard.yaml`](./storyboard.yaml)

<a id="es"></a>
## Español

**Dile a un agente de IA "hazme un video como este" y Shotpack lo lleva desde la planificación hasta el MP4 final.**

### Qué es

PixVerse Shotpack es una plantilla de producción de video operada por agentes. Describe el video en lenguaje natural, y el agente convierte la solicitud en `brief.md`, `storyboard.yaml` y `project.yaml`; después usa PixVerse y Remotion para producir el MP4 final.

El pipeline puede:

1. Convertir tu solicitud en un brief estructurado.
2. Crear un storyboard plano por plano.
3. Generar clips de video con PixVerse.
4. Crear un manifest legible por Remotion.
5. Renderizar el video final.

### Qué incluye / qué no incluye

Este repositorio es el pipeline Shotpack. Clonarlo no instala automáticamente servicios externos ni otros repositorios.

| Objetivo | Requisito |
|----------|-----------|
| Config checks / dry runs | Este repo + `npm install` |
| Generación de assets PixVerse | PixVerse CLI, autenticación y créditos |
| Render MP4 con Remotion | Dependencias npm de este repo |
| Handoff a Michibiki / HyperFrames | Clon/setup separado de Michibiki |

Shotpack puede planificar, validar, hacer dry-run y renderizar assets locales. La generación PixVerse y la continuación con Michibiki requieren configuración propia.

### Cómo trabajan los agentes

El pipeline funciona como un pequeño equipo de producción:

1. **Orchestrator** gestiona el flujo completo y pide aprobación en checkpoints.
2. **Director** transforma el brief en storyboard, timing, encuadre y prompts.
3. **Shot Generator** llama a PixVerse, reintenta shots fallidos y registra créditos.
4. **Post-Processor** puede extender, reescalar, añadir sonido o narración.
5. **Assembler** ordena clips, crea el manifest de Remotion y escribe reportes.
6. **Remotion** renderiza el MP4 final.

Gate 1 revisa el storyboard. Gate 1.5 revisa imágenes de referencia para i2v. Gate 2 revisa los shots generados.

### Primeros pasos

```bash
git clone https://github.com/Takamasa045/pixverse-shotpack.git
cd pixverse-shotpack
npm install
```

PixVerse CLI se instala por separado:

```bash
npm install -g pixverse@latest
pixverse auth login
pixverse auth status --json
pixverse account info --json
```

Ejecuta el diagnóstico:

```bash
npm run pipeline:doctor -- --format markdown
```

`doctor` comprueba Node.js, dependencias, versión de PixVerse CLI, autenticación, acceso de cuenta y el binario local de Remotion.

### Uso natural-language first

La entrada normal no es un comando. Pídeselo al agente en lenguaje natural:

| Objetivo | Solicitud |
|----------|-----------|
| Crear desde cero | "Usa PixVerse Shotpack para crear un promo cinematográfico de 30 segundos. Crea el brief y el storyboard, ejecuta el dry-run y detente en Gate 1." |
| Mantener personajes o lugares consistentes | "Usa el flujo image-first i2v. Primero crea el design bible y los keyframes, y pregúntame antes de generar video." |
| Continuar desde clips existentes | "Revisa `dist/` y `manifest.json`, y vuelve a renderizar el MP4 final con los assets existentes." |
| Enviar a Michibiki | "Exporta este proyecto Shotpack a Michibiki como VideoSpec y prepara un proyecto Editframe." |

Los comandos siguen disponibles cuando necesitas control directo o automatización.

### Integración con Michibiki

Shotpack puede exportar un `VideoSpec` compatible con Michibiki. Michibiki es un router de producción de video separado que puede convertir el spec exportado en workflows de Editframe, HyperFrames o Remotion.

Configura Michibiki por separado:

```bash
cd ..
git clone https://github.com/Takamasa045/michibiki.git
cd michibiki
node scripts/setup.mjs
```

Exporta desde Shotpack:

```bash
cd ../pixverse-shotpack
./bin/pipeline export --config ./project.yaml --engine editframe
```

Este comando no llama a PixVerse ni a Michibiki. Solo escribe `dist/video-spec.json` y `dist/michibiki-handoff.json`.

También puedes usar el spec directamente desde Michibiki:

```bash
cd ../michibiki
pnpm michibiki decide --spec ../pixverse-shotpack/dist/video-spec.json
pnpm michibiki generate --spec ../pixverse-shotpack/dist/video-spec.json --engine editframe
```

O invocar Michibiki desde Shotpack:

```bash
./bin/pipeline export \
  --config ./project.yaml \
  --engine editframe \
  --michibiki-path ../michibiki \
  --run-michibiki
```

Los outputs de Michibiki se guardan en `../michibiki/outputs/jobs/<job-id>/`, no dentro de Shotpack.

### Modos de producción

| Modo | Cuándo usarlo | Descripción |
|------|---------------|-------------|
| `t2v` | Cuando importa más la velocidad | Genera clips directamente desde prompts de texto |
| `i2v` | Cuando importa más la consistencia visual | Primero genera imágenes de referencia y luego las anima |

### Modelos soportados

Al 2026-05-28, este repo apunta a `pixverse@1.1.10` y a la documentación actual de PixVerse C1 / V6.

| Modelo | Uso | Notas |
|--------|-----|-------|
| `v6` | Producción normal, extend, multi-shot | 1-15s, hasta 1080p |
| `pixverse-c1` | Generación cinematográfica, acción, reference-heavy | 1-15s, hasta 1080p. El API name `c1` se normaliza a `pixverse-c1` |
| `seedance-2.0-standard` | Generación third-party de mayor calidad | Validation soporta hasta `1080p` |
| `veo-3.1-standard` / `veo-3.1-fast` | Runs comparativos con Veo | Validation soporta hasta `2160p` |

Consulta [`references/model-constraints.md`](./references/model-constraints.md) para la tabla completa.

### Archivos y outputs principales

| Archivo / carpeta | Propósito |
|-------------------|-----------|
| `project.yaml` | Configuración principal que lee y actualiza el agente |
| `brief.md` | Brief creativo |
| `storyboard.yaml` | Shot breakdown, prompts, duración y encuadre |
| `dist/` | Videos, imágenes, reportes y logs generados |
| `dist/manifest.json` | Inventario de assets para Remotion |
| `dist/credits-report.json` | Reporte de créditos |
| `dist/run-log.md` | Log de ejecución |
| `dist/renders/*.mp4` | Videos finales renderizados |
| `skills/` | Definiciones de roles de sub-agentes |
| `workflows/` | Runbooks por fase |
| `references/` | Límites de modelos, créditos y errores |
| `src/` | Compositions de Remotion |

### Comandos manuales

```bash
./bin/pipeline doctor --config ./project.yaml
./bin/pipeline validate --config ./project.yaml
./bin/pipeline plan --config ./project.yaml
./bin/pipeline plan --config ./project.yaml --format markdown
./bin/pipeline run --config ./project.yaml --dry-run
./bin/pipeline run --config ./project.yaml
./bin/pipeline render --config ./project.yaml
./bin/pipeline export --config ./project.yaml --engine editframe

npm run start
npm run render:shotpack
```

Los dry-runs no llaman a PixVerse. `export` escribe archivos de handoff para Michibiki sin generar assets.

### Más información

1. [`project.yaml`](./project.yaml)
2. [`SKILL.md`](./SKILL.md)
3. [`workflows/orchestrator-flow.md`](./workflows/orchestrator-flow.md)
4. [`brief.md`](./brief.md) / [`storyboard.yaml`](./storyboard.yaml)

<a id="fr"></a>
## Français

**Demandez à un agent IA "crée une vidéo comme ceci" et Shotpack gère tout, de la planification au MP4 final.**

### Qu'est-ce que c'est ?

PixVerse Shotpack est un modèle de production vidéo piloté par agent. Décrivez la vidéo en langage naturel, et l'agent transforme la demande en `brief.md`, `storyboard.yaml` et `project.yaml`, puis utilise PixVerse et Remotion pour produire le MP4 final.

Le pipeline peut :

1. Convertir votre demande en brief structuré.
2. Créer un storyboard plan par plan.
3. Générer des clips vidéo avec PixVerse.
4. Construire un manifest lisible par Remotion.
5. Rendre la vidéo finale.

### Ce qui est inclus / non inclus

Ce dépôt est le pipeline Shotpack lui-même. Le cloner n'installe pas automatiquement les services externes ni les dépôts séparés.

| Objectif | Prérequis |
|----------|-----------|
| Vérifications de config / dry runs | Ce repo + `npm install` |
| Génération d'assets PixVerse | PixVerse CLI, authentification et crédits |
| Rendu MP4 avec Remotion | Les dépendances npm de ce repo |
| Handoff Michibiki / HyperFrames | Clone/setup Michibiki séparé |

Shotpack peut planifier, valider, faire un dry-run et rendre des assets locaux. La génération PixVerse et la continuation avec Michibiki nécessitent leur propre configuration.

### Fonctionnement des agents

Le pipeline fonctionne comme une petite équipe de production :

1. **Orchestrator** gère le flux complet et demande validation aux checkpoints.
2. **Director** transforme le brief en storyboard, timing, cadrage et prompts.
3. **Shot Generator** appelle PixVerse, relance les shots échoués et suit les crédits.
4. **Post-Processor** peut étendre, upscaler, ajouter du son ou de la narration.
5. **Assembler** ordonne les clips, crée le manifest Remotion et écrit les rapports.
6. **Remotion** rend le MP4 final.

Gate 1 valide le storyboard. Gate 1.5 valide les images de référence pour i2v. Gate 2 valide les shots générés.

### Démarrage

```bash
git clone https://github.com/Takamasa045/pixverse-shotpack.git
cd pixverse-shotpack
npm install
```

PixVerse CLI s'installe séparément :

```bash
npm install -g pixverse@latest
pixverse auth login
pixverse auth status --json
pixverse account info --json
```

Lancez le diagnostic :

```bash
npm run pipeline:doctor -- --format markdown
```

`doctor` vérifie Node.js, les dépendances, la version de PixVerse CLI, l'authentification, l'accès au compte et le binaire Remotion local.

### Utilisation natural-language first

L'entrée normale n'est pas une commande. Demandez en langage naturel :

| Objectif | Demande |
|----------|---------|
| Créer depuis zéro | "Utilise PixVerse Shotpack pour créer une promo cinématique de 30 secondes. Crée le brief et le storyboard, lance le dry-run, puis arrête-toi à Gate 1." |
| Garder personnages ou lieux cohérents | "Utilise le flux image-first i2v. Crée d'abord le design bible et les keyframes, puis demande-moi avant la génération vidéo." |
| Continuer depuis des clips existants | "Inspecte `dist/` et `manifest.json`, puis rends à nouveau le MP4 final avec les assets existants." |
| Passer à Michibiki | "Exporte ce projet Shotpack vers Michibiki en VideoSpec et prépare un projet Editframe." |

Les commandes restent disponibles pour le contrôle direct ou l'automatisation.

### Intégration Michibiki

Shotpack peut exporter un `VideoSpec` compatible avec Michibiki. Michibiki est un routeur de production vidéo séparé qui peut transformer ce spec en workflows Editframe, HyperFrames ou Remotion.

Configurez Michibiki séparément :

```bash
cd ..
git clone https://github.com/Takamasa045/michibiki.git
cd michibiki
node scripts/setup.mjs
```

Exportez depuis Shotpack :

```bash
cd ../pixverse-shotpack
./bin/pipeline export --config ./project.yaml --engine editframe
```

Cette commande n'appelle ni PixVerse ni Michibiki. Elle écrit seulement `dist/video-spec.json` et `dist/michibiki-handoff.json`.

Vous pouvez aussi lire le spec depuis Michibiki :

```bash
cd ../michibiki
pnpm michibiki decide --spec ../pixverse-shotpack/dist/video-spec.json
pnpm michibiki generate --spec ../pixverse-shotpack/dist/video-spec.json --engine editframe
```

Ou appeler Michibiki depuis Shotpack :

```bash
./bin/pipeline export \
  --config ./project.yaml \
  --engine editframe \
  --michibiki-path ../michibiki \
  --run-michibiki
```

Les sorties Michibiki sont enregistrées dans `../michibiki/outputs/jobs/<job-id>/`, pas dans Shotpack.

### Modes de production

| Mode | Quand l'utiliser | Description |
|------|------------------|-------------|
| `t2v` | Quand la vitesse compte le plus | Génère les clips directement depuis des prompts texte |
| `i2v` | Quand la cohérence visuelle compte le plus | Génère d'abord des images de référence, puis les anime |

### Modèles pris en charge

Au 2026-05-28, ce repo cible `pixverse@1.1.10` et les docs PixVerse C1 / V6 actuelles.

| Modèle | Usage | Notes |
|--------|-------|-------|
| `v6` | Production par défaut, extend, multi-shot | 1-15s, jusqu'à 1080p |
| `pixverse-c1` | Génération cinématique, action, reference-heavy | 1-15s, jusqu'à 1080p. Le nom API `c1` est normalisé en `pixverse-c1` |
| `seedance-2.0-standard` | Génération third-party de meilleure qualité | Validation jusqu'à `1080p` |
| `veo-3.1-standard` / `veo-3.1-fast` | Runs comparatifs Veo | Validation jusqu'à `2160p` |

Voir [`references/model-constraints.md`](./references/model-constraints.md) pour la table complète.

### Fichiers et sorties clés

| Fichier / dossier | Rôle |
|-------------------|------|
| `project.yaml` | Configuration principale lue et modifiée par l'agent |
| `brief.md` | Brief créatif |
| `storyboard.yaml` | Découpage, prompts, durée, cadrage |
| `dist/` | Vidéos, images, rapports et logs générés |
| `dist/manifest.json` | Inventaire des assets pour Remotion |
| `dist/credits-report.json` | Rapport d'utilisation des crédits |
| `dist/run-log.md` | Log d'exécution |
| `dist/renders/*.mp4` | Vidéos finales rendues |
| `skills/` | Définitions de rôles des sub-agents |
| `workflows/` | Runbooks par phase |
| `references/` | Limites de modèles, crédits, erreurs |
| `src/` | Compositions Remotion |

### Commandes manuelles

```bash
./bin/pipeline doctor --config ./project.yaml
./bin/pipeline validate --config ./project.yaml
./bin/pipeline plan --config ./project.yaml
./bin/pipeline plan --config ./project.yaml --format markdown
./bin/pipeline run --config ./project.yaml --dry-run
./bin/pipeline run --config ./project.yaml
./bin/pipeline render --config ./project.yaml
./bin/pipeline export --config ./project.yaml --engine editframe

npm run start
npm run render:shotpack
```

Les dry-runs n'appellent pas PixVerse. `export` écrit les fichiers de handoff Michibiki sans générer d'assets.

### En savoir plus

1. [`project.yaml`](./project.yaml)
2. [`SKILL.md`](./SKILL.md)
3. [`workflows/orchestrator-flow.md`](./workflows/orchestrator-flow.md)
4. [`brief.md`](./brief.md) / [`storyboard.yaml`](./storyboard.yaml)

<a id="de"></a>
## Deutsch

**Sag einem KI-Agenten "erstelle mir so ein Video", und Shotpack übernimmt alles von der Planung bis zur finalen MP4.**

### Was ist das?

PixVerse Shotpack ist eine agentengesteuerte Vorlage für Videoproduktion. Beschreibe das gewünschte Video in natürlicher Sprache; der Agent wandelt die Anfrage in `brief.md`, `storyboard.yaml` und `project.yaml` um und nutzt PixVerse und Remotion, um eine finale MP4 zu erzeugen.

Die Pipeline kann:

1. Deine Anfrage in ein strukturiertes Briefing umwandeln.
2. Ein Shot-für-Shot-Storyboard erstellen.
3. Videoclips mit PixVerse erzeugen.
4. Ein von Remotion lesbares Manifest bauen.
5. Das finale Video rendern.

### Was enthalten ist / was nicht

Dieses Repository ist die Shotpack-Pipeline selbst. Durch das Klonen werden externe Services oder separate Repositories nicht automatisch installiert.

| Ziel | Voraussetzung |
|------|---------------|
| Config checks / dry runs | Dieses Repo + `npm install` |
| PixVerse Asset-Erzeugung | PixVerse CLI, Auth und Credits |
| Remotion MP4 Rendering | npm-Abhängigkeiten dieses Repos |
| Michibiki / HyperFrames Handoff | Separates Michibiki clone/setup |

Shotpack kann planen, validieren, dry-runs ausführen und lokale Assets rendern. PixVerse-Generierung und Michibiki-Fortsetzung brauchen eigene Einrichtung.

### Wie die Agenten arbeiten

Die Pipeline funktioniert wie ein kleines Filmteam:

1. **Orchestrator** steuert den Ablauf und fragt an Checkpoints nach Freigabe.
2. **Director** macht aus dem Briefing Storyboard, Timing, Framing und Prompts.
3. **Shot Generator** ruft PixVerse auf, wiederholt fehlgeschlagene Shots und verfolgt Credits.
4. **Post-Processor** kann verlängern, upscalen, Ton oder Narration hinzufügen.
5. **Assembler** ordnet Clips, baut das Remotion-Manifest und schreibt Reports.
6. **Remotion** rendert die finale MP4.

Gate 1 prüft das Storyboard. Gate 1.5 prüft Referenzbilder für i2v. Gate 2 prüft die generierten Shots.

### Erste Schritte

```bash
git clone https://github.com/Takamasa045/pixverse-shotpack.git
cd pixverse-shotpack
npm install
```

PixVerse CLI wird separat installiert:

```bash
npm install -g pixverse@latest
pixverse auth login
pixverse auth status --json
pixverse account info --json
```

Führe den Environment Doctor aus:

```bash
npm run pipeline:doctor -- --format markdown
```

`doctor` prüft Node.js, Abhängigkeiten, PixVerse CLI Version, Auth-Status, Account-Zugriff und das lokale Remotion Binary.

### Natural-Language First

Der normale Einstieg ist kein Befehl. Bitte den Agenten in natürlicher Sprache:

| Ziel | Anfrage |
|------|---------|
| Von Grund auf erstellen | "Nutze PixVerse Shotpack, um ein 30-sekündiges cinematisches Promo-Video zu erstellen. Erstelle brief und storyboard, führe den dry-run aus und halte bei Gate 1 an." |
| Figuren oder Orte konsistent halten | "Nutze den image-first i2v Ablauf. Erstelle zuerst die design bible und keyframes und frage mich vor der Videoerzeugung." |
| Mit vorhandenen Clips fortfahren | "Prüfe `dist/` und `manifest.json`, dann rendere die finale MP4 mit den vorhandenen Assets neu." |
| An Michibiki übergeben | "Exportiere dieses Shotpack project als VideoSpec für Michibiki und bereite ein Editframe project vor." |

Manuelle Befehle bleiben verfügbar, wenn du direkte Kontrolle oder Automatisierung brauchst.

### Michibiki Integration

Shotpack kann ein Michibiki-kompatibles `VideoSpec` exportieren. Michibiki ist ein separates Video-Production-Router-Repository und kann das exportierte Spec in Editframe-, HyperFrames- oder Remotion-Workflows überführen.

Michibiki separat einrichten:

```bash
cd ..
git clone https://github.com/Takamasa045/michibiki.git
cd michibiki
node scripts/setup.mjs
```

Aus Shotpack exportieren:

```bash
cd ../pixverse-shotpack
./bin/pipeline export --config ./project.yaml --engine editframe
```

Dieser Befehl ruft weder PixVerse noch Michibiki auf. Er schreibt nur `dist/video-spec.json` und `dist/michibiki-handoff.json`.

Das Spec direkt in Michibiki verwenden:

```bash
cd ../michibiki
pnpm michibiki decide --spec ../pixverse-shotpack/dist/video-spec.json
pnpm michibiki generate --spec ../pixverse-shotpack/dist/video-spec.json --engine editframe
```

Oder Michibiki aus Shotpack heraus aufrufen:

```bash
./bin/pipeline export \
  --config ./project.yaml \
  --engine editframe \
  --michibiki-path ../michibiki \
  --run-michibiki
```

Michibiki-Ausgaben liegen unter `../michibiki/outputs/jobs/<job-id>/`, nicht in Shotpack.

### Produktionsmodi

| Modus | Wann verwenden | Beschreibung |
|-------|----------------|--------------|
| `t2v` | Wenn Geschwindigkeit am wichtigsten ist | Clips direkt aus Textprompts erzeugen |
| `i2v` | Wenn visuelle Konsistenz am wichtigsten ist | Erst Referenzbilder erzeugen, dann animieren |

### Unterstützte Modelle

Stand 2026-05-28 zielt dieses Repo auf `pixverse@1.1.10` und die aktuellen PixVerse C1 / V6 Docs.

| Modell | Einsatz | Hinweise |
|--------|---------|----------|
| `v6` | Standardproduktion, extend, multi-shot | 1-15s, bis 1080p |
| `pixverse-c1` | Cinematic, Action, reference-heavy Generierung | 1-15s, bis 1080p. API-Name `c1` wird zu `pixverse-c1` normalisiert |
| `seedance-2.0-standard` | Höherwertige third-party Generierung | Validation unterstützt bis `1080p` |
| `veo-3.1-standard` / `veo-3.1-fast` | Veo Vergleichsläufe | Validation unterstützt bis `2160p` |

Siehe [`references/model-constraints.md`](./references/model-constraints.md) für die vollständige Tabelle.

### Wichtige Dateien und Outputs

| Datei / Ordner | Zweck |
|----------------|-------|
| `project.yaml` | Hauptkonfiguration, die der Agent liest und aktualisiert |
| `brief.md` | Kreativbriefing |
| `storyboard.yaml` | Shot-Aufteilung, Prompts, Dauer, Framing |
| `dist/` | Generierte Videos, Bilder, Reports und Logs |
| `dist/manifest.json` | Asset-Inventar für Remotion |
| `dist/credits-report.json` | Credit-Report |
| `dist/run-log.md` | Ausführungslog |
| `dist/renders/*.mp4` | Finale gerenderte Videos |
| `skills/` | Sub-Agent Rollen |
| `workflows/` | Phase Runbooks |
| `references/` | Modellgrenzen, Credits, Fehlerverträge |
| `src/` | Remotion Compositions |

### Manuelle Befehle

```bash
./bin/pipeline doctor --config ./project.yaml
./bin/pipeline validate --config ./project.yaml
./bin/pipeline plan --config ./project.yaml
./bin/pipeline plan --config ./project.yaml --format markdown
./bin/pipeline run --config ./project.yaml --dry-run
./bin/pipeline run --config ./project.yaml
./bin/pipeline render --config ./project.yaml
./bin/pipeline export --config ./project.yaml --engine editframe

npm run start
npm run render:shotpack
```

Dry-runs rufen PixVerse nicht auf. `export` schreibt Michibiki-Handoff-Dateien ohne Asset-Generierung.

### Mehr erfahren

1. [`project.yaml`](./project.yaml)
2. [`SKILL.md`](./SKILL.md)
3. [`workflows/orchestrator-flow.md`](./workflows/orchestrator-flow.md)
4. [`brief.md`](./brief.md) / [`storyboard.yaml`](./storyboard.yaml)
