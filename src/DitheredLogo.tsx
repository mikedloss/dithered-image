import { useRef, useEffect, useCallback } from "react";
import logoSrc from "./assets/universal-icon-light.png";

// --- Configuration ---

const DEFAULTS = {
  /** Fraction of canvas smaller dimension used for the logo */
  scale: 0.5,
  /** Multiplier for individual dot radius */
  dotScale: 1,
  /** true = dots fill a rounded‑rect *around* the logo (Linear‑style) */
  invert: true,
  /** Size of the normalized sampling grid (Linear uses 205) */
  gridSize: 170,
  /** Brightness threshold 0‑255: pixels darker than this count as "logo" */
  threshold: 128,
};

const SHOCKWAVE = {
  speed: 225,
  width: 37,
  strength: 20,
  duration: 675,
};

const MOUSE_RADIUS = 100;
const MOUSE_FORCE = 40;
const EASE = 0.12;

// --- Types ---

interface Dot {
  x: Float32Array;
  y: Float32Array;
  count: number;
}

interface State {
  ctx: CanvasRenderingContext2D;
  w: number;
  h: number;
  dpr: number;
  logo: Dot;
  renderX: Float32Array;
  renderY: Float32Array;
  dotSize: number;
  displaceX: Float32Array;
  displaceY: Float32Array;
  count: number;
  mouseX: number;
  mouseY: number;
  mouseActive: boolean;
  shockwaves: { x: number; y: number; start: number }[];
  _needsAnim: boolean;
  _hasDisplacement: boolean;
  _firstRender: boolean;
}

// --- Image → dot grid ---

function sampleImage(
  img: HTMLImageElement,
  canvasW: number,
  canvasH: number,
  cfg = DEFAULTS
): Dot {
  const G = cfg.gridSize;

  // Downsample image to a fixed grid (like Linear's 205×205)
  const off = document.createElement("canvas");
  off.width = G;
  off.height = G;
  const octx = off.getContext("2d")!;
  octx.drawImage(img, 0, 0, G, G);
  const pixels = octx.getImageData(0, 0, G, G).data;

  // Build logo mask: every grid cell that's part of the logo
  const logoSet = new Set<number>();
  for (let y = 0; y < G; y++) {
    for (let x = 0; x < G; x++) {
      const i = (y * G + x) * 4;
      const a = pixels[i + 3];
      if (a < 20) continue; // transparent = background
      const brightness = pixels[i] * 0.299 + pixels[i + 1] * 0.587 + pixels[i + 2] * 0.114;
      if (brightness < cfg.threshold) {
        logoSet.add(y * G + x);
      }
    }
  }

  let coords: [number, number][];

  if (cfg.invert) {
    // Bounding box of logo pixels
    let minX = G, maxX = 0, minY = G, maxY = 0;
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
    const pad = Math.round(0.22 * Math.min(bw, bh));
    const cornerRadius = Math.round(0.15 * Math.min(bw + pad * 2, bh + pad * 2));

    const rectLeft = minX - pad;
    const rectTop = minY - pad;
    const rectW = bw + pad * 2;
    const rectH = bh + pad * 2;

    const inRoundedRect = (px: number, py: number) => {
      const lx = px - rectLeft;
      const ly = py - rectTop;
      if (lx < 0 || lx >= rectW || ly < 0 || ly >= rectH) return false;
      if (
        (lx >= cornerRadius && lx < rectW - cornerRadius) ||
        (ly >= cornerRadius && ly < rectH - cornerRadius)
      )
        return true;
      let cx: number, cy: number;
      if (lx < cornerRadius && ly < cornerRadius) {
        cx = cornerRadius; cy = cornerRadius;
      } else if (lx >= rectW - cornerRadius && ly < cornerRadius) {
        cx = rectW - cornerRadius - 1; cy = cornerRadius;
      } else if (lx < cornerRadius && ly >= rectH - cornerRadius) {
        cx = cornerRadius; cy = rectH - cornerRadius - 1;
      } else {
        cx = rectW - cornerRadius - 1; cy = rectH - cornerRadius - 1;
      }
      const dx = lx - cx, dy = ly - cy;
      return dx * dx + dy * dy <= cornerRadius * cornerRadius;
    };

    // Fill rounded rect at spacing=1, skip logo pixels (exactly like Linear)
    coords = [];
    for (let y = rectTop; y < rectTop + rectH; y++) {
      for (let x = rectLeft; x < rectLeft + rectW; x++) {
        if (x < 0 || x >= G || y < 0 || y >= G) {
          // Outside image bounds but inside padded rect — include as dot
          if (inRoundedRect(x, y)) coords.push([x, y]);
        } else if (inRoundedRect(x, y) && !logoSet.has(y * G + x)) {
          coords.push([x, y]);
        }
      }
    }
  } else {
    coords = [];
    logoSet.forEach((key) => {
      const x = key % G;
      const y = (key - x) / G;
      coords.push([x, y]);
    });
  }

  // Map grid coords → canvas coords (centered, scaled)
  const gridSpan = cfg.invert
    ? Math.max(...coords.map(c => c[0])) - Math.min(...coords.map(c => c[0]))
    : G;
  const unitScale = Math.max(0.5, (Math.min(canvasW, canvasH) * cfg.scale) / gridSpan);
  const scaledW = G * unitScale;
  const scaledH = G * unitScale;
  const offsetX = Math.round((canvasW - scaledW) / 2);
  const offsetY = Math.round((canvasH - scaledH) / 2);

  const n = coords.length;
  const xArr = new Float32Array(n);
  const yArr = new Float32Array(n);

  // Seeded PRNG for deterministic jitter — breaks uniform grid patterns
  let seed = 12345;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed / 2147483647) * 2 - 1; // -1 to 1
  };
  const jitter = unitScale * 0.3;

  for (let i = 0; i < n; i++) {
    xArr[i] = offsetX + coords[i][0] * unitScale + rand() * jitter;
    yArr[i] = offsetY + coords[i][1] * unitScale + rand() * jitter;
  }

  return { x: xArr, y: yArr, count: n };
}


