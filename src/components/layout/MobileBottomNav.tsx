"use client";

import { BottomNavigation, BottomNavigationAction, Paper } from "@mui/material";
import AllInboxIcon from "@mui/icons-material/AllInbox";
import StarIcon from "@mui/icons-material/Star";
import SearchIcon from "@mui/icons-material/Search";
import SettingsIcon from "@mui/icons-material/Settings";
import type { NoteView } from "@/lib/types";

interface MobileBottomNavProps {
  activeView: NoteView;
  onSelectView: (view: NoteView) => void;
  visible: boolean;
}

export default function MobileBottomNav({ activeView, onSelectView, visible }: MobileBottomNavProps) {
  const viewToIndex: Record<string, number> = {
    active: 0,
    favorites: 1,
  };
  const indexToView: NoteView[] = ["active", "favorites"];

  return (
    <Paper
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1200,
        display: { xs: "block", md: "none" },
        transform: visible ? "translateY(0)" : "translateY(100%)",
        transition: "transform 300ms cubic-bezier(0.2, 0, 0, 1)",
      }}
      elevation={8}
    >
      <BottomNavigation
        value={viewToIndex[activeView] ?? 0}
        onChange={(_, newValue) => {
          onSelectView(indexToView[newValue] || "active");
        }}
        showLabels
        sx={{
          bgcolor: "background.paper",
          "& .MuiBottomNavigationAction-root": {
            minWidth: 0,
            py: 1,
          },
        }}
      >
        <BottomNavigationAction label="Notes" icon={<AllInboxIcon />} />
        <BottomNavigationAction label="Favorites" icon={<StarIcon />} />
        <BottomNavigationAction label="Search" icon={<SearchIcon />} />
        <BottomNavigationAction label="Settings" icon={<SettingsIcon />} />
      </BottomNavigation>
    </Paper>
  );
}
