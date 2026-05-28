# PixVerse Shotpack

[日本語版 README](./README.ja.md)

**Tell an AI agent "make me a video like this" and it handles everything from planning to final MP4.**

## What Is This?

PixVerse Shotpack is a template that lets you describe a video in plain language, and an AI agent automatically:

1. Turns your request into a structured plan
2. Creates a storyboard with shot breakdowns
3. Generates video clips using AI (PixVerse)
4. Combines everything into a finished MP4

No manual commands needed. Just talk to the agent.

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

# Remotion only
npm run start              # Open preview
npm run render:shotpack    # Render MP4
```

Dry runs do not call PixVerse. They write `dist/dry-run-plan.json`, `dist/dry-run.md`, and `dist/dry-run-manifest.json`.

## Learn More

1. [project.yaml](./project.yaml) - The actual config file
2. [SKILL.md](./SKILL.md) - Detailed agent specification
3. [workflows/orchestrator-flow.md](./workflows/orchestrator-flow.md) - Orchestration details
4. [brief.md](./brief.md) / [storyboard.yaml](./storyboard.yaml) - Sample brief and storyboard
