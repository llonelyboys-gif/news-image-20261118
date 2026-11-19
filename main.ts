// Sum up Wednesday 18 November 2026's world news in one image.
// A deterministic program (Node 22, standard library only): it draws a
// 1024x1024 newspaper-style infographic with its own bitmap font and PNG
// encoder, and writes it to /output/entry.png. No network, no clock, no
// randomness, so two runs write byte-identical files.
//
// Run it locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { Canvas, rgb } from './src/png.ts';
import { drawText, drawParagraph, textW, lineH } from './src/font.ts';

const W = 1024;
const H = 1024;

// Palette: a printed front page — paper, ink, and one accent per story.
const PAPER = rgb(247, 243, 235);
const WHITE = rgb(255, 255, 255);
const INK = rgb(22, 33, 58);
const GRAY = rgb(91, 100, 114);
const LINE = rgb(217, 210, 194);
const RED = rgb(180, 35, 24);
const BLUE = rgb(29, 78, 216);
const TEAL = rgb(15, 118, 110);
const AMBER = rgb(180, 83, 9);
const GREEN = rgb(21, 128, 61);
const SEA = rgb(191, 219, 254);
const GOLD = rgb(196, 154, 43);

const cv = new Canvas(W, H, PAPER);

// ---- Masthead ------------------------------------------------------------
cv.rect(32, 30, 960, 6, RED);
drawText(cv, 'THE WORLD IN ONE PICTURE', 32, 46, 5, INK);
drawText(cv, 'WEDNESDAY, 18 NOVEMBER 2026', 32, 94, 3, RED);
cv.rect(32, 126, 960, 2, INK);

// ---- Hero: Xi and Putin meet in Shenzhen -----------------------------------
const HERO_X = 32;
const HERO_Y = 142;
const HERO_W = 960;
const HERO_H = 310;
cv.rect(HERO_X, HERO_Y, HERO_W, HERO_H, WHITE);
cv.rect(HERO_X, HERO_Y, HERO_W, 10, RED);
cv.frame2(HERO_X, HERO_Y, HERO_W, HERO_H, INK);

drawText(cv, 'THE SUMMIT - SHENZHEN, CHINA', 56, 172, 2, RED);
drawText(cv, 'XI AND PUTIN', 56, 202, 5, INK);
drawText(cv, 'MEET BEFORE', 56, 243, 5, INK);
drawText(cv, 'THE SUMMIT', 56, 284, 5, INK);
drawParagraph(
  cv,
  'THE CHINESE AND RUSSIAN LEADERS OPEN APEC TALKS IN SHENZHEN. THEIR FIRST THREE-WAY SUMMIT WITH TRUMP IS SET FOR THURSDAY.',
  56,
  334,
  560,
  2,
  GRAY,
);

// Hero art: a globe with a marker on Shenzhen, over a city skyline.
const GX = 815;
const GY = 285;
const GR = 80;
cv.disc(GX, GY, GR, SEA);
// Land masses, all fully inside the globe.
cv.disc(790, 258, 22, TEAL);
cv.disc(840, 302, 18, TEAL);
cv.disc(798, 322, 14, TEAL);
cv.disc(838, 252, 10, TEAL);
// Latitude and longitude lines, clipped to the circle.
for (const dy of [-40, 0, 40]) {
  const half = Math.floor(Math.sqrt(GR * GR - dy * dy));
  cv.line(GX - half, GY + dy, GX + half, GY + dy, INK);
}
for (const dx of [-40, 0, 40]) {
  const half = Math.floor(Math.sqrt(GR * GR - dx * dx));
  cv.line(GX + dx, GY - half, GX + dx, GY + half, INK);
}
cv.ring(GX, GY, GR, INK);
// Shenzhen marker.
cv.disc(856, 262, 7, RED);
cv.ring(856, 262, 7, WHITE);
drawText(cv, 'SHENZHEN', 769, 380, 2, RED);

// Skyline strip along the bottom of the hero panel.
for (let x = 56; x < 960; x += 34) {
  const h = 12 + ((x * 7) % 17);
  cv.rect(x, 444 - h, 26, h, INK);
  if (x % 3 === 0) {
    cv.rect(x + 5, 444 - h + 4, 4, 5, PAPER);
    cv.rect(x + 15, 444 - h + 4, 4, 5, PAPER);
  }
}

