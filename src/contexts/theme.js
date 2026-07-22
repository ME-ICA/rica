import { createContext, useContext } from "react";

// Standalone home for the theme context so components can consume it without
// importing from the app entrypoint (index.js), which has module-level render
// side effects and would create a circular dependency.
export const ThemeContext = createContext();

export function useTheme() {
  return useContext(ThemeContext);
}
