import type { DitheredState, ResolvedOptions } from "./types";

// --- Defaults ---

export const DEFAULTS: ResolvedOptions = {
  scale: 0.5,
  dotScale: 1,
  invert: true,
  gridSize: 170,
  threshold: 128,
  dotColor: "rgba(40, 40, 45, 0.9)",
  preserveColors: false,
  mouseRadius: 140,
  mouseForce: 40,
  ease: 0.12,
  jitter: 0.3,
  padding: 0.22,
  cornerRadius: 0.15,
  shockwave: {
    speed: 225,
    width: 37,
    strength: 20,
    duration: 675,
  },
};

// --- Image → dot grid ---

interface DotGrid {
  x: Float32Array;
  y: Float32Array;
  colorR: Uint8Array | null;
  colorG: Uint8Array | null;
  colorB: Uint8Array | null;
  colorA: Uint8Array | null;
  count: number;
}

function sampleImage(
  img: HTMLImageElement,
  canvasW: number,
  canvasH: number,
  opts: ResolvedOptions
): DotGrid {
  const G = opts.gridSize;

  const off = document.createElement("canvas");
  off.width = G;
  off.height = G;
  const octx = off.getContext("2d")!;
  octx.drawImage(img, 0, 0, G, G);
  const pixels = octx.getImageData(0, 0, G, G).data;

  const logoSet = new Set<number>();
  for (let y = 0; y < G; y++) {
    for (let x = 0; x < G; x++) {
      const i = (y * G + x) * 4;
      if (pixels[i + 3] < 20) continue;
      const brightness =
        pixels[i] * 0.299 + pixels[i + 1] * 0.587 + pixels[i + 2] * 0.114;
      if (brightness < opts.threshold) {
        logoSet.add(y * G + x);
      }
    }
  }

  let coords: [number, number][];

  if (opts.invert) {
    let minX = G,
      maxX = 0,
      minY = G,
      maxY = 0;
    logoSet.forEach((key) => {
      const x = key % G;
      const y = (key - x) / G;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    });

    const bw = maxX - minX + 1;
    const bh = maxY - minY + 1;
    const pad = Math.round(opts.padding * Math.min(bw, bh));
    const cr = Math.round(
      opts.cornerRadius * Math.min(bw + pad * 2, bh + pad * 2)
    );

    const rl = minX - pad;
    const rt = minY - pad;
    const rw = bw + pad * 2;
    const rh = bh + pad * 2;

    const inRoundedRect = (px: number, py: number) => {
      const lx = px - rl;
      const ly = py - rt;
      if (lx < 0 || lx >= rw || ly < 0 || ly >= rh) return false;
      if (
        (lx >= cr && lx < rw - cr) ||
        (ly >= cr && ly < rh - cr)
      )
        return true;
      let cx: number, cy: number;
      if (lx < cr && ly < cr) {
        cx = cr;
        cy = cr;
      } else if (lx >= rw - cr && ly < cr) {
        cx = rw - cr - 1;
        cy = cr;
      } else if (lx < cr && ly >= rh - cr) {
        cx = cr;
        cy = rh - cr - 1;
      } else {
        cx = rw - cr - 1;
        cy = rh - cr - 1;
      }
      const dx = lx - cx,
        dy = ly - cy;
      return dx * dx + dy * dy <= cr * cr;
    };

    coords = [];
    for (let y = rt; y < rt + rh; y++) {
      for (let x = rl; x < rl + rw; x++) {
        if (x < 0 || x >= G || y < 0 || y >= G) {
          if (inRoundedRect(x, y)) coords.push([x, y]);
        } else if (inRoundedRect(x, y) && !logoSet.has(y * G + x)) {
          coords.push([x, y]);
        }
      }
    }
  } else {
    coords = [];
    logoSet.forEach((key) => {
      coords.push([key % G, ((key - (key % G)) / G)]);
    });
  }

  // Map grid → canvas coords
  const gridSpan = opts.invert
    ? Math.max(...coords.map((c) => c[0])) -
      Math.min(...coords.map((c) => c[0]))
    : G;
  const unitScale = Math.max(
    0.5,
    (Math.min(canvasW, canvasH) * opts.scale) / gridSpan
  );
  const scaledW = G * unitScale;
  const scaledH = G * unitScale;
  const offsetX = Math.round((canvasW - scaledW) / 2);
  const offsetY = Math.round((canvasH - scaledH) / 2);

  const n = coords.length;
  const xArr = new Float32Array(n);
  const yArr = new Float32Array(n);

  let seed = 12345;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed / 2147483647) * 2 - 1;
  };
  const jitterAmt = unitScale * opts.jitter;

  // Per-dot colors when preserveColors is on
  let rArr: Uint8Array | null = null;
  let gArr: Uint8Array | null = null;
  let bArr: Uint8Array | null = null;
  let aArr: Uint8Array | null = null;

  if (opts.preserveColors) {
    rArr = new Uint8Array(n);
    gArr = new Uint8Array(n);
    bArr = new Uint8Array(n);
    aArr = new Uint8Array(n);
  }

  for (let i = 0; i < n; i++) {
    const cx = coords[i][0];
    const cy = coords[i][1];
    xArr[i] = offsetX + cx * unitScale + rand() * jitterAmt;
    yArr[i] = offsetY + cy * unitScale + rand() * jitterAmt;

    if (opts.preserveColors && cx >= 0 && cx < G && cy >= 0 && cy < G) {
      const pi = (cy * G + cx) * 4;
      rArr![i] = pixels[pi];
      gArr![i] = pixels[pi + 1];
      bArr![i] = pixels[pi + 2];
      aArr![i] = pixels[pi + 3];
    } else if (opts.preserveColors) {
      aArr![i] = 0;
    }
  }

  return { x: xArr, y: yArr, colorR: rArr, colorG: gArr, colorB: bArr, colorA: aArr, count: n };
}

