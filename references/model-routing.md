# Model Routing Reference

このファイルは、自然言語の依頼を Shotpack の workflow、PixVerse CLI command family、model 候補へ落とすための判断表です。
正確な duration / quality / aspect ratio は `references/model-constraints.md` を正とします。

## Scope

Shotpack が `project.yaml` から直接扱う中核 workflow:

- `workflow: t2v`: `pixverse create video --prompt`
- `workflow: i2v`: reference still を作るか読み込み、`pixverse create video --image`
- `assets.voiceText`: `pixverse create voice`
- local render: 既存 asset から `dist/manifest.json` と MP4 を作る

直接 pipeline 化していない CLI 機能は、外部 prep step として生成し、受け入れ済み asset を `sourceDir` / `audio` / `bgm` に戻します。

## Workflow Router

| Intent | Shotpack workflow | Primary CLI family | First model candidate | Use when |
|---|---|---|---|---|
| fast social / promo clips | `t2v` | `create video --prompt` | `v6` | speed and iteration matter more than strict continuity |
| consistent character / product / place | `i2v` | `create image` -> `create video --image` | image: `seedream-5.0-lite`; video: `v6` | the same subject must survive across shots |
| action / physical choreography | `t2v` or `i2v` | `create video` | `pixverse-c1` candidate | contact, transformation, VFX, or continuity is the hard part |
| higher-quality third-party comparison | `t2v` or `i2v` | `create video` | `seedance-2.0-standard`, `veo-3.1-standard`, `sora-2-pro` | user asks for the family or quality profile |
| mobile-first ideation | `t2v` | `create video` | `v6`, `grok-imagine` candidate | quick visual options matter |
| top-level narration | `assets.voiceText` | `create voice` | confirm with `pixverse voice models` | reusable narration audio is needed |
| BGM / music bed | external prep | `create music` | confirm with `pixverse music models` | music should be reviewed before render |
| motion reference | external prep | `create motion-control` | `v5.6` | prose cannot describe the motion reliably |
| first/last frame bridge | external prep | `create transition` | `v6` for 2 frames, `v5` for 3+ | exact start/end frames matter |
| localized video repair | external prep | `create modify` | `v5.5` | replace one object/background/keyframe detail |

## Model Selection Rules

### `v6`

Use as the default for Shotpack video jobs.

Best fit:

- everyday T2V / I2V production
- announcements, explainers, social promos, product clips
- `multi_shot` only when one clip genuinely needs internal movement
- extend / transition style work that should stay in PixVerse's current default family

Keep `v6` unless a concrete failure or user requirement points elsewhere.

### `pixverse-c1`

Use as an explicit candidate, not a silent default.

Consider it when:

- character or prop continuity is failing in V6
- the shot depends on physical contact, fast action, transformations, or VFX timing
- the prompt describes choreography rather than a simple camera move

Do not switch to C1 just because the shot should feel cinematic. First define what V6 failed to preserve.

### Seedance 2.0

Use when the requested output benefits from the Seedance feature surface:

- `seedance-2.0-standard`: higher-quality reference / transition candidates
- `seedance-2.0-fast`: faster exploratory alternatives
- lower-cost Seedance candidates only when they are listed in `references/model-constraints.md` or confirmed by live CLI help

Seedance reference can accept mixed references in CLI, but Shotpack's config path stays simpler. Treat mixed-reference work as an external prep step unless the pipeline is extended.

### Veo / Sora / Kling / Happy Horse

Treat these as provider-specific candidates.

Use when:

- the user explicitly asks for that model family
- fixed duration constraints fit the edit
- a comparison run is part of the plan
- the style profile is the point of the experiment

Do not use provider switching as the first response to a weak prompt.

### Grok Imagine

Use for fast ideation or when the user wants rough creative options.

Use only Grok model values listed in `references/model-constraints.md` or confirmed by live CLI help. If a Grok variant derives aspect ratio from an input image, check the still before planning a fixed-ratio edit.

### Image Models

Shotpack's image-first workflow currently treats `seedream-5.0-lite` as the practical reference-still default in `references/model-constraints.md`.

Use:

- `seedream-5.0-lite`: reference stills and higher-resolution I2V anchors
- `gpt-image-2.0`: high-detail still generation where `detailLevel` matters
- `gemini-3.1-flash`: character or composition consistency when that family is desired
- `qwen-image`: simple default still generation when the CLI default is acceptable

If the reference still is weak, regenerate the still instead of overloading the I2V motion prompt.

### Voice / Music

Use `assets.voiceText` for narration that Remotion should read as top-level `audio.src`.

- `create voice` uses `--client-request-id`, not the video/image idempotency key convention.
- Inspect live voice models / presets before a real voice run; do not assume a preset or model ID from older docs.
- `shots[].audio: true` means native video audio and is separate from narration.
- `create music` is not automated by `project.yaml`; inspect live music models, generate and review BGM separately, then reference the accepted local asset.

## Gate 1 Routing Package

Before PixVerse generation, the Director / Orchestrator should report:

- selected workflow: `t2v`, `i2v`, or local-only
- model per shot and why it was selected
- duration per shot and the role that drove it
- whether `multi_shot` or native `audio` is used
- reference still count and voice job count
- expected credit category from `references/credit-estimation.md`
- whether any external prep step is required

## Escalation Rules

| Problem | First response | Escalate only if |
|---|---|---|
| weak composition | improve prompt or reference still | repeated failure with clear prompt |
| character drift | switch to `i2v`, repeat identity anchors | I2V still drifts, then try C1 |
| product shape changes | stronger reference still and tighter prompt | repeated deformation after I2V |
| motion mismatch | simplify action and camera | a motion reference exists, then use motion-control |
| exact transition needed | use transition prep | normal I2V cannot bridge frames |
| low resolution accepted clip | upscale after QA pass | never before acceptance |
| clip too short but good | extend | only if the clip already passes visual QA |
| audio missing | generate voice/BGM separately | do not bury narration in visual prompt |

## Execution Safety

- `validate`, `plan`, `run --dry-run`, and local render are safe before approval.
- `run` without `--dry-run` can consume credits and needs explicit approval.
- Any direct `pixverse create ...` command can upload files or spend credits.
- Use `--json` for every agent-run CLI call.
- Use deterministic ids for retryable jobs: video/image uses `--idempotency-key`; voice uses `--client-request-id`.
- Check `pixverse account info --json` and `pixverse account slots --json` before batches.