// --- Build state from canvas + image ---

function initState(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  cfg = DEFAULTS
): State {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const w = rect.width;
  const h = rect.height;
  canvas.width = w * dpr;
  canvas.height = h * dpr;

  const ctx = canvas.getContext("2d")!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const logo = sampleImage(img, w, h, cfg);
  const n = logo.count;

  const renderX = new Float32Array(n);
  const renderY = new Float32Array(n);
  const displaceX = new Float32Array(n);
  const displaceY = new Float32Array(n);

  const dotSize =
    Math.max(0.5, (Math.min(w, h) * cfg.scale) / cfg.gridSize) * cfg.dotScale;

  for (let i = 0; i < n; i++) {
    renderX[i] = logo.x[i];
    renderY[i] = logo.y[i];
  }

  return {
    ctx,
    w,
    h,
    dpr,
    logo,
    renderX,
    renderY,
    dotSize,
    displaceX,
    displaceY,
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

// --- Render frame ---

function renderFrame(s: State) {
  const { ctx, renderX, renderY, dotSize, count, w, h } = s;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "rgba(40, 40, 45, 0.9)";
  const sz = dotSize;
  for (let i = 0; i < count; i++) {
    ctx.fillRect(renderX[i], renderY[i], sz, sz);
  }
}

// --- Component ---

export function DitheredLogo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<State | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const buildState = useCallback((canvas: HTMLCanvasElement) => {
    if (!imgRef.current) return null;
    return initState(canvas, imgRef.current, DEFAULTS);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Load image first
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = logoSrc;
    imgRef.current = img;

    let raf: number | null = null;

    const start = () => {
      stateRef.current = buildState(canvas);
      if (!stateRef.current) return;

      const tick = (time: number) => {
        const s = stateRef.current;
        if (!s) return;
        s._needsAnim = false;

        const swDuration = SHOCKWAVE.duration;
        s.shockwaves = s.shockwaves.filter((sw) => time - sw.start < swDuration);
        const hasShockwaves = s.shockwaves.length > 0;

        if (s.mouseActive || hasShockwaves || s._hasDisplacement) {
          const mx = s.mouseX;
          const my = s.mouseY;
          const swScale = 1 + (s.shockwaves.length - 1) * 0.5;

          if (hasShockwaves) s._needsAnim = true;
          s._hasDisplacement = false;

          for (let i = 0; i < s.count; i++) {
            const ox = s.logo.x[i];
            const oy = s.logo.y[i];
            let fx = 0;
            let fy = 0;

            // Mouse repulsion — cubic falloff
            if (s.mouseActive) {
              const dx = ox + s.displaceX[i] - mx;
              const dy = oy + s.displaceY[i] - my;
              const dist2 = dx * dx + dy * dy;
              if (dist2 < MOUSE_RADIUS * MOUSE_RADIUS && dist2 > 0.1) {
                const dist = Math.sqrt(dist2);
                const t = 1 - dist / MOUSE_RADIUS;
                const force = t * t * t * MOUSE_FORCE;
                fx = (dx / dist) * force;
                fy = (dy / dist) * force;
              }
            }

            // Shockwave displacement
            for (let j = 0; j < s.shockwaves.length; j++) {
              const sw = s.shockwaves[j];
              const elapsed = (time - sw.start) / 1000;
              const ringDist = elapsed * SHOCKWAVE.speed;
              const fade = 1 - (time - sw.start) / swDuration;
              const dx = ox - sw.x;
              const dy = oy - sw.y;
              const d = Math.sqrt(dx * dx + dy * dy);
              if (d < 0.1) continue;
              const gap = Math.abs(d - ringDist);
              if (gap < SHOCKWAVE.width) {
                const strength =
                  (1 - gap / SHOCKWAVE.width) * fade * SHOCKWAVE.strength * swScale;
                fx += (dx / d) * strength;
                fy += (dy / d) * strength;
              }
            }

            // Ease displacement toward target
            s.displaceX[i] += (fx - s.displaceX[i]) * EASE;
            s.displaceY[i] += (fy - s.displaceY[i]) * EASE;
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

        renderFrame(s);

        if (!s._firstRender) {
          s._firstRender = true;
          canvas.dataset.ready = "";
        }

        raf = s.mouseActive || s._needsAnim ? requestAnimationFrame(tick) : null;
      };

      raf = requestAnimationFrame(tick);

      // Event handlers
      const onResize = () => {
        stateRef.current = buildState(canvas);
        if (!raf) raf = requestAnimationFrame(tick);
      };

      const getPos = (e: PointerEvent) => {
        const rect = canvas.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
      };

      const onPointerMove = (e: PointerEvent) => {
        const s = stateRef.current;
        if (!s || e.pointerType !== "mouse") return;
        const { x, y } = getPos(e);
        s.mouseX = x;
        s.mouseY = y;
        s.mouseActive = true;
        if (!raf) raf = requestAnimationFrame(tick);
      };

      const onPointerLeave = (e: PointerEvent) => {
        const s = stateRef.current;
        if (!s || e.pointerType !== "mouse") return;
        s.mouseActive = false;
        if (!raf) raf = requestAnimationFrame(tick);
      };

      const onPointerUp = (e: PointerEvent) => {
        const s = stateRef.current;
        if (!s) return;
        const { x, y } = getPos(e);
        s.shockwaves.push({ x, y, start: performance.now() });
        if (!raf) raf = requestAnimationFrame(tick);
      };

      window.addEventListener("resize", onResize);
      canvas.addEventListener("pointermove", onPointerMove);
      canvas.addEventListener("pointerleave", onPointerLeave);
      canvas.addEventListener("pointerup", onPointerUp);

      return () => {
        if (raf) cancelAnimationFrame(raf);
        window.removeEventListener("resize", onResize);
        canvas.removeEventListener("pointermove", onPointerMove);
        canvas.removeEventListener("pointerleave", onPointerLeave);
        canvas.removeEventListener("pointerup", onPointerUp);
      };
    };

    if (img.complete) {
      return start();
    } else {
      let cleanup: (() => void) | undefined;
      img.onload = () => {
        cleanup = start();
      };
      return () => cleanup?.();
    }
  }, [buildState]);

  return (
    <div className="dithered-wrapper">
      <canvas ref={canvasRef} className="dithered-canvas" />
    </div>
  );
}
