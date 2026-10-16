---
target: sfondo dell app (aloni)
total_score: 8
max_score: 12
na_heuristics: 1,3,5,6,7,9,10
p0_count: 0
p1_count: 1
target_identity: "file:/Users/vale/Documents/Corso/Capstone/SplitTrip/FE/src/index.css"
target_fingerprint: "sha256:6afbd7f6623bfa67c22dc6772e83e2c73271d5dc80a994fa7a1b3b595e141a52"
target_path: /Users/vale/Documents/Corso/Capstone/SplitTrip/FE/src/index.css
timestamp: 2026-10-16T10-05-28Z
slug: fe-src-index-css
---
⚠️ DEGRADED: single-context (no sub-agent spawning without an explicit user request in this session)

# Critique: app background halos (FE/src/index.css), v3.2

| # | Heuristic | Score | Note |
|---|---|---|---|
| 1 | Visibility of system status | n/a | a background carries no status |
| 2 | Match system / real world & brand | 3 | warm, travel feel; coral halo touches a colour with fixed meaning |
| 3 | User control | n/a | |
| 4 | Consistency & standards | 2 | breaks DESIGN.md «The Coral Means Owing Rule»; iOS ignores background-attachment: fixed |
| 5 | Error prevention | n/a | |
| 6 | Recognition | n/a | |
| 7 | Flexibility | n/a | |
| 8 | Aesthetic & minimalist | 3 | adds colour without noise; light teal halo too full behind greeting/cover |
| 9 | Error recovery | n/a | |
| 10 | Help | n/a | |
| Total | | 8/12 | Good (67%) |

Detector: FE/src 1 finding (broken-image) — false positive in PhotoViewer.test.tsx mock. In-page injection failed (detect.js not loaded after injection, 2 attempts).

## Priority issues
- [P1] Coral halo (and logo E coral tag) breaks «The Coral Means Owing Rule»: coral = devi dare; halo sits bottom-left near balance pills. Fix: amber/sand halo, or written exception (≤25% ambient wash, never behind amounts). /impeccable colorize
- [P2] iOS ignores background-attachment: fixed → halos scroll away on the main device. Fix: body::before fixed layer, z-index -1, pointer-events none. /impeccable adapt
- [P2] Light teal halo at 100% teal-soft too full behind greeting and featured cover. Fix: ~55% opacity, radius 36%. /impeccable quieter
- [P3] Sticky chat head/footer with solid var(--bg) cut the halos when scrolling. Fix: 90% bg + backdrop blur. /impeccable polish

## Minor
- Landing footer line sits on the coral halo, reads like a warning tint.
- DESIGN.md says coral-soft unused; now used by the background.
