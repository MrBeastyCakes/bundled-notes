"use client";

import { memo } from "react";
import { Box, Typography, Tooltip } from "@mui/material";
import { useDraggable } from "@dnd-kit/core";
import { getMorphProgress, TOOLTIP_DELAY_MS } from "./spaceTheme";
import { PLANET_DEFAULT_COLOR } from "@/lib/theme/colors";
import type { Note } from "@/lib/types";

interface PlanetProps {
  note: Note;
  radius: number;
  zoom: number;
  cardWidth: number;
  cardHeight: number;
  bundleColor?: string;
  isSelected?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function PlanetInner({
  note,
  radius,
  zoom,
  cardWidth,
  cardHeight,
  bundleColor,
  isSelected,
  onSelect,
  onEdit,
  onContextMenu,
}: PlanetProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: note.id,
    data: { note },
  });

  const morph = getMorphProgress(zoom);
  const color = bundleColor || PLANET_DEFAULT_COLOR;

  // Interpolate dimensions
  const diameter = radius * 2;
  const width = lerp(diameter, cardWidth, morph);
  const height = lerp(diameter, cardHeight, morph);
  const borderRadius = lerp(radius, 24, morph);

  // Content preview (only shown when morphing)
  const plainText = note.content.replace(/<[^>]*>/g, "").replace(/[#*_~`>]/g, "");
  const preview = plainText.slice(0, 100);
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;
  const dateStr = note.updatedAt.toLocaleDateString(undefined, { month: "short", day: "numeric" });

  // Title initial for circle mode
  const initial = (note.title || "?")[0].toUpperCase();

  const dragTransform = transform
    ? `translate3d(${transform.x / zoom}px, ${transform.y / zoom}px, 0)`
    : undefined;

  // Relative time for tooltip
  const now = Date.now();
  const diffMs = now - note.updatedAt.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const relativeTime =
    diffMins < 1 ? "just now" :
    diffMins < 60 ? `${diffMins}m ago` :
    diffMins < 1440 ? `${Math.floor(diffMins / 60)}h ago` :
    `${Math.floor(diffMins / 1440)}d ago`;

  const tooltipTitle = morph < 0.5
    ? `${note.title || "Untitled"} \u00b7 ${wordCount} words \u00b7 ${relativeTime}`
    : "";

  // Selection glow
  const selectionShadow = isSelected
    ? `0 0 ${radius * 0.8}px ${color}a0, 0 0 ${radius * 1.2}px ${color}60, 0 0 2px ${color}`
    : undefined;

  const boxShadow = selectionShadow
    || (isDragging
      ? `0 0 ${radius * 0.6}px ${color}80, 0 8px 32px rgba(0,0,0,0.4)`
      : `0 0 ${radius * 0.3}px ${color}40`);

  return (
    <Tooltip
      title={tooltipTitle}
      enterDelay={TOOLTIP_DELAY_MS}
      enterNextDelay={TOOLTIP_DELAY_MS}
      placement="top"
      arrow
      disableHoverListener={morph >= 0.5 || isDragging}
      slotProps={{
        tooltip: {
          sx: {
            bgcolor: "rgba(31,31,35,0.9)",
            backdropFilter: "blur(8px)",
            border: 1,
            borderColor: "divider",
            borderRadius: 2,
            fontSize: "0.7rem",
            maxWidth: 200,
          },
        },
      }}
    >
      <Box
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        data-context-target="planet"
        data-context-id={note.id}
        onClick={(e) => {
          if (!isDragging && !transform) {
            e.stopPropagation();
            onSelect?.();
          }
        }}
        onDoubleClick={(e) => {
          if (!isDragging && !transform) {
            e.stopPropagation();
            onEdit?.();
          }
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onContextMenu?.(e);
        }}
        sx={{
          width,
          height,
          borderRadius: `${borderRadius}px`,
          bgcolor: morph > 0.5 ? "background.paper" : "transparent",
          background: morph <= 0.5
            ? `radial-gradient(circle at 35% 35%, ${color}90, ${color}40 60%, ${color}20 100%)`
            : undefined,
          border: morph > 0.3 ? 1 : "none",
          borderColor: isSelected ? color : isDragging ? "primary.main" : "divider",
          borderLeft: morph > 0.5 && bundleColor ? `3px solid ${bundleColor}` : undefined,
          boxShadow,
          transform: dragTransform,
          cursor: isDragging ? "grabbing" : "pointer",
          zIndex: isDragging ? 1000 : isSelected ? 5 : 1,
          opacity: isDragging ? 0.85 : 1,
          display: "flex",
          flexDirection: "column",
          alignItems: morph < 0.3 ? "center" : "stretch",
          justifyContent: morph < 0.3 ? "center" : "flex-start",
          overflow: "hidden",
          p: morph > 0.3 ? 2 : 0,
          transition: isDragging ? "none" : "width 200ms ease, height 200ms ease, border-radius 200ms ease, background 200ms ease, box-shadow 200ms ease",
          touchAction: "none",
          userSelect: "none",
          // Offset so center of planet aligns with orbital position
          marginLeft: `${-width / 2}px`,
          marginTop: `${-height / 2}px`,
          "&:hover": {
            boxShadow: isSelected ? selectionShadow : `0 0 ${radius * 0.5}px ${color}60`,
          },
        }}
      >
        {/* Circle mode: show initial */}
        {morph < 0.3 && (
          <Typography
            sx={{
              color: "#fff",
              fontWeight: 700,
              fontSize: `${Math.max(12, radius * 0.6)}px`,
              textShadow: `0 0 8px ${color}`,
              lineHeight: 1,
              opacity: radius * zoom > 6 ? 1 : 0,
            }}
          >
            {initial}
          </Typography>
        )}

        {/* Morphing/Card mode: show full content */}
        {morph >= 0.3 && (
          <>
            <Typography
              variant="subtitle2"
              fontWeight={600}
              noWrap
              sx={{ opacity: Math.min(1, (morph - 0.3) / 0.3), mb: 0.5 }}
            >
              {note.title || "Untitled"}
            </Typography>

            {preview && morph > 0.5 && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  flex: 1,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  lineHeight: 1.4,
                  fontSize: "0.8rem",
                  opacity: Math.min(1, (morph - 0.5) / 0.3),
                }}
              >
                {preview}
              </Typography>
            )}

            {morph > 0.7 && (
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: "auto", pt: 0.5 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontSize="0.65rem"
                  sx={{ opacity: Math.min(1, (morph - 0.7) / 0.3) }}
                >
                  {dateStr}
                </Typography>
              </Box>
            )}
          </>
        )}
      </Box>
    </Tooltip>
  );
}

export default memo(PlanetInner);
