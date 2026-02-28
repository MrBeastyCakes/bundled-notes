"use client";

import { Box, Chip, IconButton, Tooltip, Avatar, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import CenterFocusStrongIcon from "@mui/icons-material/CenterFocusStrong";
import LogoutIcon from "@mui/icons-material/Logout";
import NotesIcon from "@mui/icons-material/Notes";
import StarIcon from "@mui/icons-material/Star";
import ArchiveIcon from "@mui/icons-material/Archive";
import DeleteIcon from "@mui/icons-material/Delete";
import { useThemeMode } from "@/contexts/ThemeContext";
import { useAuth } from "@/lib/hooks/useAuth";
import { signOut } from "@/lib/firebase/auth";
import type { NoteView } from "@/lib/types";

interface ViewOption {
  view: NoteView;
  label: string;
  icon: React.ReactElement;
}

const VIEW_OPTIONS: ViewOption[] = [
  { view: "active", label: "All", icon: <NotesIcon sx={{ fontSize: 16 }} /> },
  { view: "favorites", label: "Starred", icon: <StarIcon sx={{ fontSize: 16 }} /> },
  { view: "archived", label: "Archive", icon: <ArchiveIcon sx={{ fontSize: 16 }} /> },
  { view: "trash", label: "Trash", icon: <DeleteIcon sx={{ fontSize: 16 }} /> },
];

interface FloatingControlsProps {
  activeView: NoteView;
  onViewChange: (view: NoteView) => void;
  zoom: number;
  onResetViewport: () => void;
  onCreateNote: () => void;
  onOpenSearch: () => void;
  counts: { active: number; favorites: number; archived: number; trash: number };
}

export default function FloatingControls({
  activeView,
  onViewChange,
  zoom,
  onResetViewport,
  onCreateNote,
  onOpenSearch,
  counts,
}: FloatingControlsProps) {
  const { mode, toggleTheme } = useThemeMode();
  const { user } = useAuth();

  const countForView = (view: NoteView) => {
    const map: Record<NoteView, number> = {
      active: counts.active,
      favorites: counts.favorites,
      archived: counts.archived,
      trash: counts.trash,
    };
    return map[view];
  };

  return (
    <>
      {/* Top-left: App name */}
      <Box
        sx={{
          position: "absolute",
          top: 16,
          left: 16,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{
            color: "text.primary",
            letterSpacing: "-0.02em",
            userSelect: "none",
          }}
        >
          Notes
        </Typography>
      </Box>

      {/* Top-center: View filter pills */}
      <Box
        sx={{
          position: "absolute",
          top: 16,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 100,
          display: "flex",
          gap: 0.75,
          bgcolor: "background.paper",
          borderRadius: 6,
          p: 0.75,
          boxShadow: 2,
          border: 1,
          borderColor: "divider",
        }}
      >
        {VIEW_OPTIONS.map((opt) => (
          <Chip
            key={opt.view}
            icon={opt.icon}
            label={`${opt.label} (${countForView(opt.view)})`}
            size="small"
            variant={activeView === opt.view ? "filled" : "outlined"}
            color={activeView === opt.view ? "primary" : "default"}
            onClick={() => onViewChange(opt.view)}
            sx={{
              borderRadius: 4,
              fontWeight: activeView === opt.view ? 600 : 400,
              transition: "all 200ms ease",
            }}
          />
        ))}
      </Box>

      {/* Top-right: User controls */}
      <Box
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          bgcolor: "background.paper",
          borderRadius: 6,
          p: 0.5,
          boxShadow: 2,
          border: 1,
          borderColor: "divider",
        }}
      >
        <Tooltip title="Search (Ctrl+K)">
          <IconButton size="small" onClick={onOpenSearch}>
            <SearchIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title={mode === "dark" ? "Light mode" : "Dark mode"}>
          <IconButton size="small" onClick={toggleTheme}>
            {mode === "dark" ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
          </IconButton>
        </Tooltip>

        <Tooltip title="Sign out">
          <IconButton size="small" onClick={() => signOut()}>
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        {user?.photoURL && (
          <Avatar src={user.photoURL} sx={{ width: 28, height: 28 }} />
        )}
      </Box>

      {/* Bottom-right: Zoom indicator + reset + create */}
      <Box
        sx={{
          position: "absolute",
          bottom: 16,
          right: 16,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Tooltip title="Reset zoom">
          <Chip
            icon={<CenterFocusStrongIcon sx={{ fontSize: 16 }} />}
            label={`${Math.round(zoom * 100)}%`}
            size="small"
            onClick={onResetViewport}
            sx={{
              bgcolor: "background.paper",
              boxShadow: 2,
              border: 1,
              borderColor: "divider",
              borderRadius: 4,
              cursor: "pointer",
            }}
          />
        </Tooltip>

        <Tooltip title="New note (double-click canvas)">
          <IconButton
            onClick={onCreateNote}
            sx={{
              bgcolor: "primary.main",
              color: "primary.contrastText",
              boxShadow: 4,
              "&:hover": { bgcolor: "primary.dark" },
              width: 48,
              height: 48,
            }}
          >
            <AddIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </>
  );
}
