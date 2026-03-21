# Workflow: Image-First I2V Pipeline

Nano Banana（または外部画像生成）でリファレンス画像を先に作り、
PixVerse I2V でアニメーション化する。
**世界観の統一**が最優先の案件で使う。

---

## When to Use

| 条件 | T2V（従来） | Image-First I2V（本ワークフロー） |
|------|------------|--------------------------------|
| 色調・質感の一貫性 | ショット間でばらつきやすい | リファレンス画像で事前統一 |
| アートディレクション | prompt 依存 | 画像で確認 → 承認後に動画化 |
| リテイク | 全部やり直し | 画像だけ差し替えて再生成 |
| コスト | 低（T2V のみ） | やや高（画像生成 + I2V） |

**推奨シーン:** ブランド映像、PV、紹介動画など世界観の統一が重要な案件

---

## Pipeline Overview

```
brief.md → storyboard.yaml
    ↓
[Step 1] Nano Banana で 7枚のリファレンス画像を並列生成
    ↓
[Step 2] 画像レビュー → 承認（リテイクはここで）
    ↓
[Step 3] PixVerse I2V で画像→動画を並列生成
    ↓
[Step 4] manifest.json + Remotion 合成
```

---

## Step 1: リファレンス画像の生成

### 1a. プロンプト組み立て

storyboard の各 shot から以下を組み立てる:

```text
[shot.prompt の被写体・環境・ライティング],
[shot.framing に対応するキーワード（wide shot, close-up, etc.）],
[meta.style_notes（全ショット共通）],
cinematic film still
```

**重要:** camera movement はここでは入れない（静止画なので）。

### 1b. Nano Banana で生成

```
mcp__nano-banana-2__generate_image:
  prompt: <assembled_prompt>
  aspectRatio: "16:9"
  quality: "quality"
  purpose: "Reference image for AI video generation - cinematic film still"
  fileName: "shot-{NN}-ref"
```

- 全ショット **並列で** 生成する
- 出力先: `ref-images/shot-{NN}-ref.png`
- `meta.style_notes` を全画像で共通に保つことで色調統一

### 1c. 画像レビュー

全画像を Read ツールで表示し、以下を確認:
- 色調アークが storyboard の `color_temp` と合致しているか
- フレーミングが shot の `framing` と一致しているか
- 被写体が prompt の意図通りか

問題があるショットだけ再生成。全体の整合性が取れたら Step 2 へ。

---

## Step 2: PixVerse I2V 生成

### 2a. プロンプト組み立て（I2V 用）

```text
[camera_movement_text（語彙テーブルから）],
[shot.prompt の動きとアクション要素],
[meta.style_notes],
avoiding: [meta.prompt_negative]
```

**ポイント:** I2V では画像が被写体・色・構図を担うので、prompt は **動き** にフォーカスする。

### 2b. 並列生成（同時実行数に注意）

```bash
pixverse create video \
  --image ref-images/shot-{NN}-ref.png \
  --prompt "<i2v_prompt>" \
  --duration <sec> \
  --aspect-ratio 16:9 \
  --quality 1080p \
  --json
```

- PixVerse Pro の同時生成上限は **5本**
- 6本以上ある場合は最初の5本を並列 → 完了後に残りをリトライ
- exit code `500044`（concurrent limit）→ 他の生成完了後に再実行

### 2c. ダウンロード → リネーム

```bash
DEST="<remotion-project>/public/assets/video"
curl -sL "<video_url>" -o "$DEST/shot-{NN}-wide.mp4"
```

I2V の出力は `video_url` から直接 curl でダウンロードするのが最速。
`pixverse asset download` でも可。

---

## Step 3: オーディオ生成（推奨セット）

画像先行ワークフローではオーディオも同時に整える:

### BGM — ElevenLabs Music

```
mcp__elevenlabs__compose_music:
  prompt: <style に合わせた BGM プロンプト>
  music_length_ms: <total_duration * 1000>
```

### ナレーション — ElevenLabs TTS

```
mcp__elevenlabs__text_to_speech:
  text: <各フレーズ>
  voice_name: <日本語対応の voice>
  model_id: eleven_multilingual_v2
  language: ja
  stability: 0.6
  similarity_boost: 0.8
  speed: 0.85-0.9
```

**Tips:**
- 日本語ナレーションは `eleven_multilingual_v2` + `language: ja` が必須
- PixVerse TTS は lip-sync 用（既存動画が必要）なので、独立ナレーションには使えない
- `stability: 0.6` で自然なイントネーション、`speed: 0.85` でゆったりした語り

### SFX — ElevenLabs Sound Effects

```
mcp__elevenlabs__text_to_sound_effects:
  text: <効果音の説明>
  duration_seconds: <sec>
```

---

## Step 4: Remotion 合成

### 4a. manifest.json 更新

- `scenes[]` の `assets.videoSrc` を新しい I2V クリップに更新
- `audio.src` を BGM ファイルに更新
- timing（`startFrame`, `durationInFrames`）を再計算

### 4b. ShotpackPlayer.tsx にオーディオ追加

```tsx
{/* BGM */}
<Audio
  src={staticFile(`${AUDIO_BASE}/bgm.mp3`)}
  volume={(f) => {
    const fadeIn = interpolate(f, [0, fps * 2], [0, 0.4], { extrapolateRight: "clamp" });
    const fadeOut = interpolate(f, [totalFrames - fps * 3, totalFrames], [0.4, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return Math.min(fadeIn, fadeOut);
  }}
/>

{/* Narration */}
<Sequence from={Math.round(fps * startSec)} name="Narration NN">
  <Audio src={staticFile(`${AUDIO_BASE}/narration/narration-NN.mp3`)} volume={0.9} />
</Sequence>

{/* SFX */}
<Sequence from={0} durationInFrames={fps * 5} name="SFX: Wind">
  <Audio src={staticFile(`${AUDIO_BASE}/sfx/wind-ambient.mp3`)} volume={0.3} />
</Sequence>
```

### 4c. レンダリング

```bash
pnpm run build
# or: remotion render src/index.ts ShotpackPlayer out/shotpack.mp4
```

---

## Checklist

- [ ] 全リファレンス画像の色調が `meta.color_arc` に沿っている
- [ ] `meta.style_notes` が全画像で共通
- [ ] I2V prompt は動き（camera movement）にフォーカスしている
- [ ] 並列生成で同時実行上限（5本）を超えていない
- [ ] ナレーションは `eleven_multilingual_v2` + `language: ja`
- [ ] BGM の volume は 0.3-0.5（ナレーションを邪魔しない）
- [ ] manifest.json の timing が連続している（gap/overlap なし）

---

## 参考プロファイル

### sample-launch-film

- 7ショット / 26秒 / 16:9
- 画像生成 → PixVerse v5.6 I2V
- オーディオ構成例: ambient BGM + 日本語 TTS + SFX
- 期待効果: T2V 単体より色調・質感を統一しやすい
- クレジット目安: ~560 cr（I2V は T2V より低コストになりやすい）
