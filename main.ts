// Wednesday 18 November 2026, summed up in a single picture.
// This program (Node 22, standard library only) draws a 1024x1024
// newspaper-style infographic and writes it to /output/entry.png.
// It reads nothing, asks the clock nothing and rolls no dice, so
// running it twice writes the very same bytes both times.
//
// Try it with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import * as fs from 'node:fs';
import { join as joinPath } from 'node:path';
import { Sheet } from './src/png.ts';
import type { Colour } from './src/png.ts';
import { print, flow, measure, cellH } from './src/font.ts';

// A printed front page: paper, ink, one accent colour per story.
const PAPER: Colour = { r: 250, g: 246, b: 238 };
const WHITE: Colour = { r: 255, g: 255, b: 255 };
const INK: Colour = { r: 20, g: 30, b: 55 };
const GRAY: Colour = { r: 88, g: 97, b: 112 };
const LINE: Colour = { r: 214, g: 207, b: 192 };
const RED: Colour = { r: 178, g: 34, b: 24 };
const BLUE: Colour = { r: 30, g: 76, b: 214 };
const TEAL: Colour = { r: 14, g: 116, b: 108 };
const AMBER: Colour = { r: 178, g: 82, b: 8 };
const GREEN: Colour = { r: 20, g: 126, b: 60 };
const SEA: Colour = { r: 188, g: 217, b: 253 };

type Card = {
  accent: Colour;
  num: string;
  kicker: string;
  headline: string;
  summary: string;
};

const HERO = {
  kicker: 'THE SUMMIT - SHENZHEN, CHINA',
  lines: ['XI AND PUTIN', 'MEET BEFORE', 'THE SUMMIT'],
  dek: 'THE CHINESE AND RUSSIAN LEADERS OPEN APEC TALKS IN SHENZHEN. THEIR FIRST THREE-WAY SUMMIT WITH TRUMP IS SET FOR THURSDAY.',
};

const CARDS: Card[] = [
  {
    accent: BLUE,
    num: '1',
    kicker: 'DIPLOMACY - MANILA',
    headline: 'QUAD MEETS IN MANILA',
    summary:
      'FIRST LEADER-LEVEL MEETING IN OVER TWO YEARS. TRUMP ANNOUNCES A TRADE DEAL WITH THE PHILIPPINES.',
  },
  {
    accent: AMBER,
    num: '2',
    kicker: 'THE GULF',
    headline: 'STRIKES ACROSS THE GULF',
    summary:
      'US JETS HIT A MISSILE SITE ON QESHM ISLAND. IRAN ANSWERS WITH DRONE STRIKES ON GULF BASES.',
  },
  {
    accent: RED,
    num: '3',
    kicker: 'WAR - UKRAINE',
    headline: 'KERCH BRIDGE HIT AGAIN',
    summary: 'UKRAINE STRIKES THE BRIDGE FOR A SECOND DAY. PART OF THE ROAD SPAN COLLAPSES.',
  },
  {
    accent: TEAL,
    num: '4',
    kicker: 'US POLITICS',
    headline: 'PELTOLA FLIPS ALASKA',
    summary: 'THE DEMOCRAT WINS THE SENATE SEAT, GIVING HER PARTY A 56-44 MAJORITY.',
  },
];

const CARD_AT = [
  { x: 28, y: 498 },
  { x: 516, y: 498 },
  { x: 28, y: 686 },
  { x: 516, y: 686 },
];

const STRIP = [
  {
    label: 'MONEY',
    labelColour: GREEN,
    title: 'NVIDIA POSTS RECORD $115.8B QUARTER',
    sub: "THE CHIPMAKER'S BOARD REJECTS BRINGING BACK ITS FORMER CHIEF.",
  },
  {
    label: 'SPORT',
    labelColour: AMBER,
    title: 'DHONI RETIRES FROM THE IPL',
    sub: 'THE CRICKET GREAT ENDS HIS INDIAN PREMIER LEAGUE CAREER.',
  },
];

const sheet = new Sheet(1024, 1024, PAPER);

// ---- Masthead ------------------------------------------------------------
sheet.box(28, 28, 968, 6, RED);
print(sheet, 'THE WORLD IN ONE PICTURE', 28, 44, 9, INK);
print(sheet, 'WEDNESDAY, 18 NOVEMBER 2026', 28, 96, 4, RED);
sheet.box(28, 128, 968, 2, INK);

