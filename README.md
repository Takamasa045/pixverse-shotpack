# PixVerse Shotpack

[日本語版 README](./README.ja.md)

This repository documents an Orchestrator-led PixVerse shotpack workflow. Start from `brief.md` or `storyboard.yaml`, move through approval gates, and finish with `dist/manifest.json`, `dist/credits-report.json`, and resumable pipeline state.

As of March 31, 2026, this repo treats PixVerse-native `v6` as the preferred default model. Legacy `v5.6` remains the fallback, and source-backed limits and pricing live under `references/`.

## Architecture

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

Goals of the split:

- keep creative planning separate from CLI execution
- force human approval before credit-consuming steps
- preserve resumability through `dist/pipeline-state.json`

## Start Here

1. [SKILL.md](./SKILL.md)
2. [workflows/orchestrator-flow.md](./workflows/orchestrator-flow.md)
3. [brief.md](./brief.md) or [storyboard.yaml](./storyboard.yaml)

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
