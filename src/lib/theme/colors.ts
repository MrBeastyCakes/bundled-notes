// M3 Expressive tonal palette derived from primary #565fff
// These are hand-mapped tonal values matching Material 3 color system

export const tonalPalette = {
  primary: {
    0: "#000000",
    10: "#0e0664",
    20: "#252197",
    30: "#3c39b3",
    40: "#565fff",
    50: "#6e75ff",
    60: "#8a8fff",
    70: "#a8abff",
    80: "#c5c6ff",
    90: "#e2e0ff",
    95: "#f2efff",
    99: "#fefbff",
    100: "#ffffff",
  },
  secondary: {
    0: "#000000",
    10: "#1b1b2e",
    20: "#303044",
    30: "#47465b",
    40: "#5f5e74",
    50: "#78768e",
    60: "#9290a8",
    70: "#adaac3",
    80: "#c8c5df",
    90: "#e5e1fb",
    95: "#f2efff",
    99: "#fefbff",
    100: "#ffffff",
  },
  tertiary: {
    0: "#000000",
    10: "#2d1228",
    20: "#44263e",
    30: "#5c3c55",
    40: "#76536d",
    50: "#906b87",
    60: "#ab85a1",
    70: "#c89fbb",
    80: "#e5bad7",
    90: "#ffd7f0",
    95: "#ffebf5",
    99: "#fffbff",
    100: "#ffffff",
  },
  error: {
    0: "#000000",
    10: "#410002",
    20: "#690005",
    30: "#93000a",
    40: "#ba1a1a",
    50: "#de3730",
    60: "#ff5449",
    70: "#ff897d",
    80: "#ffb4ab",
    90: "#ffdad6",
    95: "#ffedea",
    99: "#fffbff",
    100: "#ffffff",
  },
  neutral: {
    0: "#000000",
    4: "#0e0e11",
    6: "#131316",
    10: "#1b1b1f",
    12: "#1f1f23",
    17: "#2a2a2e",
    20: "#303034",
    22: "#353538",
    24: "#39393d",
    30: "#47464a",
    40: "#5f5e62",
    50: "#78767a",
    60: "#929094",
    70: "#adaaaf",
    80: "#c9c5ca",
    87: "#dbd7dc",
    90: "#e5e1e6",
    92: "#ebe7ec",
    94: "#f1edf1",
    95: "#f4f0f4",
    96: "#f7f2f7",
    98: "#fdf8fd",
    99: "#fefbff",
    100: "#ffffff",
  },
};

export const darkScheme = {
  primary: tonalPalette.primary[80],
  onPrimary: tonalPalette.primary[20],
  primaryContainer: tonalPalette.primary[30],
  onPrimaryContainer: tonalPalette.primary[90],
  secondary: tonalPalette.secondary[80],
  onSecondary: tonalPalette.secondary[20],
  secondaryContainer: tonalPalette.secondary[30],
  onSecondaryContainer: tonalPalette.secondary[90],
  tertiary: tonalPalette.tertiary[80],
  onTertiary: tonalPalette.tertiary[20],
  tertiaryContainer: tonalPalette.tertiary[30],
  onTertiaryContainer: tonalPalette.tertiary[90],
  error: tonalPalette.error[80],
  onError: tonalPalette.error[20],
  errorContainer: tonalPalette.error[30],
  onErrorContainer: tonalPalette.error[90],
  surface: tonalPalette.neutral[6],
  onSurface: tonalPalette.neutral[90],
  surfaceVariant: tonalPalette.neutral[30],
  onSurfaceVariant: tonalPalette.neutral[80],
  surfaceContainer: tonalPalette.neutral[12],
  surfaceContainerLow: tonalPalette.neutral[10],
  surfaceContainerHigh: tonalPalette.neutral[17],
  surfaceContainerHighest: tonalPalette.neutral[22],
  outline: tonalPalette.neutral[60],
  outlineVariant: tonalPalette.neutral[30],
  inverseSurface: tonalPalette.neutral[90],
  inverseOnSurface: tonalPalette.neutral[20],
};

export const lightScheme = {
  primary: tonalPalette.primary[40],
  onPrimary: tonalPalette.primary[100],
  primaryContainer: tonalPalette.primary[90],
  onPrimaryContainer: tonalPalette.primary[10],
  secondary: tonalPalette.secondary[40],
  onSecondary: tonalPalette.secondary[100],
  secondaryContainer: tonalPalette.secondary[90],
  onSecondaryContainer: tonalPalette.secondary[10],
  tertiary: tonalPalette.tertiary[40],
  onTertiary: tonalPalette.tertiary[100],
  tertiaryContainer: tonalPalette.tertiary[90],
  onTertiaryContainer: tonalPalette.tertiary[10],
  error: tonalPalette.error[40],
  onError: tonalPalette.error[100],
  errorContainer: tonalPalette.error[90],
  onErrorContainer: tonalPalette.error[10],
  surface: tonalPalette.neutral[98],
  onSurface: tonalPalette.neutral[10],
  surfaceVariant: tonalPalette.neutral[90],
  onSurfaceVariant: tonalPalette.neutral[30],
  surfaceContainer: tonalPalette.neutral[94],
  surfaceContainerLow: tonalPalette.neutral[96],
  surfaceContainerHigh: tonalPalette.neutral[92],
  surfaceContainerHighest: tonalPalette.neutral[90],
  outline: tonalPalette.neutral[50],
  outlineVariant: tonalPalette.neutral[80],
  inverseSurface: tonalPalette.neutral[20],
  inverseOnSurface: tonalPalette.neutral[95],
};

/** Canvas dot grid opacity — consumed by NoteCanvas for the background pattern */
export const GRID_DOT_OPACITY = 0.4;

// --- Space theme visual constants ---
export const STARFIELD_OPACITY = 0.3;
export const PLANET_GLOW_INTENSITY = 0.4;
export const STAR_GLOW_INTENSITY = 0.6;
export const BLACK_HOLE_RING_OPACITY = 0.7;
export const ORBIT_PATH_OPACITY = 0.12;
export const PLANET_DEFAULT_COLOR = "#8a8fff"; // unbundled note glow

// Preset bundle colors
export const bundleColors = [
  "#565fff", // Primary blue
  "#e79f41", // Amber
  "#4caf50", // Green
  "#ef5350", // Red
  "#ab47bc", // Purple
  "#26a69a", // Teal
  "#ff7043", // Deep orange
  "#42a5f5", // Light blue
  "#ec407a", // Pink
  "#8d6e63", // Brown
];
