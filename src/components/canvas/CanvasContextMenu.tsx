"use client";

import { memo } from "react";
import {
  Popover,
  MenuList,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Drawer,
  useMediaQuery,
  useTheme,
} from "@mui/material";

export interface ContextMenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  dividerAfter?: boolean;
  destructive?: boolean;
  disabled?: boolean;
}

interface CanvasContextMenuProps {
  open: boolean;
  anchorPosition: { x: number; y: number };
  items: ContextMenuItem[];
  onClose: () => void;
}

function CanvasContextMenuInner({
  open,
  anchorPosition,
  items,
  onClose,
}: CanvasContextMenuProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const glassBackground =
    theme.palette.mode === "dark"
      ? "rgba(31,31,35,0.92)"
      : "rgba(241,237,241,0.92)";

  const menuContent = (
    <MenuList sx={{ py: 0.5 }}>
      {items.map((item) => (
        <span key={item.id}>
          <MenuItem
            onClick={() => {
              item.onClick();
              onClose();
            }}
            disabled={item.disabled}
            sx={{
              py: 1,
              px: 2,
              minHeight: 40,
              color: item.destructive ? "error.main" : "text.primary",
              "&:hover": {
                bgcolor: item.destructive ? "error.main" : "action.hover",
                color: item.destructive ? "error.contrastText" : undefined,
                "& .MuiListItemIcon-root": {
                  color: item.destructive ? "error.contrastText" : undefined,
                },
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 32,
                color: item.destructive ? "error.main" : "text.secondary",
                "& .MuiSvgIcon-root": { fontSize: 18 },
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              slotProps={{
                primary: {
                  fontSize: "0.85rem",
                  fontWeight: 500,
                },
              }}
            />
          </MenuItem>
          {item.dividerAfter && <Divider sx={{ my: 0.5 }} />}
        </span>
      ))}
    </MenuList>
  );

  // Mobile: bottom sheet drawer
  if (isMobile) {
    return (
      <Drawer
        anchor="bottom"
        open={open}
        onClose={onClose}
        slotProps={{
          paper: {
            sx: {
              bgcolor: glassBackground,
              backdropFilter: "blur(16px)",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              pb: "env(safe-area-inset-bottom, 0px)",
            },
          },
        }}
        sx={{ zIndex: 9999 }}
      >
        {menuContent}
      </Drawer>
    );
  }

  // Desktop: positioned popover
  return (
    <Popover
      open={open}
      onClose={onClose}
      anchorReference="anchorPosition"
      anchorPosition={{ top: anchorPosition.y, left: anchorPosition.x }}
      transformOrigin={{ vertical: "top", horizontal: "left" }}
      slotProps={{
        paper: {
          sx: {
            bgcolor: glassBackground,
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            borderRadius: 3,
            border: 1,
            borderColor: "divider",
            boxShadow: 8,
            minWidth: 180,
            overflow: "hidden",
          },
        },
      }}
      sx={{ zIndex: 9999 }}
    >
      {menuContent}
    </Popover>
  );
}

export default memo(CanvasContextMenuInner);
