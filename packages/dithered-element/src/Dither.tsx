import {
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { snapdom } from "@zumer/snapdom";
import { createDitheredCanvas } from "@dloss/dithered-image/vanilla";
import type { DitheredImageOptions } from "@dloss/dithered-image/vanilla";
import type { DitherProps, DitherHandle } from "./types";

/**
 * Extract only the DitheredImageOptions from DitherProps,
 * leaving out the component-specific props.
 */
function extractOptions(props: DitherProps): DitheredImageOptions {
  const {
    children: _children,
    width: _width,
    height: _height,
    deps: _deps,
    className: _className,
    style: _style,
    ...options
  } = props;
  return options;
}

export const Dither = forwardRef<DitherHandle, DitherProps>(
  function Dither(props, ref) {
    const { children, width, height, deps, className, style } = props;

    const hiddenRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const cleanupRef = useRef<(() => void) | null>(null);
    const generationRef = useRef(0);
    const renderCountRef = useRef(0);

    const snapshot = useCallback(() => {
      const hidden = hiddenRef.current;
      const canvas = canvasRef.current;
      if (!hidden || !canvas) return;

      // Increment generation to discard stale snapshots
      const gen = ++generationRef.current;

      snapdom(hidden)
        .then((result) => result.toCanvas())
        .then((sourceCanvas) => {
          // Discard if a newer snapshot was started
          if (gen !== generationRef.current) return;

          const dataURL = sourceCanvas.toDataURL();

          // Clean up previous dithering engine
          cleanupRef.current?.();

          // Let the canvas use its CSS-driven layout size.
          // getBoundingClientRect (used by the engine) reads from layout,
          // so we need a frame for the browser to resolve dimensions.
          requestAnimationFrame(() => {
            if (gen !== generationRef.current) return;

            const rect = canvas.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return;

            const options = extractOptions(props);
            cleanupRef.current = createDitheredCanvas(canvas, dataURL, options);
          });
        })
        .catch((err) => {
          console.warn("[@dloss/dithered-element] snapshot failed:", err);
        });
    }, [props]);

    // Expose imperative refresh
    useImperativeHandle(ref, () => ({ refresh: snapshot }), [snapshot]);

    // Track renders so we can use it as a dependency
    renderCountRef.current += 1;

    // Snapshot effect: if deps is provided, use it; otherwise re-run every render
    // by including renderCountRef.current as a dependency
    const effectDeps = deps !== undefined ? deps : [renderCountRef.current];

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
      snapshot();
    }, effectDeps);

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        cleanupRef.current?.();
      };
    }, []);

    return (
      <div
        className={className}
        style={{
          position: "relative",
          ...(width != null ? { width } : {}),
          ...(height != null ? { height } : {}),
          ...style,
        }}
      >
        <div
          ref={hiddenRef}
          aria-hidden="true"
          style={{
            position: "absolute",
            left: -9999,
            top: -9999,
            width: width ?? "100%",
            pointerEvents: "none",
          }}
        >
          {children}
        </div>
        <canvas
          ref={canvasRef}
          style={{ display: "block", width: "100%", height: "100%" }}
        />
      </div>
    );
  }
);
