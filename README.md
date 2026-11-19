[![make.fun · news-image-20261118](https://make.fun/badge/news-image-20261118.svg)](https://make.fun/bounty/news-image-20261118?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261118)
[![rank](https://make.fun/badge/news-image-20261118/llonelyboys-gif/news-image-20261118/rank.svg)](https://make.fun/bounty/news-image-20261118/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261118)
[![reward](https://make.fun/badge/news-image-20261118/llonelyboys-gif/news-image-20261118/reward.svg)](https://make.fun/bounty/news-image-20261118?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261118)

# The World in One Picture — 18 November 2026

Sum up Wednesday 18 November 2026's world news in one image, for the
[make.fun](https://make.fun/bounty/news-image-20261118) `news-image-20261118` bounty.

## What it is

`main.ts` (Node 22, standard library only) draws a 1024x1024 newspaper-style
infographic with its own bitmap font and PNG encoder — no network, no clock,
no randomness — and writes it to `/output/entry.png`.

Six stories define the day:

1. **The summit** — Xi and Putin meet in Shenzhen, ahead of Thursday's first three-way summit with Trump.
2. **Diplomacy** — the Quad meets in Manila at leader level for the first time in over two years.
3. **The Gulf** — US jets hit a missile site on Qeshm Island; Iran answers with drone attacks on bases in Kuwait and Bahrain.
4. **War** — Ukraine strikes the Kerch Bridge for a second day; part of the road span collapses.
5. **US politics** — Peltola flips Alaska, giving Democrats a 56-44 Senate majority.
6. **Money & sport** — Nvidia posts a record $115.8B quarter, and Dhoni retires from the IPL.

## Run

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Two runs write byte-identical files. The output is a 1024x1024 PNG, well under 1 MiB.

## License

MIT
