# Run Log

## Pipeline

- pipeline_id: `sp-20260330-143022`
- workflow: `i2v`
- started_at: `2026-03-30T14:30:22+09:00`
- finished_at: `2026-03-30T15:02:11+09:00`
- final_status: `ready_for_assembler`

## Shot Generation

| shot_id | model | duration | output | status | retries | credits |
|--------|-------|----------|--------|--------|---------|---------|
| shot-01 | v6 | 4s | dist/shot-01-primary.mp4 | success | 0 | 72 |
| shot-02 | v6 | 4s | dist/shot-02-primary.mp4 | success | 0 | 72 |
| shot-03 | v6 | 5s | dist/shot-03-primary.mp4 | success | 0 | 115 |
| shot-04 | v6 | 4s | dist/shot-04-primary.mp4 | success | 0 | 92 |
| shot-05 | v6 | 5s | dist/shot-05-primary.mp4 | retried | 1 | 115 |
| shot-06 | v6 | 8s | dist/shot-06-primary.mp4 | success | 0 | 184 |

## Reference Stills

| shot_id | ref_file | status | credits |
|--------|----------|--------|---------|
| shot-01 | dist/ref-shot-01.webp | success | 1 |
| shot-02 | dist/ref-shot-02.webp | success | 1 |
| shot-03 | dist/ref-shot-03.webp | success | 1 |
| shot-04 | dist/ref-shot-04.webp | success | 1 |
| shot-05 | dist/ref-shot-05.webp | success | 1 |
| shot-06 | dist/ref-shot-06.webp | success | 1 |

## Post-Processing

| shot_id | step | status | credits | output |
|--------|------|--------|---------|--------|
| shot-03 | upscale | success | 12 | dist/shot-03-primary.mp4 |
| shot-04 | sound | success | 8 | dist/shot-04-primary.mp4 |
| shot-06 | extend | success | 46 | dist/shot-06-primary.mp4 |
| shot-06 | sound | success | 16 | dist/shot-06-primary.mp4 |

## Errors

- `shot-05`: first generation failed with exit `5`; prompt_negative reinforced and retried successfully