// ---- Section label ---------------------------------------------------------
cv.rect(32, 470, 14, 14, RED);
drawText(cv, 'MORE OF THE DAY', 54, 468, 3, INK);

// ---- Story cards -----------------------------------------------------------
function card(
  x: number,
  y: number,
  w: number,
  h: number,
  accent: { r: number; g: number; b: number },
  num: string,
  kicker: string,
  headline: string,
  summary: string,
): void {
  cv.rect(x, y, w, h, WHITE);
  cv.rect(x, y, w, 8, accent);
  cv.frame2(x, y, w, h, INK);
  // Number chip.
  cv.disc(x + 30, y + 36, 17, accent);
  drawText(cv, num, x + 30 - Math.floor(textW(num, 3) / 2), y + 36 - Math.floor(lineH(3) / 2), 3, WHITE);
  drawText(cv, kicker, x + 56, y + 28, 2, accent);
  const afterHeadline = drawParagraph(cv, headline, x + 20, y + 60, w - 40, 3, INK);
  drawParagraph(cv, summary, x + 20, afterHeadline + 8, w - 40, 2, GRAY);
}

card(
  32,
  502,
  468,
  168,
  BLUE,
  '1',
  'DIPLOMACY - MANILA',
  'QUAD MEETS IN MANILA',
  'FIRST LEADER-LEVEL MEETING IN OVER TWO YEARS. TRUMP ANNOUNCES A TRADE DEAL WITH THE PHILIPPINES.',
);
card(
  524,
  502,
  468,
  168,
  AMBER,
  '2',
  'THE GULF',
  'STRIKES ACROSS THE GULF',
  'US JETS HIT A MISSILE SITE ON QESHM. IRAN ANSWERS WITH DRONE ATTACKS ON BASES IN KUWAIT AND BAHRAIN.',
);
card(
  32,
  690,
  468,
  168,
  RED,
  '3',
  'WAR - UKRAINE',
  'KERCH BRIDGE HIT AGAIN',
  'UKRAINE STRIKES THE BRIDGE FOR A SECOND DAY. PART OF THE ROAD SPAN COLLAPSES.',
);
card(
  524,
  690,
  468,
  168,
  TEAL,
  '4',
  'US POLITICS',
  'PELTOLA FLIPS ALASKA',
  'THE DEMOCRAT WINS THE SENATE SEAT, GIVING HER PARTY A 56-44 MAJORITY.',
);

// ---- Bottom strip: money and sport -----------------------------------------
const STRIP_Y = 878;
cv.rect(32, STRIP_Y, 960, 96, WHITE);
cv.frame2(32, STRIP_Y, 960, 96, INK);
cv.line(512, STRIP_Y + 12, 512, STRIP_Y + 84, LINE);

drawText(cv, 'MONEY', 52, STRIP_Y + 12, 2, GREEN);
drawText(cv, 'NVIDIA POSTS RECORD $115.8B QUARTER', 52, STRIP_Y + 34, 2, INK);
drawParagraph(cv, "THE CHIPMAKER'S BOARD REJECTS BRINGING BACK ITS FORMER CHIEF.", 52, STRIP_Y + 56, 440, 2, GRAY);

drawText(cv, 'SPORT', 544, STRIP_Y + 12, 2, AMBER);
drawText(cv, 'DHONI RETIRES FROM THE IPL', 544, STRIP_Y + 34, 2, INK);
drawParagraph(cv, 'THE CRICKET GREAT ENDS HIS INDIAN PREMIER LEAGUE CAREER.', 544, STRIP_Y + 56, 428, 2, GRAY);

// ---- Footer ------------------------------------------------------------------
cv.rect(32, 988, 960, 2, INK);
const footer = 'SIX STORIES THAT DEFINED THE DAY';
drawText(cv, footer, Math.floor((W - textW(footer, 2)) / 2), 1000, 2, INK);

// ---- Write -------------------------------------------------------------------
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(out, { recursive: true });
writeFileSync(join(out, 'entry.png'), cv.toPNG());
