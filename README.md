# PixVerse Shotpack

[日本語版 README](./README.ja.md)

This repository is a `project.yaml`-driven PixVerse-to-Remotion pipeline. It is meant to normalize a natural-language brief into a checked-in project file, validate the plan, stage or generate assets, build `dist/manifest.json`, and render a final MP4 from the same repo.

As of March 31, 2026, this repo treats PixVerse-native `v6` as the preferred default model. Legacy `v5.6` remains the fallback, and source-backed limits and pricing live under `references/`.

The workflow still treats `dist/manifest.json` as the contract boundary, but the same repo also includes the local Remotion consumer and the CLI needed to get from planning to final MP4.

## Quick Start

1. Clone this repository.

   ```bash
   git clone https://github.com/Takamasa045/pixverse-shotpack.git
   cd pixverse-shotpack
   ```

2. Install Node dependencies for the Remotion finisher.

   ```bash
   npm install
   ```

3. Make sure the PixVerse CLI is already installed in your environment.
4. Authenticate and verify your account before running any workflow.

   ```bash
   pixverse auth login
   pixverse auth status --json
   pixverse account info --json
   ```

5. Ask your coding agent in natural language. That is the default workflow for this template.

   Example prompts:

   - "Review `brief.md` and `storyboard.yaml`, then update `project.yaml`."
   - "Validate this repo config and show me the execution plan."
   - "Do a dry run and fix any config issues you find."
   - "Run the full PixVerse-to-Remotion flow and render the final MP4."
   - "I only want to inspect the consumer side. Start Remotion and check `Shotpack`."

6. The agent can update `project.yaml`, `brief.md`, and `storyboard.yaml` as needed, then move through validation, planning, dry-run, execution, and render.

If `dist/manifest.json` is not present yet, the Remotion consumer falls back to `public/shotpack-sample/manifest.json`, which is now a lightweight starter manifest without bundled heavy media files.

## Agent Prompts

| Goal | Natural-language request |
|---------|---------|
| Validate the setup | "Validate `project.yaml` and `storyboard.yaml`." |
| Inspect the plan | "Show me the execution plan for this repo." |
| Preview without calling PixVerse | "Run a dry run and generate only the manifest and plan." |
| Full production run | "Generate the shotpack and render the final MP4." |
| Re-render from existing outputs | "Re-render from the current manifest." |
| Consumer-only work | "Start the Remotion consumer and check `Shotpack`." |

## Manual Commands

Use these only if you want to run the pipeline yourself instead of asking an agent.

```bash
./bin/pipeline validate --config ./project.yaml
./bin/pipeline plan --config ./project.yaml
./bin/pipeline run --config ./project.yaml --dry-run
./bin/pipeline run --config ./project.yaml
./bin/pipeline render --config ./project.yaml
```

For direct consumer work without the pipeline wrapper:

```bash
npm run prepare:assets
npm run start
npm run render:3d-linked
npm run render:shotpack
```

The equivalent npm wrappers are `npm run pipeline:validate -- --config ./project.yaml`, `npm run pipeline:plan -- --config ./project.yaml`, `npm run pipeline:run -- --config ./project.yaml`, and `npm run pipeline:render -- --config ./project.yaml`.

## Project File

`project.yaml` is the main config file the agent reads and updates. In the normal workflow, you describe the goal in natural language and let the agent edit this file as needed. The current schema has these top-level sections:

- `project`: slug, title, date, version
- `inputs`: paths to `brief.md` and `storyboard.yaml`
- `assets`: `local` or `pixverse`, plus staging patterns and audio path
- `generation`: workflow, model, quality, aspect ratio, and optional still-generation settings
- `render`: composition, fps, size, and final MP4 output path
- `theme`: palette passed to the built-in finisher
- `manifest`: text and edit policies folded into `dist/manifest.json`

Two operating modes are supported:

- `assets.mode: local`: copy existing assets from a source directory, build the manifest, and render locally
- `assets.mode: pixverse`: call PixVerse CLI to generate stills and videos, download them into `dist/`, then render locally

## Architecture

```text
Natural language request
  -> project.yaml
  -> validate
  -> plan
  -> run --dry-run
  -> run
  -> render
```

Internal execution still follows the same producer split:

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

Goals of this shape:

- keep `project.yaml` as the single checked-in runtime contract
- keep creative planning separate from CLI execution
- preserve resumability through `dist/pipeline-state.json`
- keep the Remotion finisher inside the same repo without changing the producer manifest contract

## Start Here

1. [project.yaml](./project.yaml)
2. [SKILL.md](./SKILL.md)
3. [workflows/orchestrator-flow.md](./workflows/orchestrator-flow.md)
4. [brief.md](./brief.md) and [storyboard.yaml](./storyboard.yaml)

## Workflow Modes

| workflow | Use when | Reference |
|---------|----------|-----------|
| `t2v` | speed matters most | `workflows/pixverse-shotpack.md` |
| `i2v` | visual consistency matters most | `workflows/image-first-i2v-pipeline.md` |

## Key Directories

| Path | Purpose |
|------|---------|
| `skills/` | per-sub-agent responsibility files |
| `workflows/` | phase runbooks |
| `references/` | manifest, exit code, model, and credit contracts |
| `examples/` | sample state, report, and log files |
| `dist/` | generated outputs |
| `src/` | Remotion consumer compositions |
| `scripts/` | asset prep and local audio generation |
| `public/` | lightweight starter manifest plus synced runtime assets |

## Primary Outputs

- `dist/scene-01.mp4` and other primary assets
- `dist/vertical/*.mp4` side outputs
- `dist/audio/shotpack-placeholder.wav`
- `dist/manifest.json`
- `dist/credits-report.json`
- `dist/run-log.md`
- `dist/pipeline-state.json`

## Compatibility Note

`dist/manifest.json` intentionally stays compatible with the existing Remotion consumer's `RenderManifest` contract. Extra pipeline metadata lives in `pipeline-state.json` and `credits-report.json` instead of changing the consumer boundary.

## Local Consumer

- `LinkedParticles` is the standalone 3D smoke composition.
- `Shotpack` is the built-in generic finisher composition driven by the shotpack manifest.
- `scripts/prepare-public-assets.mjs` syncs `dist/manifest.json` and the files it references into `public/shotpack-sample/` only when a manifest exists.
- The template no longer checks in large sample movies or the `nakaima` media pack. Generate your own assets or place them under `public/shotpack-sample/` when working in `assets.mode: local`.
