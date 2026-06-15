# PixVerse Shotpack

## Language Switch

[English](#en) | [日本語](#ja) | [中文](#zh) | [Español](#es) | [Français](#fr) | [Deutsch](#de)

All language sections live in this README. The detailed command reference is shared below the language summaries.

<a id="en"></a>
## English

**Tell an AI agent "make me a video like this" and it handles everything from planning to final MP4.**

PixVerse Shotpack turns a plain-language video request into `brief.md`, `storyboard.yaml`, `project.yaml`, PixVerse-generated clips, a Remotion manifest, and a final MP4.

Start with a natural-language request:

| Goal | What to say |
|------|-------------|
| Build from scratch | "Use PixVerse Shotpack to make a 30-second cinematic promo. Create the brief and storyboard, dry-run it, and stop at Gate 1." |
| Keep characters or places consistent | "Use the image-first i2v flow. Build the design bible and keyframes first." |
| Continue from existing assets | "Inspect `dist/` and `manifest.json`, then re-render the final MP4." |
| Hand off to Michibiki | "Export this Shotpack project to Michibiki as a VideoSpec and prepare an Editframe project." |

Michibiki is optional. Shotpack handles planning and PixVerse asset generation; Michibiki can continue from the exported `VideoSpec` into Editframe, HyperFrames, or Remotion workflows.

<a id="ja"></a>
## 日本語

**AI に「こんな動画を作って」と伝えるだけで、企画から完成 MP4 まで進める制作パイプラインです。**

PixVerse Shotpack は、自然言語の動画依頼を `brief.md`、`storyboard.yaml`、`project.yaml`、PixVerse 生成素材、Remotion 用 manifest、最終 MP4 へつなげます。

基本はコマンドではなく、自然言語で依頼します。

| やりたいこと | 頼み方 |
|-------------|--------|
| 最初から作る | 「PixVerse Shotpack で 30 秒のシネマティックなプロモ動画を作って。brief と storyboard を作り、dry-run まで進めて Gate 1 で確認させて」 |
| キャラや場所を揃える | 「image-first の i2v で進めて。まず design bible と keyframe を作って」 |
| 既存素材から続ける | 「今の `dist/` と `manifest.json` を確認して、既存素材から最終 MP4 だけ再 render して」 |
| Michibiki に渡す | 「この Shotpack project を Michibiki 用の VideoSpec に export して、Editframe project を作れる状態にして」 |

Michibiki はオプションです。Shotpack が企画と PixVerse 素材生成を担当し、Michibiki は書き出された `VideoSpec` をもとに Editframe / HyperFrames / Remotion の編集・納品 workflow へつなぎます。

<a id="zh"></a>
## 中文

**只要告诉 AI 代理“我想做这样的视频”，它就能从企划推进到最终 MP4。**

PixVerse Shotpack 会把自然语言的视频需求整理成 `brief.md`、`storyboard.yaml`、`project.yaml`，生成 PixVerse 素材，构建 Remotion manifest，并输出最终 MP4。

建议先用自然语言发起任务：

| 目标 | 可以这样说 |
|------|------------|
| 从零开始制作 | "用 PixVerse Shotpack 制作一个 30 秒的电影感宣传视频。先创建 brief 和 storyboard，执行 dry-run，并在 Gate 1 停下来让我确认。" |
| 保持角色或场景一致 | "使用 image-first 的 i2v 流程。先建立 design bible 和 keyframe。" |
| 使用已有素材继续 | "检查 `dist/` 和 `manifest.json`，然后用现有素材重新渲染最终 MP4。" |
| 交接给 Michibiki | "把这个 Shotpack project 导出为 Michibiki 用的 VideoSpec，并准备一个 Editframe project。" |

Michibiki 是可选的独立项目。Shotpack 负责企划和 PixVerse 素材生成；Michibiki 可以读取导出的 `VideoSpec`，继续生成 Editframe、HyperFrames 或 Remotion 工作流。

<a id="es"></a>
## Español

**Dile a un agente de IA "hazme un video como este" y Shotpack lo lleva desde la planificación hasta el MP4 final.**

PixVerse Shotpack convierte una solicitud en lenguaje natural en `brief.md`, `storyboard.yaml`, `project.yaml`, clips generados con PixVerse, un manifest para Remotion y un MP4 final.

Empieza con una petición en lenguaje natural:

| Objetivo | Qué decir |
|----------|-----------|
| Crear desde cero | "Usa PixVerse Shotpack para crear un promo cinematográfico de 30 segundos. Crea el brief y el storyboard, ejecuta el dry-run y detente en Gate 1." |
| Mantener personajes o lugares consistentes | "Usa el flujo image-first i2v. Primero crea el design bible y los keyframes." |
| Continuar con assets existentes | "Revisa `dist/` y `manifest.json`, y vuelve a renderizar el MP4 final con los assets existentes." |
| Enviar a Michibiki | "Exporta este proyecto Shotpack a Michibiki como VideoSpec y prepara un proyecto Editframe." |

Michibiki es opcional. Shotpack se encarga de la planificación y de generar assets con PixVerse; Michibiki puede continuar desde el `VideoSpec` exportado hacia flujos de Editframe, HyperFrames o Remotion.

<a id="fr"></a>
## Français

**Demandez à un agent IA "crée une vidéo comme ceci" et Shotpack gère le parcours jusqu'au MP4 final.**

PixVerse Shotpack transforme une demande en langage naturel en `brief.md`, `storyboard.yaml`, `project.yaml`, clips générés par PixVerse, manifest Remotion et MP4 final.

Commencez avec une demande en langage naturel :

| Objectif | Formulation |
|----------|-------------|
| Créer depuis zéro | "Utilise PixVerse Shotpack pour créer une promo cinématique de 30 secondes. Crée le brief et le storyboard, lance le dry-run, puis arrête-toi à Gate 1." |
| Garder des personnages ou lieux cohérents | "Utilise le flux image-first i2v. Crée d'abord le design bible et les keyframes." |
| Continuer avec des assets existants | "Inspecte `dist/` et `manifest.json`, puis rends à nouveau le MP4 final avec les assets existants." |
| Passer à Michibiki | "Exporte ce projet Shotpack vers Michibiki en VideoSpec et prépare un projet Editframe." |

Michibiki est optionnel. Shotpack gère la planification et la génération d'assets PixVerse ; Michibiki peut reprendre le `VideoSpec` exporté pour produire des workflows Editframe, HyperFrames ou Remotion.

<a id="de"></a>
## Deutsch

**Sag einem KI-Agenten "erstelle mir so ein Video", und Shotpack begleitet den Weg bis zur fertigen MP4-Datei.**

PixVerse Shotpack verwandelt eine Anfrage in natürlicher Sprache in `brief.md`, `storyboard.yaml`, `project.yaml`, PixVerse-Clips, ein Remotion-Manifest und eine finale MP4.

Starte mit einer natürlichen Anfrage:

| Ziel | Beispiel |
|------|----------|
| Von Grund auf erstellen | "Nutze PixVerse Shotpack, um ein 30-sekündiges cinematisches Promo-Video zu erstellen. Erstelle brief und storyboard, führe den dry-run aus und halte bei Gate 1 an." |
| Figuren oder Orte konsistent halten | "Nutze den image-first i2v Ablauf. Erstelle zuerst die design bible und die keyframes." |
| Mit vorhandenen Assets fortfahren | "Prüfe `dist/` und `manifest.json`, dann rendere die finale MP4 mit den vorhandenen Assets neu." |
| An Michibiki übergeben | "Exportiere dieses Shotpack project als VideoSpec für Michibiki und bereite ein Editframe project vor." |

Michibiki ist optional. Shotpack übernimmt Planung und PixVerse-Asset-Erzeugung; Michibiki kann das exportierte `VideoSpec` in Editframe-, HyperFrames- oder Remotion-Workflows weiterführen.

## Technical Reference

**Tell an AI agent "make me a video like this" and it handles everything from planning to final MP4.**

## What Is This?

PixVerse Shotpack is a template that lets you describe a video in plain language, and an AI agent automatically:

1. Turns your request into a structured plan
2. Creates a storyboard with shot breakdowns
3. Generates video clips using AI (PixVerse)
4. Combines everything into a finished MP4

No manual commands needed. Just talk to the agent.

## What It Does / Does Not Include

This repository is the Shotpack pipeline itself. Cloning it does not automatically install external services or separate repositories.

| Goal | Requirements |
|------|--------------|
| Config checks / dry runs | This repo + `npm install` |
| PixVerse asset generation | PixVerse CLI, auth, and credits |
| Remotion MP4 rendering | This repo's npm dependencies |
| Michibiki / HyperFrames handoff | A separate Michibiki clone/setup |

In other words, cloning Shotpack alone is not enough to run PixVerse generation or Michibiki / HyperFrames video generation end to end.

## How the Sub-Agents Work

The pipeline runs like a film crew: one **director** coordinating four **specialist roles**. Between each step, you get a **checkpoint (Gate)** where you can approve, request changes, or stop.

```
Your request (plain language)
  |
  v
+--------------------------------------------------+
|  Orchestrator (Project Manager)                   |
|  - Manages the overall flow                       |
|  - Asks for your approval at checkpoints          |
|  - Can pause and resume at any point              |
+--------------------------------------------------+
  |
  v
+--------------------------------------------------+
|  Director (Creative Lead)                         |
|  - Turns your brief into a storyboard             |
|  - Decides shot composition, framing, duration    |
|  - Designs prompts for the AI video generator     |
+--------------------------------------------------+
  |
  v  [ Gate 1: Storyboard Review ]
  |    Approve / Revise / Abort
  v
+--------------------------------------------------+
|  Shot Generator (Camera Operator)                 |
|  - Calls PixVerse AI to generate video clips      |
|  - Auto-retries failed shots                      |
|  - Tracks credit (generation cost) usage          |
+--------------------------------------------------+
  |
  v  [ Gate 1.5: Reference Image Review ]  (i2v mode only)
  |
  v  [ Gate 2: Shot Quality Review ]
  |    Approve All / Retry Specific Shots / Abort
  v
+--------------------------------------------------+
|  Post-Processor (Editor)                          |
|  - Extends clip duration                          |
|  - Upscales resolution                            |
|  - Adds sound effects and narration               |
+--------------------------------------------------+
  |
  v
+--------------------------------------------------+
|  Assembler (Delivery Manager)                     |
|  - Orders clips into the correct sequence         |
|  - Builds the manifest for Remotion               |
|  - Outputs cost reports and logs                  |
+--------------------------------------------------+
  |
  v
+--------------------------------------------------+
|  Remotion (Video Renderer)                        |
|  - Renders the final MP4                          |
+--------------------------------------------------+
  |
  v
  Finished MP4
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Takamasa045/pixverse-shotpack.git
cd pixverse-shotpack
```

### 2. Install dependencies

```bash
npm install
```

### 3. Log in to PixVerse CLI

PixVerse CLI must be installed separately.

```bash
npm install -g pixverse@latest
pixverse auth login
pixverse auth status --json
pixverse account info --json
```

### 4. Run the environment doctor

```bash
npm run pipeline:doctor -- --format markdown
```

`doctor` checks Node.js, installed dependencies, PixVerse CLI version, auth status, account access, and the local Remotion binary. If your global PixVerse CLI is stale, it suggests `npm install -g pixverse@latest`.

### 5. Talk to the agent

Open Claude Code and describe what you want in plain language.

## Natural-Language First Usage

You can treat Shotpack as an agent-operated production workspace. Start by saying what you want to make; the agent should translate that request into `brief.md`, `storyboard.yaml`, `project.yaml`, dry-run checks, Gates, generation, and render steps.

Use commands only when you want direct control or automation. The normal entry point is a sentence like:

| Goal | Natural-language request |
|------|--------------------------|
| Build a video from scratch | "Use PixVerse Shotpack to make a 30-second cinematic promo. Create the brief and storyboard, dry-run it, and stop at Gate 1 for review." |
| Prioritize consistent characters or locations | "Use the image-first i2v flow. Build the design bible and keyframes first, then ask me before video generation." |
| Continue from existing generated clips | "Inspect the current `dist/` and `manifest.json`, then re-render the final MP4 from the existing assets." |
| Hand off to Michibiki | "Export this Shotpack project to Michibiki as a VideoSpec and prepare an Editframe project." |
| Let Michibiki continue the edit | "Run the Michibiki handoff from Shotpack, create the editing project and preview, but do not use cloud rendering." |

## Michibiki Integration (Optional)

Shotpack can export a Michibiki-friendly `VideoSpec` from the current project. This is an optional handoff. Michibiki is not bundled in this repository and is not a Git submodule.

Michibiki is a separate video-production router that reads a structured `VideoSpec` and turns it into an editing project, preview, or render workflow for engines such as Editframe, HyperFrames, or Remotion. In this repo, Shotpack handles planning and PixVerse asset generation; Michibiki can take that plan and continue the editing/delivery side.

### 1. Set up Michibiki separately

```bash
cd ..
git clone https://github.com/Takamasa045/michibiki.git
cd michibiki
node scripts/setup.mjs
```

### 2. Export handoff files from Shotpack

```bash
cd ../pixverse-shotpack
./bin/pipeline export --config ./project.yaml --engine editframe
```

This command does not call PixVerse or Michibiki. It only writes `dist/video-spec.json` and `dist/michibiki-handoff.json`.

You can also pass the exported spec to Michibiki directly:

```bash
cd ../michibiki
pnpm michibiki decide --spec ../pixverse-shotpack/dist/video-spec.json
pnpm michibiki generate --spec ../pixverse-shotpack/dist/video-spec.json --engine editframe
```

Michibiki keeps generated projects, previews, and render outputs in its own `outputs/jobs/<job-id>/` tree.

### 3. Invoke Michibiki CLI from Shotpack

```bash
./bin/pipeline export \
  --config ./project.yaml \
  --engine editframe \
  --michibiki-path ../michibiki \
  --run-michibiki
```

This runs Michibiki as `pnpm michibiki generate --spec dist/video-spec.json`. Because the command runs from the Michibiki repository, generated projects, previews, and final renders are saved under `../michibiki/outputs/jobs/<job-id>/`, not inside Shotpack. Final MP4 rendering should still be confirmed and run from the Michibiki side. Add `--allow-cloud-render` only when cloud rendering is intentionally allowed.

### Output Guide

| Output | Purpose |
|--------|---------|
| `dist/video-spec.json` | Michibiki-compatible plan, timing, scenes, and asset references |
| `dist/michibiki-handoff.json` | Command, Michibiki path, and execution result record |
| `../michibiki/outputs/jobs/<job-id>/` | Michibiki editing, preview, and render artifacts |
| `--engine editframe` | Prefer an Editframe project |
| `--engine hyperframes` | Prefer a HyperFrames-compatible project |
| `--engine remotion` | Prefer a Remotion project |
| `--engine auto` | Let Michibiki's router choose the engine |

## Example Prompts

| What you want | What to say |
|---------------|-------------|
| Check the whole environment | "Run doctor and tell me what needs fixing." |
| Check if the setup is correct | "Validate the project config." |
| See the execution plan | "Show me the execution plan." |
| Preview without calling PixVerse | "Do a dry run and fix any issues." |
| Run the full pipeline | "Generate the shotpack and render the final MP4." |
| Re-render from existing assets | "Re-render from the current manifest." |
| Just check the video editor | "Start Remotion and check Shotpack." |
| Handoff to Michibiki / HyperFrames | "Export this for Michibiki." |

## Two Production Modes

| Mode | When to use | Description |
|------|-------------|-------------|
| `t2v` (text-to-video) | Speed matters most | Generate clips directly from text prompts |
| `i2v` (image-to-video) | Visual consistency matters most | Generate reference images first, then animate them |

## Supported Model Baseline

As of 2026-05-28, this repo targets `pixverse@1.1.10` plus the current PixVerse C1 / V6 platform docs.

| Model | Use it for | Notes |
|-------|------------|-------|
| `v6` | Default production, extend, multi-shot | 1-15s, up to 1080p |
| `pixverse-c1` | Cinematic, action, reference-heavy generation | 1-15s, up to 1080p. The official API name `c1` is normalized to the CLI value `pixverse-c1` |
| `seedance-2.0-standard` | Higher-quality third-party generation | Validation supports up to `1080p` |
| `veo-3.1-standard` / `veo-3.1-fast` | Veo comparison runs | Validation supports up to `2160p` |

See [references/model-constraints.md](./references/model-constraints.md) for the full constraints table.

## Key Files and Folders

| File / Folder | What's inside |
|---------------|---------------|
| `project.yaml` | Main config file (the agent reads and updates this) |
| `brief.md` | Your creative brief (what you want to make) |
| `storyboard.yaml` | Shot-by-shot breakdown (prompts, duration, framing) |
| `dist/` | All generated outputs (videos, images, logs) |
| `dist/manifest.json` | Asset inventory that Remotion reads |
| `skills/` | Role definitions for each sub-agent |
| `workflows/` | Step-by-step runbooks for each phase |
| `references/` | AI model constraints, costs, error codes |
| `src/` | Remotion video compositions |

## What You Get

When the pipeline finishes, the `dist/` folder contains:

| File | Contents |
|------|----------|
| `dist/scene-01.mp4` etc. | Individual shot clips |
| `dist/vertical/*.mp4` | Vertical (9:16) versions |
| `dist/manifest.json` | Full asset manifest |
| `dist/credits-report.json` | Credit (cost) usage report |
| `dist/run-log.md` | Execution log |
| `dist/renders/*.mp4` | Final rendered video |

## Manual Commands

If you prefer running commands yourself instead of using the agent:

```bash
# Full pipeline
./bin/pipeline doctor --config ./project.yaml     # Environment doctor
./bin/pipeline validate --config ./project.yaml   # Check config
./bin/pipeline plan --config ./project.yaml       # Create execution plan
./bin/pipeline plan --config ./project.yaml --format markdown  # Gate summary
./bin/pipeline run --config ./project.yaml --dry-run  # Dry run
./bin/pipeline run --config ./project.yaml        # Production run
./bin/pipeline render --config ./project.yaml     # Render MP4
./bin/pipeline export --config ./project.yaml --engine editframe  # Export for Michibiki

# Remotion only
npm run start              # Open preview
npm run render:shotpack    # Render MP4
```

Dry runs do not call PixVerse. They write `dist/dry-run-plan.json`, `dist/dry-run.md`, and `dist/dry-run-manifest.json`.
`export` does not call PixVerse. It writes `dist/video-spec.json` and `dist/michibiki-handoff.json` from the storyboard and any assets it can find.

## Learn More

1. [project.yaml](./project.yaml) - The actual config file
2. [SKILL.md](./SKILL.md) - Detailed agent specification
3. [workflows/orchestrator-flow.md](./workflows/orchestrator-flow.md) - Orchestration details
4. [brief.md](./brief.md) / [storyboard.yaml](./storyboard.yaml) - Sample brief and storyboard
