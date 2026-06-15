# PixVerse Shotpack

## Languages

- [English](./README.md)
- [日本語](./README.ja.md)

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
