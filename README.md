# PixVerse Shotpack

Turn a brief or existing footage into intentional shots, focused repairs and a checked final edit.

[日本語](README.ja.md) · [Agent skill](SKILL.md) · [Operator guide](references/production-v1.md)

## Two entries, one production core

Character Pipeline owns recurring identity, wardrobe, voice and world revisions. [Shotpack](https://github.com/Takamasa045/pixverse-shotpack) owns the brief, shots, take adoption, edits and delivery. Both use the same `production.v1` contracts and execution ledger; Character does not launch a second production loop after handoff.

The shared core lives in Shotpack and is vendored byte-for-byte into Character Pipeline. Either checkout works independently. New work starts at `./bin/production`; previous YAML/Remotion workflows are explicit legacy routes.

## Ask naturally

“Plan a 20-second station story. Show the sequence and cost range before generating.”

“Fix the hand at 7–10 seconds and reuse the other accepted shots.”

“Finish these local clips with captions; no new generation.”

The agent prepares a production card, visible sequence, reference roles, unresolved requirements and a dry-run. Paid work requires the human's approved target, attempt limit and credit ceiling. Existing authorization covers the agreed scope.

## Start locally

Use **Node >=22.18**. Validation, planning, fixture tests and dry-run need no npm install, provider login or sibling repository.

```bash
./bin/production validate production-core/fixtures/station-story.json
./bin/production plan production-core/fixtures/station-story.json
./bin/production run production-core/fixtures/station-story.json --dry-run
node --test production-core/test/*.test.mjs
```

The included fixtures are planning-only: attach accepted references, real context, capability snapshots and price evidence before any generation. The default Canvas adapter requires a separately configured media download transport; it does not download media out of the box.

See the [operator guide](references/production-v1.md) for character registration, approved runs, resume, finishing, migration and three acceptance scenarios. Exact fields are in [the core contract](production-core/docs/CONTRACT.md). When both entries operate on one production, give them the same explicit SQLite `--db` path.

## What is checked

The core uses immutable entity revisions, resolved intent hashes, durable submission records, budget reservation, adopted takes and scoped invalidation. `completed` and `accepted` are separate. Known task IDs are resumed; uncertain submissions are blocked for reconciliation rather than automatically submitted again. Explicit `false` controls stay off. Canvas human edits must be merged without silent overwrite or a hidden Create submission.

Provider capabilities vary by account, region, model and mode. Fixture/mock success validates contracts, not picture quality, voice fidelity, lip sync, exact prices or every Canvas feature. Independent TTS over video is narration. The local FFmpeg/ffprobe adapter supports cuts, trim, fit/pad, audio mixing and SRT sidecars; crop, effects, styled/burned-in captions and complex transitions are blocked. Final creative review remains pending after technical render checks.

## Existing projects and rollback

Original code, fixtures and media remain in place. [Migration](references/production-v1.md#migration-and-rollback) produces a separate new result and report; it does not rewrite originals, regenerate assets or infer missing QA/costs. The previous entry-point documents are [archived verbatim](references/legacy-entrypoints.md). Keep original inputs, media, Git revision and ledger for rollback; do not run old and new paid workflows together.

This redesign has been exercised locally with fixtures; paid generation and real-world creative quality require a separate bounded evaluation. No provider account or private production media is needed for the offline route.
