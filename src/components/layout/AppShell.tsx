"use client";

import { useState } from "react";
import { Box, Toolbar } from "@mui/material";
import Header from "./Header";
import Sidebar from "./Sidebar";
import type { NoteView } from "@/lib/types";

const DRAWER_WIDTH = 280;

interface AppShellProps {
  children: React.ReactNode;
  activeBundleId: string | null;
  activeView: NoteView;
  onSelectBundle: (bundleId: string | null) => void;
  onSelectView: (view: NoteView) => void;
  onCreateBundle: (parentId: string | null) => void;
  counts: { active: number; favorites: number; archived: number; trash: number };
}

export default function AppShell({
  children,
  activeBundleId,
  activeView,
  onSelectBundle,
  onSelectView,
  onCreateBundle,
  counts,
}: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Header onMenuToggle={() => setMobileOpen(!mobileOpen)} />
      <Sidebar
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        activeBundleId={activeBundleId}
        activeView={activeView}
        onSelectBundle={onSelectBundle}
        onSelectView={onSelectView}
        onCreateBundle={onCreateBundle}
        counts={counts}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          bgcolor: "background.default",
          minHeight: "100vh",
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
