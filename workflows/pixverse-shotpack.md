# Workflow: PixVerse Shotpack

AI エージェントがそのまま実行できる、実装準拠の手順書。
PixVerse CLI 1.0.3 を前提にし、コマンドは **必ず `--json` 付き** で扱う。

---

## Step 1: 入力ファイル確認

```bash
ls brief.md storyboard.yaml 2>/dev/null
```

分岐:

- `storyboard.yaml` がある → Step 2 へ
- `brief.md` だけある → Step 2 で storyboard を自動生成
- どちらもない → ユーザーにどちらかの提供を求めて停止

## Step 2: storyboard を確定する

### 2a. `storyboard.yaml` がある場合

以下を確認:

- `meta.title` がある
- `shots` が 1 件以上ある
- 各ショットに `id`, `prompt`, `type` がある
- `type` が `video | transition | image`
- `duration` は CLI 上 `1〜10` の範囲。未指定は `5`
- skill 実行前に `duration > 8` を `8` に cap し、後で `run-log.md` に記録する
- transition タイプは `keyframes` に 2 枚以上ある
- `camera.movement` が定義済み、または多様性ルールに従って補完できる
- `act`, `framing`, `color_temp` が妥当
- `cut` 比率, crossfade の位置, ECU 数, framing 連続などが `SKILL.md` の checklist を満たす

### 2b. `brief.md` しかない場合

brief から以下を抽出:

- タイトル → `meta.title`
- トーン / 色味 / 質感 → `meta.style_notes`, `meta.color_arc`
- キービジュアル → 各 shot の `prompt`
- ターゲット尺 → shot 数と act 配分
- Delivery → `meta.aspects`, `fps`
- Constraints → `meta.prompt_negative`, 禁止要素, camera 方針

自動生成時のルール:

- 6〜8 shots を基本にする
- Act 1 / 2 / 3 を割り当てる
- `camera.movement` は 4 種類以上、連続重複なし
- `zoom-in` / `zoom-out` は最大 1 回
- `duration` は 3〜8 秒で変化を付ける
- `transition` は `cut` を基本にし、`crossfade` は冒頭または act 境界だけ

`storyboard.yaml` を出力したら、Step 3 へ進む。

---

## Step 3: Gate 1 用の shot plan と credit budget を作る

wide pass を前提に credit を見積もる。

```bash
pixverse account info --json
```

使う値:

- 残高: `.credits.total`
- 推定コスト: `shot_count * 400`
- リトライ込みバッファ: `wide_estimate * 2`

表示内容:

```text
| # | ID      | Act | Framing | Camera       | Duration | Transition | Est.Cr | Prompt (先頭40字) |
|---|---------|-----|---------|--------------|----------|------------|--------|-------------------|
| 1 | shot-01 | 1   | wide    | aerial-drift | 3s       | crossfade  | 400 cr | Wide aerial shot... |

必要クレジット（wide 推定）: 2,400 cr
リトライバッファ込み: 4,800 cr
現在の残高: 47,271 cr
```

注意:

- `meta.aspects` に `"9:16"` があっても、この時点では wide だけ見積もる
- vertical pass は Gate 2 で別承認

ユーザーが承認したら Step 4。

---

## Step 4: 出力ディレクトリを作る

```bash
mkdir -p dist/clips dist/stills dist/audio
```

---

## Step 5: 16:9 primary pass を生成する

各 shot を順に処理する。

### 5a. prompt を組み立てる

順序:

```text
shot.prompt,
<camera_movement_text>,
meta.style_notes,
avoiding: meta.prompt_negative
```

negative prompt 専用フラグは現 CLI に存在しないので使わない。

### 5b. command を選ぶ

**video**

```bash
pixverse create video \
  --prompt "<assembled_prompt>" \
  --duration <capped_duration> \
  --aspect-ratio 16:9 \
  --quality <shot.quality or 1080p> \
  --model <shot.model or v5.6> \
  --json
```

I2V:

```bash
pixverse create video \
  --image "<shot.image>" \
  --prompt "<assembled_prompt>" \
  --duration <capped_duration> \
  --aspect-ratio 16:9 \
  --quality 1080p \
  --model <shot.model or v5.6> \
  --json
```

**transition**

```bash
pixverse create transition \
  --images "<shot.keyframes[0]>" "<shot.keyframes[1]>" \
  --prompt "<assembled_prompt>" \
  --duration <capped_duration> \
  --quality <shot.quality or 720p> \
  --model <shot.model or v5.6> \
  --json
```

**image**

```bash
pixverse create image \
  --prompt "<assembled_prompt>" \
  --aspect-ratio 16:9 \
  --quality <shot.quality or 1080p> \
  --model <shot.model or confirmed_image_model> \
  --json
```

### 5c. 実行モード

デフォルトは同期実行でよい。並列化したい場合だけ `--no-wait` を付け、返ってきた ID に対して:

```bash
pixverse task wait <video_or_image_id> --json
```

を実行する。

