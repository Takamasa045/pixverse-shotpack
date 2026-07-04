# PixVerse Production Best Practices

このファイルは、Shotpack で PixVerse CLI を使う制作時の実務ルールです。
CLI の細かい制約は `references/model-constraints.md`、モデル選定は `references/model-routing.md`、prompt pattern は `references/prompt-library.md` を正とします。

## Production Loop

1. Define the output and acceptance criteria.
2. Normalize the request into `brief.md`, `storyboard.yaml`, and `project.yaml`.
3. Choose `t2v`, `i2v`, local-only, or an external prep step.
4. Pick model and duration per shot.
5. Write prompts as shot-level production instructions.
6. Run `validate`, `plan`, and `run --dry-run`.
7. Stop at Gate 1 before any credit-consuming generation.
8. Generate only after explicit approval.
9. Download, log, and keep failed assets as evidence.
10. QA before post-process, assembly, or render acceptance.

## Agent Rules

- Always read `SKILL.md` first, then the relevant `skills/*.skill.md`.
- Director reads `references/prompt-library.md`, `references/model-routing.md`, `references/model-constraints.md`, and `references/credit-estimation.md`.
- Shot Generator reads `references/pixverse-best-practices.md`, `references/model-routing.md`, `references/model-constraints.md`, `references/credit-estimation.md`, and `references/exit-codes.md`.
- Do not run PixVerse generation only to validate documentation.
- Do not upload private files to PixVerse unless the operator approved those exact files.
- Keep public docs generic; do not commit account details, token paths, private prompts, private assets, or raw credit balances.

## CLI Rules

- Use `--json` for every agent-run command.
- Capture stdout and stderr separately when scripting.
- Use `--no-wait` for batch jobs, then `task wait` or `task status --ids`.
- Use `--idempotency-key` for retryable video/image create steps.
- Use `--client-request-id` for `create voice`.
- Use `--prompt -`, `--text -`, or local prompt files for long text.
- Check `pixverse auth status --json` before generation.
- Check `pixverse account info --json` and `pixverse account slots --json` before batch generation.
- Keep one JSON response file per submitted job when running direct CLI batches.

## Prompt Rules

- A shot prompt is not a poem. It is an instruction for subject, action, environment, camera, lighting, and style boundary.
- Use concrete motion, not broad adjectives.
- Keep one primary action and one camera move per shot.
- Put narration in `assets.voiceText`, not the visual prompt.
- Put captions, titles, and readable copy in Remotion, not the generated video.
- In I2V, do not rewrite the appearance already fixed by the still image.
- In T2V, include enough appearance and setting detail because there is no reference still.
- If the first output fails, name the failed criterion before changing the prompt.

## T2V Best Practices

Use T2V when speed and breadth matter.

Good for:

- fast promo drafts
- social hooks
- atmosphere clips
- simple one-subject actions

Avoid:

- multi-shot story continuity without references
- stable character identity across many clips
- exact product geometry
- text-heavy visuals

Before generation:

- ensure `meta.workflow: t2v`
- verify each prompt can stand alone
- ensure every shot has model, quality, duration, aspect ratio
- ensure `multi_shot` is opt-in and justified

## I2V Best Practices

Use I2V when visual consistency matters.

Good for:

- character continuity
- product shape consistency
- fixed location or art direction
- Gate 1.5 reference-still review

Pattern:

```text
design anchors -> reference stills -> Gate 1.5 -> I2V motion prompts -> QA
```

Rules:

- Treat the reference still as the visual contract.
- Motion prompt should animate, not redesign.
- If the still is wrong, regenerate the still before video.
- Keep the accepted still even if the video job fails; retry the video first.
- Compare adjacent shots for identity, product shape, color, and lighting drift.

## Voice And Music

Voice:

- Use `assets.voiceText` when the whole video needs narration.
- Use `assets.voiceId` only after confirming a PixVerse preset voice ID.
- Keep voice text as spoken copy.
- Report voice job count in Gate 1.

Music:

- Generate BGM as an external prep step until pipeline automation exists.
- Review the audio before binding it to the project.
- Use exactly one direction for lyrics-capable music: lyrics, auto-lyrics, or instrumental.
- Store accepted public-safe audio as a local asset and reference it from config.

## Batch Production

Use batches when variants share the same structure.

Before batch:

- list planned variants
- count video, image, voice, BGM, extend, and upscale jobs
- check slots and credit budget
- use deterministic keys
- keep batch size within available slots

Do not call a batch complete until every submitted ID has succeeded or failed.

## QA

Machine QA:

- `dist/manifest.json` exists
- generated paths exist
- run-log and credits report exist
- duration, resolution, FPS, and audio streams are plausible
- black frames and silence are checked where relevant
- exact failed IDs and error strings are recorded

Visual QA:

- request fit
- subject identity
- product / prop shape
- action legibility
- camera motion
- continuity between shots
- caption and overlay safety
- sound and narration fit

## Regeneration

Regenerate only after naming the failed dimension.

| Failure | Preferred action |
|---|---|
| story or offer is weak | revise brief/storyboard before model changes |
| composition wrong | tighten prompt or reference still |
| character drift | use I2V anchors; then consider C1 if needed |
| product deformation | regenerate reference still, tighten material/shape wording |
| motion unclear | reduce action and camera complexity |
| clip good but short | extend after QA passes |
| accepted but low resolution | upscale after QA passes |
| audio missing | create voice/BGM as separate audio asset |
| generated text appears | remove text request and add Remotion overlay |

## Handoff Discipline

After generation or dry-run, report:

- config path
- run id
- workflow
- variant / shot count
- image, video, voice, post-process job counts
- estimated or actual credits
- output root
- manifest path
- failed/skipped shots and exact error strings

For docs-only changes, report that PixVerse generation was avoided.