// --- State init ---

export function initState(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  opts: ResolvedOptions
): DitheredState {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const w = rect.width;
  const h = rect.height;
  canvas.width = w * dpr;
  canvas.height = h * dpr;

  const ctx = canvas.getContext("2d")!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const grid = sampleImage(img, w, h, opts);
  const n = grid.count;

  const renderX = new Float32Array(n);
  const renderY = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    renderX[i] = grid.x[i];
    renderY[i] = grid.y[i];
  }

  return {
    ctx,
    w,
    h,
    dpr,
    homeX: grid.x,
    homeY: grid.y,
    renderX,
    renderY,
    colorR: grid.colorR,
    colorG: grid.colorG,
    colorB: grid.colorB,
    colorA: grid.colorA,
    dotSize:
      Math.max(0.5, (Math.min(w, h) * opts.scale) / opts.gridSize) *
      opts.dotScale,
    displaceX: new Float32Array(n),
    displaceY: new Float32Array(n),
    count: n,
    mouseX: -9999,
    mouseY: -9999,
    mouseActive: false,
    shockwaves: [],
    _needsAnim: false,
    _hasDisplacement: false,
    _firstRender: false,
  };
}

// --- Physics tick ---

export function tick(s: DitheredState, time: number, opts: ResolvedOptions) {
  s._needsAnim = false;

  const sw = opts.shockwave;
  s.shockwaves = s.shockwaves.filter((w) => time - w.start < sw.duration);
  const hasShockwaves = s.shockwaves.length > 0;

  if (!s.mouseActive && !hasShockwaves && !s._hasDisplacement) return;

  const mx = s.mouseX;
  const my = s.mouseY;
  const swScale = 1 + (s.shockwaves.length - 1) * 0.5;
  const mr = opts.mouseRadius;
  const mr2 = mr * mr;
  const mf = opts.mouseForce;
  const ease = opts.ease;

  if (hasShockwaves) s._needsAnim = true;
  s._hasDisplacement = false;

  for (let i = 0; i < s.count; i++) {
    const ox = s.homeX[i];
    const oy = s.homeY[i];
    let fx = 0;
    let fy = 0;

    if (s.mouseActive) {
      const dx = ox + s.displaceX[i] - mx;
      const dy = oy + s.displaceY[i] - my;
      const dist2 = dx * dx + dy * dy;
      if (dist2 < mr2 && dist2 > 0.1) {
        const dist = Math.sqrt(dist2);
        const t = 1 - dist / mr;
        const force = t * t * t * mf;
        fx = (dx / dist) * force;
        fy = (dy / dist) * force;
      }
    }

    for (let j = 0; j < s.shockwaves.length; j++) {
      const wave = s.shockwaves[j];
      const elapsed = (time - wave.start) / 1000;
      const ringDist = elapsed * sw.speed;
      const fade = 1 - (time - wave.start) / sw.duration;
      const dx = ox - wave.x;
      const dy = oy - wave.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 0.1) continue;
      const gap = Math.abs(d - ringDist);
      if (gap < sw.width) {
        const strength =
          (1 - gap / sw.width) * fade * sw.strength * swScale;
        fx += (dx / d) * strength;
        fy += (dy / d) * strength;
      }
    }

    s.displaceX[i] += (fx - s.displaceX[i]) * ease;
    s.displaceY[i] += (fy - s.displaceY[i]) * ease;
    if (Math.abs(s.displaceX[i]) < 0.01) s.displaceX[i] = 0;
    if (Math.abs(s.displaceY[i]) < 0.01) s.displaceY[i] = 0;
    if (s.displaceX[i] !== 0 || s.displaceY[i] !== 0) {
      s._needsAnim = true;
      s._hasDisplacement = true;
    }

    s.renderX[i] = ox + s.displaceX[i];
    s.renderY[i] = oy + s.displaceY[i];
  }
}

// --- Render ---

export function renderFrame(s: DitheredState, dotColor: string) {
  const { ctx, renderX, renderY, dotSize, count, w, h, colorR, colorG, colorB, colorA } = s;
  ctx.clearRect(0, 0, w, h);

  if (colorR && colorG && colorB && colorA) {
    // Per-dot colors: quantize to reduce fillStyle changes
    const buckets = new Map<string, number[]>();
    for (let i = 0; i < count; i++) {
      if (colorA[i] < 20) continue;
      // Quantize to steps of 8 for batching
      const r = colorR[i] & 0xf8;
      const g = colorG[i] & 0xf8;
      const b = colorB[i] & 0xf8;
      const a = (colorA[i] >> 5) / 7;
      const key = `${r},${g},${b},${a.toFixed(2)}`;
      let arr = buckets.get(key);
      if (!arr) {
        arr = [];
        buckets.set(key, arr);
      }
      arr.push(i);
    }
    for (const [key, indices] of buckets) {
      const [r, g, b, a] = key.split(",");
      ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
      for (const i of indices) {
        ctx.fillRect(renderX[i], renderY[i], dotSize, dotSize);
      }
    }
  } else {
    ctx.fillStyle = dotColor;
    for (let i = 0; i < count; i++) {
      ctx.fillRect(renderX[i], renderY[i], dotSize, dotSize);
    }
  }
}
