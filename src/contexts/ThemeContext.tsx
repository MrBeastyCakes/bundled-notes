"use client";

import { createContext, useContext } from "react";

interface ThemeContextType {
  mode: "light" | "dark";
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  mode: "dark",
  toggleTheme: () => {},
});

export function useThemeMode() {
  return useContext(ThemeContext);
}
