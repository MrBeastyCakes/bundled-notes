"use client";

import { useState, useMemo } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { darkTheme, lightTheme } from "@/lib/theme/theme";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeContext } from "@/contexts/ThemeContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<"light" | "dark">("dark");

  const themeContextValue = useMemo(
    () => ({
      mode,
      toggleTheme: () => setMode((prev) => (prev === "dark" ? "light" : "dark")),
    }),
    [mode]
  );

  const theme = mode === "dark" ? darkTheme : lightTheme;

  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
        />
      </head>
      <body style={{ margin: 0 }}>
        <ThemeContext.Provider value={themeContextValue}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>{children}</AuthProvider>
          </ThemeProvider>
        </ThemeContext.Provider>
      </body>
    </html>
  );
}
