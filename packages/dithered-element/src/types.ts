import type { DitheredImageOptions } from "@dloss/dithered-image/vanilla";

export interface DitherProps extends DitheredImageOptions {
  children: React.ReactNode;

  /** Canvas width in CSS pixels. If omitted, inferred from children's rendered size. */
  width?: number;
  /** Canvas height in CSS pixels. If omitted, inferred from children's rendered size. */
  height?: number;

  /**
   * Dependency array controlling when to re-snapshot the children.
   * - `undefined` (default): re-snapshot on every render
   * - `[]`: snapshot only on mount
   * - `[a, b]`: re-snapshot when `a` or `b` change
   */
  deps?: React.DependencyList;

  /** className applied to the outer wrapper div */
  className?: string;
  /** style applied to the outer wrapper div */
  style?: React.CSSProperties;
}

export interface DitherHandle {
  /** Imperatively trigger a re-snapshot of the children */
  refresh: () => void;
}
