export interface DitheredImageOptions {
  /** Fraction of canvas smaller dimension used for the logo (default: 0.5) */
  scale?: number;
  /** Multiplier for individual dot size (default: 1) */
  dotScale?: number;
  /** true = dots fill a rounded-rect around the logo; false = dots ARE the logo (default: true) */
  invert?: boolean;
  /** Size of the normalized sampling grid - higher = more dots (default: 170) */
  gridSize?: number;
  /** Brightness threshold 0–255: pixels darker than this count as "logo" (default: 128) */
  threshold?: number;
  /** CSS color string for the dots (default: "rgba(40, 40, 45, 0.9)") */
  dotColor?: string;
  /** Radius of the cursor repulsion zone in CSS pixels (default: 140) */
  mouseRadius?: number;
  /** Strength of cursor repulsion (default: 40) */
  mouseForce?: number;
  /** How fast dots spring back - lower = floatier (default: 0.12) */
  ease?: number;
  /** Amount of random position jitter as a fraction of grid unit (default: 0.3) */
  jitter?: number;
  /** Padding around the logo as a fraction of logo bounding box (default: 0.22) */
  padding?: number;
  /** Corner radius of the outer rounded rect as a fraction (default: 0.15) */
  cornerRadius?: number;
  /** Preserve original image colors per-dot instead of using dotColor (default: false) */
  preserveColors?: boolean;
  /** Shockwave settings for click ripple effect */
  shockwave?: {
    speed?: number;
    width?: number;
    strength?: number;
    duration?: number;
  };
}

export interface DitheredState {
  ctx: CanvasRenderingContext2D;
  w: number;
  h: number;
  dpr: number;
  homeX: Float32Array;
  homeY: Float32Array;
  renderX: Float32Array;
  renderY: Float32Array;
  dotSize: number;
  colorR: Uint8Array | null;
  colorG: Uint8Array | null;
  colorB: Uint8Array | null;
  colorA: Uint8Array | null;
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

export type ResolvedOptions = Required<Omit<DitheredImageOptions, "shockwave" | "preserveColors">> & {
  preserveColors: boolean;
  shockwave: Required<NonNullable<DitheredImageOptions["shockwave"]>>;
};
