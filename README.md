# PixVerse Shotpack

[日本語版 README](./README.ja.md)

A reusable PixVerse CLI workflow for creating Remotion-ready shot packs from structured inputs like `brief.md` or `storyboard.yaml`.

## In One Sentence

Use this when you want a documented, repeatable pattern for going from creative planning documents to AI-generated video shots, without rebuilding the workflow each time.

## What You Get

- a generic `brief.md` starter
- a generic `storyboard.yaml` starter
- an agent-facing skill spec (`SKILL.md`)
- a standard T2V workflow
- an image-first I2V workflow for stronger visual consistency
- neutral examples for input and manifest output

## How It Works

1. Start with `brief.md` or `storyboard.yaml`
2. Use PixVerse CLI to generate shots
3. Rename and organize outputs predictably
4. Build `manifest.json` for a downstream Remotion consumer

In short:

`brief.md` -> `storyboard.yaml` -> PixVerse CLI -> `manifest.json`

## Choose a Workflow

### T2V Shotpack

Use this when speed matters more than visual consistency.

See: `workflows/pixverse-shotpack.md`

### Image-First I2V

Use this when visual consistency matters more than speed.
Generate reference stills first, review them, then animate them with PixVerse I2V.

See: `workflows/image-first-i2v-pipeline.md`

## Start Here

1. Open `brief.md` and replace the placeholder text with your project details
2. Or edit `storyboard.yaml` directly if you already know your shots
3. Follow `workflows/pixverse-shotpack.md`
4. Use `workflows/image-first-i2v-pipeline.md` only if you want the image-first extension

Reference examples:

- `examples/brief.example.md`
- `examples/storyboard.sample.yaml`
- `examples/manifest.example.json`

## Key Files

| File | Description |
|------|-------------|
| `SKILL.md` | Agent-facing skill definition |
| `brief.md` | Generic brief starter |
| `storyboard.yaml` | Generic storyboard starter |
| `examples/` | Neutral sample files |
| `workflows/` | Step-by-step execution docs |
| `references/` | Manifest schema and exit codes |

## Output

The workflow produces:

- PixVerse-generated clips or stills in `dist/`
- placeholder audio if the downstream consumer requires `manifest.audio.src`
- `dist/manifest.json` following the contract in `references/manifest-schema.md`

## Defaults

- Primary output is `16:9`
- `9:16` can be added as a second pass
- All PixVerse CLI commands use `--json`
- Image model names should be confirmed from CLI help, not hardcoded
