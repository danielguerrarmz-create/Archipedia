/**
 * AppShell — DEPRECATED light shell. Folded into the canonical dark studio
 * header (AppHeader) so there is ONE app header across Index / Canvas / Boards.
 * Kept as a thin wrapper for any legacy import sites.
 */
import React from "react";
import { AppHeader } from "./AppHeader";

interface AppShellProps {
  children?: React.ReactNode;
  activePage?: "search" | "boards" | "canvas";
}

export function AppShell({ children, activePage }: AppShellProps) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <AppHeader active={activePage} />
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

export default AppShell;
