"use client";

import { useState } from "react";
import { Box, Toolbar } from "@mui/material";
import Header from "./Header";
import Sidebar from "./Sidebar";

const DRAWER_WIDTH = 280;

interface AppShellProps {
  children: React.ReactNode;
  activeBundleId: string | null;
  onSelectBundle: (bundleId: string | null) => void;
  onCreateBundle: (parentId: string | null) => void;
}

export default function AppShell({
  children,
  activeBundleId,
  onSelectBundle,
  onCreateBundle,
}: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Header onMenuToggle={() => setMobileOpen(!mobileOpen)} />
      <Sidebar
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        activeBundleId={activeBundleId}
        onSelectBundle={onSelectBundle}
        onCreateBundle={onCreateBundle}
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