### 5d. exit code ハンドリング

| Exit | アクション |
|------|-----------|
| 0 | 続行 |
| 3 | `pixverse auth login --json` → 元コマンドを 1 回だけ再試行 |
| 4 | 即停止。以降は Step 8 で部分レポート |
| 5 | 同条件で 1 回だけ再試行 |
| 6 | duration / aspect / path などを補正して 1 回だけ再試行 |
| 1 / 2 | ログに記録し、必要なら 1 回だけ再試行してからスキップ |

### 5e. ダウンロードして rename する

video / transition:

```bash
pixverse asset download <video_id> --dest dist/clips --json
```

image:

```bash
pixverse asset download <image_id> --type image --dest dist/stills --json
```

rename 規則:

- video: `dist/clips/shot-<NN>-wide.mp4`
- transition: `dist/clips/shot-<NN>-trans.mp4`
- image: `dist/stills/shot-<NN>-still.png`

download は出力ファイル名を固定できない。新規ファイル名を確認し、既存ファイルと衝突しないことを確かめてから rename する。

### 5f. hero shot を upscale する

`hero: true` の shot だけ:

```bash
pixverse create upscale --video <video_id> --quality 1080p --json
```

必要なら再 download して元ファイルを置き換える。

### 5g. wide pass の結果を保持する

メモリまたは中間 JSON に以下を持つ:

```json
{
  "id": "shot-01",
  "status": "success",
  "video_id": 100001,
  "file": "clips/shot-01-wide.mp4",
  "credits_estimate": 400,
  "retries": 0,
  "duration_sec": 3
}
```

---

## Step 6: Gate 2 で 9:16 second pass を判断する

`meta.aspects` に `"9:16"` がなければこの step はスキップ。

ある場合:

1. wide pass 成功後にクレジット残高を再取得
2. 追加見積もりを提示
3. ユーザー承認後だけ `9:16` で再生成

```bash
pixverse account info --json
```

表示内容:

```text
16:9 生成完了。9:16 の second pass を実行しますか？
追加クレジット（推定）: 2,400 cr
現在の残高: 45,100 cr
```

実行時の rename:

- video: `shot-<NN>-vert.mp4`
- image: `shot-<NN>-still-vert.png`

重要:

- 現行 `RenderManifest` は per-scene で 1 本の asset しか持てない
- したがって `manifest.json` は wide のみを参照する
- vertical side output は `run-log.md` と `credits-report.json` に残す

---

## Step 7: placeholder audio と manifest を作る

### 7a. total duration を計算する

`duration_sec` の合計を出し、scene timing を確定する。

### 7b. consumer 互換の placeholder audio を用意する

`ffmpeg` が使えるなら:

```bash
ffmpeg \
  -f lavfi \
  -i anullsrc=r=48000:cl=stereo \
  -t <total_duration_sec> \
  -c:a pcm_s16le \
  dist/audio/shotpack-placeholder.wav \
  -y
```

`ffmpeg` がない場合は、同等の無音 WAV を別途用意して `dist/audio/shotpack-placeholder.wav` として配置する。

### 7c. `manifest.json` を構築する

現行 `RenderManifest` に合わせて以下を入れる:

- `project.id`, `project.name`, `project.version`, `primaryDeliverable`
- `audio.src`, `audio.durationInSeconds`, `audio.bpm`
- `theme`
- `deliverables` は **wide のみ**
- `thumbnail`
- `scenes[*]`

scene timing:

```text
startSec = 前 scene の endSec
endSec = startSec + durationSec
startFrame = Math.round(startSec * fps)
durationInFrames = Math.round(durationSec * fps)
```

asset path:

- video / transition は `clips/...`
- image は `videoSrc: null` と `stills: ["stills/..."]`

---

## Step 8: `run-log.md` と `credits-report.json` を出す

`run-log.md`:

- cap した duration
- retry 回数
- success / failed / skipped
- wide / vertical の出力先

`credits-report.json`:

```bash
pixverse account info --json
```

開始時 / 終了時の `.credits.total` から差分を出す。

---

## Step 9: Gate 3 で完了報告する

出す内容:

- 成功 / 失敗数
- 消費クレジット
- `dist/manifest.json`
- vertical side output の有無
- 失敗ショットがある場合だけ再試行確認

例:

```text
生成結果: 6/6 成功
消費クレジット: 2,100 cr
manifest: dist/manifest.json
vertical side output: なし
```

---

## Remotion への受け渡し

wide manifest をそのまま使う場合:

```bash
cp -r dist/clips <remotion-project>/public/assets/shotpack/video/
cp -r dist/stills <remotion-project>/public/assets/shotpack/stills/
cp -r dist/audio <remotion-project>/public/assets/shotpack/audio/
cp dist/manifest.json <remotion-project>/public/assets/shotpack/data/manifest.json
```

注意:

- `manifest.json` は wide だけを指す
- vertical side output を使うには consumer 側に aspect-aware asset selection を追加する必要がある
