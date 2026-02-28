"use client";

import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Box,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useThemeMode } from "@/contexts/ThemeContext";
import { signOut } from "@/lib/firebase/auth";

interface HeaderProps {
  onMenuToggle: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const { user } = useAuth();
  const { mode, toggleTheme } = useThemeMode();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: "background.default",
        borderBottom: 1,
        borderColor: "divider",
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar>
        {isMobile && (
          <IconButton edge="start" onClick={onMenuToggle} sx={{ mr: 1 }}>
            <MenuIcon />
          </IconButton>
        )}

        <Typography variant="h6" sx={{ fontWeight: 600, flexGrow: 1, color: "text.primary" }}>
          Bundled
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton onClick={toggleTheme} size="small">
            {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>

          {user && (
            <>
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small">
                <Avatar
                  src={user.photoURL || undefined}
                  sx={{ width: 32, height: 32, bgcolor: "primary.main", fontSize: "0.875rem" }}
                >
                  {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              >
                <MenuItem disabled>
                  <Typography variant="body2">{user.displayName || user.email}</Typography>
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setAnchorEl(null);
                    signOut();
                  }}
                >
                  Sign out
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
