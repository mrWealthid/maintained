// components/shells/AppShell.tsx
"use client";
import React from "react";
import { AppProvider } from "../contexts/AppContext";

export function AppShell({ children }: { children: React.ReactNode }) {
  return <AppProvider>{children}</AppProvider>;
}
