# AGENTS.md — pixverse-shotpack (Codex / OpenAI-agent entry point)

このリポジトリは、自然言語の映像依頼を `project.yaml` / `brief.md` / `storyboard.yaml` に正規化し、
PixVerse CLI → Remotion のパイプラインで `dist/manifest.json` と最終 MP4 まで組み立てる。

**正本は `SKILL.md`（Claude Code の skill 形式で書かれたオーケストレータ契約）。**
この `AGENTS.md` は同じ契約を Codex / OpenAI 系エージェントが follow できるよう橋渡しするミラー。
**まず `SKILL.md` を読む。曖昧な点は SKILL.md と各 `skills/*.skill.md` を正とする。**

## Read-first map

| 目的 | ファイル |
|------|---------|
| オーケストレータ契約（正本） | `SKILL.md` |
| オーケストレータ runbook | `workflows/orchestrator-flow.md` |
| T2V ショット生成 | `workflows/pixverse-shotpack.md` |
| Image-first / I2V（一貫性重視） | `workflows/image-first-i2v-pipeline.md` |
| creative 判断・Duration Design | `skills/director.skill.md` |
| PixVerse CLI 実行 | `skills/shot-generator.skill.md` |
| 後処理（extend/upscale/sound/speech） | `skills/post-processor.skill.md` |
| manifest 構築 | `skills/assembler.skill.md` |
| 料理ショート再現・横縦展開 | `skills/campfire-cooking-video.skill.md` |
| manifest schema | `references/manifest-schema.md` |
| exit code / retry 契約 | `references/exit-codes.md` |
| クレジット見積もり（実測校正済み） | `references/credit-estimation.md` |
| モデル制約 | `references/model-constraints.md` |

## Runtime entry（必ず `project.yaml` を入口にする）

1. `./bin/pipeline doctor   --config ./project.yaml`
2. `./bin/pipeline validate --config ./project.yaml`
3. `./bin/pipeline plan     --config ./project.yaml --format markdown`
4. `./bin/pipeline run      --config ./project.yaml --dry-run`
5. `./bin/pipeline run      --config ./project.yaml`
6. 必要なら `./bin/pipeline render --config ./project.yaml`

`assets.mode` は `local`（既存 asset を staged copy）か `pixverse`（CLI 生成）のどちらか。
複数の `project.*.yaml` がある場合は `--config ./project.<slug>.yaml` で対象を選ぶ。

## Gates（人間の承認で止まる）

- **Gate 1 storyboard approval**: ショット一覧 / workflow / 推定クレジット / shot ごとの model・duration・multi_shot・post_process / 合計尺と `meta.target_duration_seconds` の比較 を提示。`approve` / `revise` / `abort`。
- **Gate 1.5 reference-still approval**（`meta.workflow: i2v` かつ `image_ref: "generate"` のとき）: `approve` / `retry` / `abort`。
- **Gate 2 shot quality approval**: `dist/` の primary output 一覧 / run-log 要点 / 実績クレジット を提示。`approve_all` / `retry_specific` / `abort`。

## Non-Negotiable Rules（正本は SKILL.md。要約）

1. すべての PixVerse CLI コマンドに `--json` を付ける。
2. `dist/manifest.json` は `RenderManifest` 互換を維持する。
3. manifest に含めるのは primary pass の `16:9` だけ（`9:16` 等を primary にする場合は render 設定と consumer を合わせる）。
4. partial failure でも `dist/` の成果物を消さない。
5. retry 契約は `references/exit-codes.md` を正とする。
6. モデル制約は `references/model-constraints.md` を正とする。
7. クレジットは `references/credit-estimation.md` を基準にしつつ、CLI 実行の前後で `pixverse account info --json` を必ず実測して照合する。
8. `run-log.md` と `credits-report.json` は Assembler 完了前に揃える。
9. `multi_shot` は opt-in。1 scene = 1 file を崩さない。
10. duration は shot ごとに物語上の役割から決める。**全カットを一律尺（例: 全部 5 秒 / 6 秒）で割らない。** 均一割りは禁止。
11. 全 shot 一律 duration は、brief が明示要求し `meta.allow_uniform_duration: true` と `meta.uniform_duration_reason` がある場合だけ許す。
12. **一貫性が要る作品（同一キャラ・背景・小道具が複数 shot に跨る）は image-first で作る。** まず画像生成で design bible を固める: アンカー（世界 / キャラ / 場所）→ キャラ3面図・建物・小道具シート → 各 shot のキーフレーム（design bible を `--images` で参照）→ i2v（`--image`、必要なら `--audio`）。shot 間の一貫性を t2v の運任せにしない。詳細は `workflows/image-first-i2v-pipeline.md`。

## Codex / 非 Claude エージェント向けの注意

- **ツール対応**: Claude の `Bash` → Codex の shell、`Read` → ファイル読み、`Write`/`Edit` → `apply_patch`。`SKILL.md` / `skills/*.skill.md` 冒頭の YAML frontmatter（`name` / `allowed-tools` 等）は Claude 専用なので無視し、markdown 本文を契約として読む。
- **PixVerse CLI**: `pixverse create video|image … --json`。生成ごとに `--idempotency-key <slug-shot-NN>` を必ず付ける（fetch-failed 再試行での二重課金をバックエンドが重複排除する）。`--audio` でネイティブ音声 ON（C1 / V6 / Veo 系）。i2v は `create video --image <keyframe>`、複数参照画像は `create image --images a.png b.png`。固定 duration モデル（`sora-2`=4/8/12、`veo-3.1`=4/6/8）は許容値へ丸める。
- **shell は zsh**: 未クォートの `$var` は単語分割されない（フラグは配列 `("${arr[@]}")` か `${=var}` で渡す）。`status` は read-only 特殊変数なので変数名に使わない。
- **クレジットは並行セッションでドリフトする**: 残高差分ではなく各タスクの `cost_credits` を正とする。
- **生成映像にテキストを焼かない**: テロップ・タイトルは Remotion（`src/`）側のみ。consumer 契約（`dist/manifest.json`）は変更しない。

## 最小ワークフロー（Codex から1本作る場合）

1. 依頼を `brief.<slug>.md` / `storyboard.<slug>.yaml` / `project.<slug>.yaml` に正規化（既存の `*.jhorror-observation` / `*.yamamba-oide` を雛形にする）。
2. `validate` → `run --dry-run` でコマンドと推定クレジットを確認（消費ゼロ）→ Gate 1。
3. 一貫性が要るなら Rule 12 の image-first（design bible → keyframe → i2v）。
4. 生成 → 実測クレジット記録 → Gate 2。
5. `src/<slug>/` に Remotion composition を実装し `src/Root.tsx` に登録 → `npx remotion render src/index.ts <CompId> <out>.mp4`。
6. 最終 MP4 を必ず目視 QC（尺・カット順・音・テロップ・黒フレーム）。
