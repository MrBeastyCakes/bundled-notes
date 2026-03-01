"use client";

import { memo, useMemo } from "react";
import { IconButton, Tooltip, useMediaQuery, useTheme } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import StarIcon from "@mui/icons-material/Star";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import PaletteIcon from "@mui/icons-material/Palette";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { motion, AnimatePresence } from "framer-motion";
import { QUICK_ACTION_BUTTON_SIZE, QUICK_ACTION_RING_OFFSET } from "./spaceTheme";
import type { Note, Bundle } from "@/lib/types";

interface QuickAction {
  id: string;
  icon: React.ReactNode;
  tooltip: string;
  onClick: (e?: React.MouseEvent) => void;
}

interface QuickActionRingProps {
  visible: boolean;
  selectedType: "planet" | "star" | "blackhole" | null;
  // Planet context
  note?: Note | null;
  onEditNote?: () => void;
  onToggleFavorite?: () => void;
  // Star/BlackHole context
  bundle?: Bundle | null;
  onRenameBundle?: () => void;
  onRecolorBundle?: () => void;
  // Common
  onOpenContextMenu?: (e: React.MouseEvent) => void;
  // Positioning
  centerX: number;
  centerY: number;
  objectRadius: number;
  zoom: number;
}

function QuickActionRingInner({
  visible,
  selectedType,
  note,
  onEditNote,
  onToggleFavorite,
  bundle,
  onRenameBundle,
  onRecolorBundle,
  onOpenContextMenu,
  centerX,
  centerY,
  objectRadius,
  zoom,
}: QuickActionRingProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const actions = useMemo((): QuickAction[] => {
    if (selectedType === "planet" && note) {
      return [
        {
          id: "edit",
          icon: <EditIcon sx={{ fontSize: 16 }} />,
          tooltip: "Edit",
          onClick: () => onEditNote?.(),
        },
        {
          id: "favorite",
          icon: note.favorited
            ? <StarIcon sx={{ fontSize: 16, color: "#ffc107" }} />
            : <StarOutlineIcon sx={{ fontSize: 16 }} />,
          tooltip: note.favorited ? "Unfavorite" : "Favorite",
          onClick: () => onToggleFavorite?.(),
        },
        {
          id: "more",
          icon: <MoreHorizIcon sx={{ fontSize: 16 }} />,
          tooltip: "More actions",
          onClick: (e?: React.MouseEvent) => onOpenContextMenu?.(e as React.MouseEvent),
        },
      ];
    }

    if ((selectedType === "star" || selectedType === "blackhole") && bundle) {
      return [
        {
          id: "rename",
          icon: <EditIcon sx={{ fontSize: 16 }} />,
          tooltip: "Rename",
          onClick: () => onRenameBundle?.(),
        },
        {
          id: "recolor",
          icon: <PaletteIcon sx={{ fontSize: 16 }} />,
          tooltip: "Change Color",
          onClick: () => onRecolorBundle?.(),
        },
        {
          id: "more",
          icon: <MoreHorizIcon sx={{ fontSize: 16 }} />,
          tooltip: "More actions",
          onClick: (e?: React.MouseEvent) => onOpenContextMenu?.(e as React.MouseEvent),
        },
      ];
    }

    return [];
  }, [selectedType, note, bundle, onEditNote, onToggleFavorite, onRenameBundle, onRecolorBundle, onOpenContextMenu]);

  if (!visible || actions.length === 0) return null;

  // Position buttons in a row below the selected object
  const compensatedSize = QUICK_ACTION_BUTTON_SIZE / zoom;
  const gap = 4 / zoom;
  const totalWidth = actions.length * compensatedSize + (actions.length - 1) * gap;
  const startX = centerX - totalWidth / 2;
  const yPos = centerY + objectRadius + QUICK_ACTION_RING_OFFSET / zoom;

  const glassBackground =
    theme.palette.mode === "dark"
      ? "rgba(31,31,35,0.85)"
      : "rgba(241,237,241,0.85)";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.15, staggerChildren: 0.03 }}
          style={{
            position: "absolute",
            left: startX,
            top: yPos,
            display: "flex",
            gap: gap,
            zIndex: 1001,
            pointerEvents: "auto",
          }}
        >
          {actions.map((action, i) => (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03, duration: 0.12 }}
            >
              <Tooltip
                title={isMobile ? "" : action.tooltip}
                placement="bottom"
                arrow
              >
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick(e as unknown as React.MouseEvent);
                  }}
                  sx={{
                    width: compensatedSize,
                    height: compensatedSize,
                    bgcolor: glassBackground,
                    backdropFilter: "blur(12px)",
                    border: 1,
                    borderColor: "divider",
                    color: "text.primary",
                    "&:hover": {
                      bgcolor: "action.hover",
                    },
                    // Scale inversely with zoom so buttons stay consistent size on screen
                    "& .MuiSvgIcon-root": {
                      fontSize: `${16 / zoom}px`,
                    },
                  }}
                >
                  {action.icon}
                </IconButton>
              </Tooltip>
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default memo(QuickActionRingInner);
