# gta6-trophy-guide-01

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Lisanye9527/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Lisanye9527/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

**Leonida Legend** — an offline guide and tracker for all 55 Grand Theft Auto VI PlayStation 5 trophies. Every trophy carries its official name, description and grade, a guide written for this app with its sources cited beside it, and the counters PlayStation tracks. The tracker saves your ticks in the browser (localStorage) with export and import, filters by kind (story, missable, collectibles, activities, online) and grade, and has a spoiler shield that hides story trophies until you earn them. A stage-by-stage roadmap lays out the road to the platinum — manual saves, the Chapter 1 balcony meditation, the time-sensitive Race Against Yago strand — and flags the missable trophies, all derived from the official descriptions and the launch guides cited in the app. It runs entirely from static files in `app/`: no build step, no network, no accounts.

## Run it

```sh
node serve.ts
# then open http://localhost:8080 in a desktop browser
```

To hand the entry in (copies `app/` and `screenshots/` to the output directory and writes `dossier.json`):

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Screenshots are real renders of the app in headless Chromium at 1280×800, produced by `take-screenshots.mjs` (see `shots.json` for what each one shows).

---
<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
