---
name: pixverse-shotpack
description: >
  Turn a brief or existing footage into an intentional sequence, scoped shot repairs,
  an editable timeline and checked delivery using the shared production.v1 core.
  Reuse Character Pipeline revisions only when recurring entities are needed.
---

# PixVerse Shotpack

Use this entry for a film, promo, story, product demonstration, local repair, or finishing supplied media. Start from the user's available material: brief, storyboard, existing takes, edit or final video. Character registration is optional for work without recurring people.

## Production workflow

1. Create a production card from the natural request: original text, purpose, audience, story, duration, mandatory elements, explicit language/aspect variants and assumptions. Do not expand requested combinations automatically.
2. Propose a sequence with stable shot IDs, each shot's purpose, action, camera, audio, edit duration, entry and exit states. Sum edit durations against the requested output. Choose rhythm for the story; uniform durations are acceptable when deliberately requested or justified.
3. Make the rough edit legible with text, supplied media and placeholders before high-quality generation. Identify the shot with the greatest creative risk first. Add new references only where needed; three-view sheets and image-first generation are optional tools, not mandatory phases.
4. Choose `editable_shot` for independent replaceable shots, `single_take` for continuous motion, or `native_sequence` for a native montage. State the editing tradeoff. A native sequence remains one parent take with source ranges; detecting cuts does not create independent generated shots. Resolve multi-shot explicitly per model/mode; never rely on an implicit ON default.
5. If recurring entities are needed, read frozen Character Pipeline revisions. Keep face/body, outfit, voice and world references distinct. For products, bind image to appearance and video/previsualization to motion. Use only the controls declared by the selected backend's current schema.
6. Plan and make the important approved work, review candidates, adopt takes, and expand only after the story works. Retain previous takes and their review history. Keep left/right position, gaze, movement, held objects, light and emotion continuous between shots.
7. Turn “the hand at 7–10 seconds” into an issue with shot/take, time range, expected/observed behavior and proposed fix. Caption changes should affect the edit and delivery, not video jobs. A changed shot invalidates only its dependents; unrelated accepted shots remain reusable.
8. Finish the adopted timeline with sound, captions and aspect-safe framing. Check full playback, wording, sound, identity, continuity and delivery specifications. Return the actual final files and adopted source assets with editing and resume records. If only a material pack was requested, deliver that explicitly.

A template or MiniApp may be a shorter route when its real output satisfies the brief and editing requirements. Read its schema and explain any loss of independently replaceable shots. Preserve exact logos/text using supplied assets or editorial overlays where necessary; do not guarantee generation can reproduce them.

## Shared execution contract

Use the root `./bin/production` entry point and the local `production-core/`. Read [`references/production-v1.md`](references/production-v1.md) for commands, migration and the three acceptance scenarios. [`production-core/docs/CONTRACT.md`](production-core/docs/CONTRACT.md) defines exact fields. Node >=22.18 is required; planning and tests need no npm install or login. Use JSON `production.v1` documents for new productions; increment the revision when changing persisted content.

1. Preserve the original request; separate assumptions from explicit requirements. Check available storage and existing assets before copying media.
2. Show the production card, changes, references by role, unresolved requirements, delivery variants and cost range. Run `validate`, `plan`, then `run --dry-run`; dry-run makes no provider calls.
3. Resolve current provider capabilities and actual region/workspace before proposing generation. Missing capability, price or context is a blocker, never permission to guess. Model and mode determine supported controls. A template/MiniApp is a candidate only after its actual input and output contract is read.
4. For paid work, record the human's approved scope, attempts and credit ceiling against the concrete plan. Existing valid approval covers work within that scope; do not ask again per job. `approve` records permission already given; it does not grant permission on the human's behalf. Unknown costs cannot be treated as zero.
5. Use one shared SQLite ledger and one backend owner per intent. Persist submission before external work; retain partial provider IDs even after errors. Resume known IDs. An unknown submission stays blocked for reconciliation; never submit again merely because it timed out. Voice/music tracing IDs do not guarantee provider deduplication.
6. Keep generated, downloaded, reviewed and accepted states separate. Check identity, continuity, technical properties, sound and story. A completed task does not mean an accepted take. Treat model-based QA as evidence; human creative acceptance is distinct.
7. Handle issues by shot/take and time range. Try editing, captions or audio correction before paid regeneration. Preserve original takes. Stale dependencies need review; `stale` does not authorize a new job.
8. Before Canvas mutation read capabilities and graph, validate the patch, apply it, then dispatch only owned targets. Merge base/local/remote changes; preserve human adoption and unmanaged nodes. Surface conflicts. Never add Create-only `task_type` to a Canvas schema that does not declare it, or send an in-flight Canvas job through Create.
9. Deliver only existing, accepted, checked files with timeline, subtitles when requested, provenance, costs (including unknowns), QA and resume information. A plan or placeholder path is not a finished MP4. Use finish adapters only for their supported operations; unsupported edits must be reported.

Explicit `false` controls must remain off at the provider boundary. IDs remain strings; production times use integer milliseconds. Do not store credentials in production data or publish private media, logs or account information. Never remove user files or caches to make room.

## Current limits and compatibility

The common core implements production state and adapter contracts; mock/fixture tests do not prove image quality, voice fidelity, lip sync, precise prices or all Canvas model capabilities. Verify these with a separately authorized bounded live trial. TTS over video is narration, not verified lip sync. Do not claim exact identity preservation, logo preservation or provider-wide exactly-once execution.

Previous YAML/manifest formats are compatibility inputs, not the new source of truth. Keep original files untouched; migration reports unresolved assets, QA and costs. [`references/legacy-entrypoints.md`](references/legacy-entrypoints.md) indexes the archived old instructions. `./bin/pipeline --legacy …` and the previous Remotion workflow are explicit legacy routes; do not use them by default or run old and new paid flows for the same work.
