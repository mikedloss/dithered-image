import type { CSSProperties } from "react";
import type { DitheredImageOptions } from "@dloss/dithered-core";
import { useDitheredImage } from "./useDitheredImage";

interface DitheredImageProps extends DitheredImageOptions {
  /** Image source URL */
  src: string;
  /** CSS class for the wrapper div */
  className?: string;
  /** CSS styles for the wrapper div */
  style?: CSSProperties;
}

/**
 * React component that renders a dithered, interactive image.
 *
 * @example
 * ```tsx
 * <DitheredImage
 *   src="/logo.png"
 *   invert
 *   style={{ width: 500, height: 500 }}
 * />
 * ```
 */
export function DitheredImage({
  src,
  className,
  style,
  ...options
}: DitheredImageProps) {
  const canvasRef = useDitheredImage(src, options);

  return (
    <div className={className} style={style}>
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "100%" }}
      />
    </div>
  );
}
