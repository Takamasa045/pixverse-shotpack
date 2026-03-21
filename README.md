# PixVerse Shotpack

[日本語版 README](./README.ja.md)

This repo is a reusable PixVerse CLI workflow / skill submission package for creating Remotion-ready shot packs.

It packages a repeatable process around structured inputs such as `brief.md` or `storyboard.yaml`, PixVerse CLI generation, and a Remotion-compatible `manifest.json` for downstream editing or rendering.

## In One Sentence

Use this when you want a reusable documented pattern for going from creative planning documents to AI-generated video shots, without rebuilding the workflow each time.

This is not a standalone app or npm wrapper.
The value is in the skill spec, starter files, and execution docs that show how to use PixVerse CLI in a real workflow.

## What You Get

- a generic `brief.md` starter
- a generic `storyboard.yaml` starter
- a skill spec for agent use in `SKILL.md`
- a standard T2V workflow
- a standard image-first I2V workflow
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

Main review path for this submission.

Use this when speed matters more than visual consistency.

See:
- `workflows/pixverse-shotpack.md`

### Image-First I2V

Advanced extension for teams that want stronger visual consistency.

Use this when visual consistency matters more than speed.
Generate reference stills first, review them, then animate them with PixVerse I2V.

See:
- `workflows/image-first-i2v-pipeline.md`

## Start Here

If you want to try the repo quickly:

1. Open `brief.md`
2. Replace the placeholder text with your project details
3. Or edit `storyboard.yaml` directly if you already know your shots
4. Start with `workflows/pixverse-shotpack.md`
5. Use `workflows/image-first-i2v-pipeline.md` only if you want the image-first extension

Reference examples:

- `examples/brief.example.md`
- `examples/storyboard.sample.yaml`
- `examples/manifest.example.json`

## Key Files

- `SKILL.md`
  Main agent-facing skill definition
- `EMAIL_FINAL.md`
  Send-ready English and Japanese email templates
- `SUBMISSION_CHECKLIST.md`
  Checklist for repo-link or zip submission
- `GITHUB_RELEASE_CHECKLIST.md`
  Final check before making the repo public
- `brief.md`
  Generic brief starter
- `storyboard.yaml`
  Generic storyboard starter
- `templates/`
  Reusable templates
- `examples/`
  Neutral sample files
- `workflows/`
  Step-by-step execution docs
- `references/`
  Supporting notes such as manifest structure and exit codes
- `SUBMISSION_EMAIL.md`
  Ready-to-edit English and Japanese submission drafts

## Why This Is Useful

This repo is not just a prompt collection.
It shows how PixVerse CLI can be used as part of a real workflow / skill submission:

- structured input instead of one-off prompting
- reusable command patterns
- agent-safe defaults
- predictable file naming
- output that can plug into downstream video composition systems

## What To Share

For a skill / workflow submission, share:

- `README.md`
- `README.ja.md`
- `EMAIL_FINAL.md`
- `SUBMISSION_CHECKLIST.md`
- `GITHUB_RELEASE_CHECKLIST.md`
- `SUBMISSION_EMAIL.md`
- `SKILL.md`
- `brief.md`
- `storyboard.yaml`
- `templates/`
- `examples/`
- `workflows/`
- `references/`

Do not include `dist/`.
It contains local generated artifacts from previous runs and is ignored by `.gitignore`.

## Output Notes

The generated workflow is expected to produce:

- PixVerse-generated clips or stills
- placeholder audio if the downstream consumer requires `manifest.audio.src`
- `dist/manifest.json` following the contract described in `references/manifest-schema.md`

## Important Defaults

- Primary output is `16:9`
- `9:16` can be added as a second pass
- PixVerse CLI commands should use `--json`
- Image model names should be confirmed from CLI help, not hardcoded blindly
