"use client";

import { useMemo, type ReactNode } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";

function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/**
 * Tema MUI derivado dos tokens de `globals.css` (fonte única de cores).
 * Usado apenas dentro de ferramentas carregadas no cliente (`ssr: false`),
 * por isso pode ler as variáveis CSS do documento e dispensa cache SSR do Emotion.
 */
export function MuiProvider({ children }: { children: ReactNode }) {
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          primary: {
            main: cssVar("--color-primary"),
            dark: cssVar("--color-primary-dark"),
            light: cssVar("--color-primary-light"),
            contrastText: cssVar("--color-on-primary"),
          },
          text: { primary: cssVar("--color-text"), secondary: cssVar("--color-text-muted") },
          divider: cssVar("--color-border"),
          background: { default: cssVar("--color-background"), paper: cssVar("--color-background") },
        },
        shape: { borderRadius: Number.parseInt(cssVar("--radius"), 10) || 3 },
        typography: { fontFamily: "inherit", button: { textTransform: "none" } },
        transitions: { create: () => "none" },
        components: {
          MuiButtonBase: { defaultProps: { disableRipple: true } },
        },
      }),
    [],
  );

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
