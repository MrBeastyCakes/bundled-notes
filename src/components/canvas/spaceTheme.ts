// Space-themed canvas constants

// --- Planet sizing (notes) ---
export const PLANET_MIN_RADIUS = 28; // px in canvas coords
export const PLANET_MAX_RADIUS = 70;
export const PLANET_CHAR_CAP = 5000; // chars beyond this don't increase size

// --- Zoom morph thresholds ---
export const MORPH_ZOOM_START = 1.2; // below this: pure circle
export const MORPH_ZOOM_END = 1.8; // above this: full card

// --- Orbit timing ---
export const NOTE_ORBIT_BASE_DURATION = 60; // seconds for one full orbit
export const STAR_ORBIT_BASE_DURATION = 120; // seconds for star orbiting black hole
export const ORBIT_DURATION_VARIANCE = 20; // +/- random seconds

// --- Star center ---
export const STAR_CENTER_RADIUS = 16; // px in canvas coords
export const STAR_GLOW_BLUR = 30; // px

// --- Black hole center ---
export const BLACK_HOLE_CENTER_RADIUS = 22;
export const BLACK_HOLE_RING_WIDTH = 4;

// --- Orbital layout ---
export const MIN_ORBITAL_RADIUS = 140; // minimum orbit radius
export const ORBITAL_GAP = 20; // px gap between planets on orbit
export const SYSTEM_MIN_SPACING = 500; // minimum px between star system centers
export const FREE_NOTE_GRID_GAP = 24;

// --- Interaction constants ---
export const SELECTION_GLOW_MULTIPLIER = 2.5;
export const HOVER_GLOW_MULTIPLIER = 1.5;
export const QUICK_ACTION_BUTTON_SIZE = 32; // px (unscaled)
export const QUICK_ACTION_RING_OFFSET = 20; // px offset from object edge
export const TOOLTIP_DELAY_MS = 600;

// --- Helpers ---

/** Compute planet radius from note content character count */
export function getPlanetRadius(content: string, title: string): number {
  const plainText = content.replace(/<[^>]*>/g, "");
  const charCount = plainText.length + (title?.length || 0);
  const clamped = Math.min(charCount, PLANET_CHAR_CAP);
  return PLANET_MIN_RADIUS + (PLANET_MAX_RADIUS - PLANET_MIN_RADIUS) * Math.sqrt(clamped / PLANET_CHAR_CAP);
}

/** Compute morph progress (0 = circle, 1 = card) from zoom level */
export function getMorphProgress(zoom: number): number {
  return Math.max(0, Math.min(1, (zoom - MORPH_ZOOM_START) / (MORPH_ZOOM_END - MORPH_ZOOM_START)));
}

/** Compute orbital radius so planets don't overlap */
export function computeOrbitalRadius(planetRadii: number[]): number {
  const count = planetRadii.length;
  if (count === 0) return 0;
  const totalDiameter = planetRadii.reduce((sum, r) => sum + r * 2, 0);
  const minRadius = (totalDiameter + count * ORBITAL_GAP) / (2 * Math.PI);
  return Math.max(MIN_ORBITAL_RADIUS, minRadius);
}

/** Evenly distribute start angles for N items */
export function distributeAngles(count: number): number[] {
  return Array.from({ length: count }, (_, i) => (2 * Math.PI * i) / count);
}

/** Get orbit duration with slight random variance (deterministic from id) */
export function getOrbitDuration(baseDuration: number, id: string): number {
  // Simple hash from id for deterministic "randomness"
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
  }
  const variance = (Math.abs(hash) % (ORBIT_DURATION_VARIANCE * 2)) - ORBIT_DURATION_VARIANCE;
  return baseDuration + variance;
}
