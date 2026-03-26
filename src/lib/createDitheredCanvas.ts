import type { DitheredImageOptions, ResolvedOptions } from "./types";
import { DEFAULTS, initState, tick, renderFrame } from "./engine";

function resolveOptions(opts?: DitheredImageOptions): ResolvedOptions {
  return {
    scale: opts?.scale ?? DEFAULTS.scale,
    dotScale: opts?.dotScale ?? DEFAULTS.dotScale,
    invert: opts?.invert ?? DEFAULTS.invert,
    gridSize: opts?.gridSize ?? DEFAULTS.gridSize,
    threshold: opts?.threshold ?? DEFAULTS.threshold,
    dotColor: opts?.dotColor ?? DEFAULTS.dotColor,
    mouseRadius: opts?.mouseRadius ?? DEFAULTS.mouseRadius,
    mouseForce: opts?.mouseForce ?? DEFAULTS.mouseForce,
    ease: opts?.ease ?? DEFAULTS.ease,
    jitter: opts?.jitter ?? DEFAULTS.jitter,
    padding: opts?.padding ?? DEFAULTS.padding,
    cornerRadius: opts?.cornerRadius ?? DEFAULTS.cornerRadius,
    preserveColors: opts?.preserveColors ?? DEFAULTS.preserveColors,
    shockwave: {
      speed: opts?.shockwave?.speed ?? DEFAULTS.shockwave.speed,
      width: opts?.shockwave?.width ?? DEFAULTS.shockwave.width,
      strength: opts?.shockwave?.strength ?? DEFAULTS.shockwave.strength,
      duration: opts?.shockwave?.duration ?? DEFAULTS.shockwave.duration,
    },
  };
}

/**
 * Attach the dithered image effect to a canvas element.
 * Returns a cleanup function.
 */
export function createDitheredCanvas(
  canvas: HTMLCanvasElement,
  imageSrc: string,
  options?: DitheredImageOptions
): () => void {
  const opts = resolveOptions(options);
  let raf: number | null = null;
  let disposed = false;

  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = imageSrc;

  const boot = () => {
    if (disposed) return;
    let state = initState(canvas, img, opts);

    const loop = (time: number) => {
      if (disposed) return;
      tick(state, time, opts);
      renderFrame(state, opts.dotColor);

      if (!state._firstRender) {
        state._firstRender = true;
        canvas.dataset.ready = "";
      }

      raf =
        state.mouseActive || state._needsAnim
          ? requestAnimationFrame(loop)
          : null;
    };

    raf = requestAnimationFrame(loop);

    const onResize = () => {
      state = initState(canvas, img, opts);
      if (!raf) raf = requestAnimationFrame(loop);
    };

    const getPos = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const { x, y } = getPos(e);
      state.mouseX = x;
      state.mouseY = y;
      state.mouseActive = true;
      if (!raf) raf = requestAnimationFrame(loop);
    };

    const onPointerLeave = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      state.mouseActive = false;
      if (!raf) raf = requestAnimationFrame(loop);
    };

    const onPointerUp = (e: PointerEvent) => {
      const { x, y } = getPos(e);
      state.shockwaves.push({ x, y, start: performance.now() });
      if (!raf) raf = requestAnimationFrame(loop);
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

  let teardown: (() => void) | undefined;

  if (img.complete) {
    teardown = boot();
  } else {
    img.onload = () => {
      teardown = boot();
    };
  }

  return () => {
    disposed = true;
    teardown?.();
  };
}
