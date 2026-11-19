// A deterministic RGB raster and PNG writer, built only on Node's standard library.
// Drawing the same picture always produces the same bytes: no clock, no network,
// no randomness anywhere in here.

import { deflateSync } from 'node:zlib';

export type Colour = { r: number; g: number; b: number };

export function colour(r: number, g: number, b: number): Colour {
  return { r, g, b };
}

// CRC-32 (ISO 3309 polynomial 0xEDB88320), table generated once at load.
function makeTable(): number[] {
  const table: number[] = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      const low = c & 1;
      c >>>= 1;
      if (low) c ^= 0xedb88320;
    }
    table.push(c >>> 0);
  }
  return table;
}

const TABLE = makeTable();

function crc(buf: Buffer): number {
  let c = 0xffffffff;
  for (const byte of buf) {
    c = TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(kind: string, payload: Buffer): Buffer {
  const head = Buffer.alloc(8);
  head.writeUInt32BE(payload.length, 0);
  head.write(kind, 4, 'ascii');
  const tail = Buffer.alloc(4);
  tail.writeUInt32BE(crc(Buffer.concat([head.subarray(4), payload])), 0);
  return Buffer.concat([head, payload, tail]);
}

export class Sheet {
  readonly w: number;
  readonly h: number;
  private readonly data: Buffer;

  constructor(w: number, h: number, bg: Colour) {
    this.w = w;
    this.h = h;
    this.data = Buffer.alloc(w * h * 3);
    this.paint(bg);
  }

  paint(c: Colour): void {
    for (let i = 0; i < this.data.length; i += 3) {
      this.data[i] = c.r;
      this.data[i + 1] = c.g;
      this.data[i + 2] = c.b;
    }
  }

  put(x: number, y: number, c: Colour): void {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const i = (y * this.w + x) * 3;
    this.data[i] = c.r;
    this.data[i + 1] = c.g;
    this.data[i + 2] = c.b;
  }

  box(x: number, y: number, w: number, h: number, c: Colour): void {
    const x0 = x < 0 ? 0 : x;
    const y0 = y < 0 ? 0 : y;
    const x1 = x + w > this.w ? this.w : x + w;
    const y1 = y + h > this.h ? this.h : y + h;
    for (let yy = y0; yy < y1; yy++) {
      for (let xx = x0; xx < x1; xx++) this.put(xx, yy, c);
    }
  }

  /** Outline of thickness t (default 1). */
  border(x: number, y: number, w: number, h: number, c: Colour, t = 1): void {
    for (let i = 0; i < t; i++) {
      this.box(x + i, y + i, w - 2 * i, 1, c);
      this.box(x + i, y + h - 1 - i, w - 2 * i, 1, c);
      this.box(x + i, y + i, 1, h - 2 * i, c);
      this.box(x + w - 1 - i, y + i, 1, h - 2 * i, c);
    }
  }

  /** Bresenham line segment. */
  seg(x0: number, y0: number, x1: number, y1: number, c: Colour): void {
    let dx = x1 - x0;
    let dy = y1 - y0;
    const sx = dx >= 0 ? 1 : -1;
    const sy = dy >= 0 ? 1 : -1;
    dx = Math.abs(dx);
    dy = Math.abs(dy);
    let err = dx - dy;
    let x = x0;
    let y = y0;
    while (true) {
      this.put(x, y, c);
      if (x === x1 && y === y1) return;
      const e2 = err * 2;
      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }
      if (e2 < dx) {
        err += dx;
        y += sy;
      }
    }
  }

  fillCircle(cx: number, cy: number, r: number, c: Colour): void {
    for (let y = -r; y <= r; y++) {
      const half = Math.floor(Math.sqrt(r * r - y * y));
      for (let x = -half; x <= half; x++) this.put(cx + x, cy + y, c);
    }
  }

  circle(cx: number, cy: number, r: number, c: Colour): void {
    const steps = Math.max(24, r * 6);
    for (let i = 0; i < steps; i++) {
      const a = (i / steps) * Math.PI * 2;
      this.put(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r), c);
    }
  }

  /** Encode the raster as a PNG (8-bit RGB, color type 2). Deterministic bytes. */
  encode(): Buffer {
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(this.w, 0);
    ihdr.writeUInt32BE(this.h, 4);
    ihdr[8] = 8;
    ihdr[9] = 2;
    ihdr[10] = 0;
    ihdr[11] = 0;
    ihdr[12] = 0;
    const stride = this.w * 3;
    const raw = Buffer.alloc(this.h * (stride + 1));
    for (let y = 0; y < this.h; y++) {
      this.data.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
    }
    const idat = deflateSync(raw, { level: 9 });
    const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    return Buffer.concat([
      sig,
      makeChunk('IHDR', ihdr),
      makeChunk('IDAT', idat),
      makeChunk('IEND', Buffer.alloc(0)),
    ]);
  }
}
