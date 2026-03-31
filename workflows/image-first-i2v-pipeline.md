# Workflow: Image-First I2V Shot Generator

`meta.workflow: "i2v"` の storyboard を受け取り、参照画像の生成または読込を行ったうえで PixVerse I2V を実行する runbook。Orchestrator から Gate 1 承認後に呼ばれる前提。PixVerse ネイティブモデルは `v6` を標準とする。

## Inputs

- `storyboard.yaml`
- 任意のローカル参照画像
- `dist/pipeline-state.json` があれば resume 情報

## Outputs

- `dist/ref-shot-01.webp` などの reference still
- `dist/shot-01-primary.mp4` などの primary asset
- `dist/run-log.md`
- `dist/pipeline-state.json`

## Step 1: Preflight

T2V と同じく、まず認証と残高を確認する。

```bash
pixverse auth status --json
pixverse account info --json
```

## Step 1.5: Reference Still Handling

`image_ref` ごとの扱い:

- `"generate"`: PixVerse image generation を使う
- ローカルパス: そのまま参照する
- `null`: storyboard 不備として Director へ差し戻す

生成時コマンド:

```bash
pixverse create image \
  --prompt "<shot.prompt>" \
  --model "<meta.image_generation.model>" \
  --quality "<meta.image_generation.quality>" \
  --aspect-ratio "<meta.image_generation.aspect_ratio>" \
  --json
```

download 後は `dist/ref-shot-01.webp` の形へ揃える。

## Gate 1.5

参照画像が生成されたら Orchestrator は以下を提示する。

- shot ごとの ref image
- image generation 実績クレジット
- 再生成対象 shot の指定方法

承認後のみ動画生成へ進む。

## Step 2: Submit I2V Jobs

```bash
pixverse create video \
  --prompt "<shot.prompt>" \
  --image "dist/ref-shot-01.webp" \
  --model "<shot.model>" \
  --quality "<shot.quality>" \
  --duration <shot.duration> \
  --aspect-ratio "<shot.aspect_ratio>" \
  $( [ "<shot.audio>" = "true" ] && echo "--audio" ) \
  $( [ "<shot.multi_shot>" = "true" ] && echo "--multi-shot" ) \
  --no-wait \
  --json
```

## Step 3: Wait / Retry / Download

基本方針は T2V と同じ。違いは以下。

- retry は ref image を保持したまま video job だけ再投入する
- `generation_failed` が ref image に起因する場合だけ Gate 1.5 へ戻す
- 参照画像と動画の対応を `run-log.md` に明示する
- `v6` の `multi_shot` は内部カメラ遷移を足したい shot にだけ使う

## Naming Rules

- reference still: `dist/ref-shot-01.webp`
- primary video: `dist/shot-01-primary.mp4`
- vertical side output: `dist/vertical/shot-01-secondary.mp4`

## Dry Run

dry run では以下を出す。

- reference still 生成予定コマンド
- video 生成予定コマンド
- Gate 1.5 の提示項目
- 予想ファイル一覧

## Handoff

全ショットの primary output が揃ったら、Orchestrator は Gate 2 へ進む。