// ---- Hero: the Shenzhen summit -------------------------------------------
sheet.box(28, 144, 968, 304, WHITE);
sheet.box(28, 144, 968, 10, RED);
sheet.border(28, 144, 968, 304, INK, 2);
print(sheet, HERO.kicker, 52, 174, 3, RED);
for (let i = 0; i < HERO.lines.length; i++) print(sheet, HERO.lines[i], 52, 206 + i * 48, 8, INK);
flow(sheet, HERO.dek, 52, 352, 560, 3, GRAY);

// Hero art: a globe with a marker on Shenzhen, above a city skyline.
const GX = 820;
const GY = 290;
const GR = 78;
sheet.fillCircle(GX, GY, GR, SEA);
// Land, all kept inside the globe.
sheet.fillCircle(795, 263, 21, TEAL);
sheet.fillCircle(843, 305, 17, TEAL);
sheet.fillCircle(802, 325, 13, TEAL);
sheet.fillCircle(842, 255, 9, TEAL);
// Latitude and longitude lines, clipped to the circle.
for (const dy of [-38, 0, 38]) {
  const half = Math.floor(Math.sqrt(GR * GR - dy * dy));
  sheet.seg(GX - half, GY + dy, GX + half, GY + dy, INK);
}
for (const dx of [-38, 0, 38]) {
  const half = Math.floor(Math.sqrt(GR * GR - dx * dx));
  sheet.seg(GX + dx, GY - half, GX + dx, GY + half, INK);
}
sheet.circle(GX, GY, GR, INK);
// Shenzhen marker.
sheet.fillCircle(858, 265, 6, RED);
sheet.circle(858, 265, 6, WHITE);
print(sheet, 'SHENZHEN', 776, 384, 3, RED);

// Skyline strip along the bottom of the hero panel.
let n = 0;
for (let x = 52; x < 968; x += 36) {
  const h = 10 + ((x * 11) % 19);
  sheet.box(x, 440 - h, 26, h, INK);
  if (n % 2 === 0) {
    sheet.box(x + 5, 440 - h + 4, 4, 5, PAPER);
    sheet.box(x + 15, 440 - h + 4, 4, 5, PAPER);
  }
  n++;
}

// ---- Section label ---------------------------------------------------------
sheet.box(28, 466, 14, 14, RED);
print(sheet, 'MORE OF THE DAY', 50, 464, 4, INK);

// ---- Story cards -----------------------------------------------------------
function drawCard(sheet: Sheet, at: { x: number; y: number }, card: Card): void {
  const { x, y } = at;
  sheet.box(x, y, 472, 168, WHITE);
  sheet.box(x, y, 472, 8, card.accent);
  sheet.border(x, y, 472, 168, INK, 2);
  // Number chip.
  sheet.fillCircle(x + 30, y + 36, 17, card.accent);
  print(
    sheet,
    card.num,
    x + 30 - Math.floor(measure(card.num, 4) / 2),
    y + 36 - Math.floor(cellH(4) / 2),
    4,
    WHITE,
  );
  print(sheet, card.kicker, x + 56, y + 28, 3, card.accent);
  const below = flow(sheet, card.headline, x + 20, y + 60, 432, 4, INK);
  flow(sheet, card.summary, x + 20, below + 8, 432, 3, GRAY);
}

for (let i = 0; i < CARDS.length; i++) drawCard(sheet, CARD_AT[i], CARDS[i]);

// ---- Bottom strip: money and sport ---------------------------------------
sheet.box(28, 874, 968, 96, WHITE);
sheet.border(28, 874, 968, 96, INK, 2);
sheet.seg(512, 886, 512, 958, LINE);

const STRIP_X = [48, 540];
for (let i = 0; i < STRIP.length; i++) {
  const item = STRIP[i];
  const sx = STRIP_X[i];
  print(sheet, item.label, sx, 886, 3, item.labelColour);
  print(sheet, item.title, sx, 908, 3, INK);
  flow(sheet, item.sub, sx, 928, 440, 3, GRAY);
}

// ---- Footer ------------------------------------------------------------------
sheet.box(28, 984, 968, 2, INK);
const footer = 'SIX STORIES THAT DEFINED THE DAY';
print(sheet, footer, Math.floor((1024 - measure(footer, 3)) / 2), 996, 3, INK);

// ---- Write -------------------------------------------------------------------
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(joinPath(outDir, 'entry.png'), sheet.encode());
