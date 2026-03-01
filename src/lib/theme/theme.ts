import { createTheme, type ThemeOptions } from "@mui/material/styles";
import { darkScheme, lightScheme } from "./colors";

const sharedOptions: ThemeOptions = {
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: "2.25rem", fontWeight: 600, lineHeight: 1.2, letterSpacing: "-0.02em" },
    h2: { fontSize: "1.75rem", fontWeight: 600, lineHeight: 1.3, letterSpacing: "-0.01em" },
    h3: { fontSize: "1.5rem", fontWeight: 600, lineHeight: 1.3 },
    h4: { fontSize: "1.25rem", fontWeight: 500, lineHeight: 1.4 },
    h5: { fontSize: "1.1rem", fontWeight: 500, lineHeight: 1.4 },
    h6: { fontSize: "1rem", fontWeight: 500, lineHeight: 1.4 },
    subtitle1: { fontSize: "1rem", fontWeight: 500, lineHeight: 1.5, letterSpacing: "0.01em" },
    subtitle2: { fontSize: "0.875rem", fontWeight: 500, lineHeight: 1.5, letterSpacing: "0.01em" },
    body1: { fontSize: "1rem", fontWeight: 400, lineHeight: 1.6, letterSpacing: "0.03em" },
    body2: { fontSize: "0.875rem", fontWeight: 400, lineHeight: 1.5, letterSpacing: "0.02em" },
    button: { fontSize: "0.875rem", fontWeight: 500, textTransform: "none", letterSpacing: "0.02em" },
    caption: { fontSize: "0.75rem", fontWeight: 400, lineHeight: 1.5, letterSpacing: "0.03em" },
    overline: { fontSize: "0.6875rem", fontWeight: 500, letterSpacing: "0.05em" },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          padding: "10px 24px",
          transition: "all 300ms cubic-bezier(0.2, 0, 0, 1)",
        },
        contained: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 28,
          transition: "all 300ms cubic-bezier(0.2, 0, 0, 1)",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 28,
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          transition: "all 300ms cubic-bezier(0.2, 0, 0, 1)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 12,
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRadius: 0,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 28,
          transition: "all 200ms cubic-bezier(0.2, 0, 0, 1)",
        },
      },
    },
  },
};

export const darkTheme = createTheme({
  ...sharedOptions,
  palette: {
    mode: "dark",
    primary: { main: darkScheme.primary, contrastText: darkScheme.onPrimary },
    secondary: { main: darkScheme.secondary, contrastText: darkScheme.onSecondary },
    error: { main: darkScheme.error, contrastText: darkScheme.onError },
    background: {
      default: darkScheme.surface,
      paper: darkScheme.surfaceContainer,
    },
    text: {
      primary: darkScheme.onSurface,
      secondary: darkScheme.onSurfaceVariant,
    },
    divider: darkScheme.outlineVariant,
  },
});

export const lightTheme = createTheme({
  ...sharedOptions,
  palette: {
    mode: "light",
    primary: { main: lightScheme.primary, contrastText: lightScheme.onPrimary },
    secondary: { main: lightScheme.secondary, contrastText: lightScheme.onSecondary },
    error: { main: lightScheme.error, contrastText: lightScheme.onError },
    background: {
      default: lightScheme.surface,
      paper: lightScheme.surfaceContainer,
    },
    text: {
      primary: lightScheme.onSurface,
      secondary: lightScheme.onSurfaceVariant,
    },
    divider: lightScheme.outlineVariant,
  },
});
