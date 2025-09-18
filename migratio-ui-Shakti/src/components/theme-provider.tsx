"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// Infer the props directly from the component type
type Props = React.ComponentProps<typeof NextThemesProvider>;

export function ThemeProvider({ children, ...props }: Props) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
