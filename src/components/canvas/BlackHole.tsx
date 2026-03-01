"use client";

import { memo } from "react";
import { Box, Typography, Tooltip } from "@mui/material";
import { useDroppable } from "@dnd-kit/core";
import OrbitalRing from "./OrbitalRing";
import StarSystem from "./StarSystem";
import InlineRenameField from "./InlineRenameField";
import { BLACK_HOLE_CENTER_RADIUS, BLACK_HOLE_RING_WIDTH, TOOLTIP_DELAY_MS } from "./spaceTheme";
import { ORBIT_PATH_OPACITY } from "@/lib/theme/colors";
import type { BlackHoleLayout } from "./useCanvasLayout";
import type { Note } from "@/lib/types";

interface BlackHoleProps {
  layout: BlackHoleLayout;
  zoom: number;
  cardWidth: number;
  cardHeight: number;
  isDragging: boolean;
  onNoteSelect: (note: Note) => void;
  onNoteEdit: (note: Note) => void;
  selectedNoteId?: string | null;
  isSelected?: boolean;
  onSelect?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  isRenaming?: boolean;
  onRenameCommit?: (newName: string) => void;
  onRenameCancel?: () => void;
}

function BlackHoleInner({
  layout,
  zoom,
  cardWidth,
  cardHeight,
  isDragging,
  onNoteSelect,
  onNoteEdit,
  selectedNoteId,
  isSelected,
  onSelect,
  onContextMenu,
  isRenaming,
  onRenameCommit,
  onRenameCancel,
}: BlackHoleProps) {
  const { bundle, centerX, centerY, orbitalRadius, orbitingStars } = layout;

  const { isOver, setNodeRef } = useDroppable({
    id: `black-hole-${bundle.id}`,
    data: { bundleId: bundle.id },
  });

  const showLabel = zoom > 0.3;
  const r = BLACK_HOLE_CENTER_RADIUS;

  const totalNotes = orbitingStars.reduce(
    (sum, os) => sum + os.starSystem.planets.length,
    0
  );

  return (
    <Box
      ref={setNodeRef}
      data-context-target="blackhole"
      data-context-id={bundle.id}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onContextMenu?.(e);
      }}
      sx={{
        position: "absolute",
        left: centerX,
        top: centerY,
        width: 0,
        height: 0,
      }}
    >
      {/* Outer orbital path */}
      {orbitalRadius > 0 && (
        <Box
          sx={{
            position: "absolute",
            left: -orbitalRadius,
            top: -orbitalRadius,
            width: orbitalRadius * 2,
            height: orbitalRadius * 2,
            borderRadius: "50%",
            border: `1px dashed`,
            borderColor: `${bundle.color}${Math.round(ORBIT_PATH_OPACITY * 255).toString(16).padStart(2, "0")}`,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Droppable highlight */}
      {isOver && (
        <Box
          sx={{
            position: "absolute",
            left: -(orbitalRadius + 60),
            top: -(orbitalRadius + 60),
            width: (orbitalRadius + 60) * 2,
            height: (orbitalRadius + 60) * 2,
            borderRadius: "50%",
            bgcolor: `${bundle.color}10`,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Black hole center — dark core + accretion ring */}
      <Tooltip
        title={`${bundle.icon} ${bundle.name} \u00b7 ${orbitingStars.length} star${orbitingStars.length !== 1 ? "s" : ""} \u00b7 ${totalNotes} note${totalNotes !== 1 ? "s" : ""}`}
        enterDelay={TOOLTIP_DELAY_MS}
        placement="top"
        arrow
        disableHoverListener={isDragging}
        slotProps={{
          tooltip: {
            sx: {
              bgcolor: "rgba(31,31,35,0.9)",
              backdropFilter: "blur(8px)",
              border: 1,
              borderColor: "divider",
              borderRadius: 2,
              fontSize: "0.7rem",
            },
          },
        }}
      >
        <Box
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.();
          }}
          sx={{ display: "contents" }}
        >
          <Box
            sx={{
              position: "absolute",
              left: -(r + BLACK_HOLE_RING_WIDTH + 4),
              top: -(r + BLACK_HOLE_RING_WIDTH + 4),
              width: (r + BLACK_HOLE_RING_WIDTH + 4) * 2,
              height: (r + BLACK_HOLE_RING_WIDTH + 4) * 2,
              borderRadius: "50%",
              border: `${BLACK_HOLE_RING_WIDTH}px solid ${bundle.color}`,
              filter: "blur(2px)",
              opacity: isSelected ? 1 : 0.7,
              pointerEvents: "none",
              zIndex: 2,
              transition: "opacity 200ms ease",
              boxShadow: isSelected
                ? `0 0 40px ${bundle.color}80, 0 0 80px ${bundle.color}40`
                : undefined,
            }}
          />
          <Box
            sx={{
              position: "absolute",
              left: -r,
              top: -r,
              width: r * 2,
              height: r * 2,
              borderRadius: "50%",
              background: `radial-gradient(circle, #000 50%, ${bundle.color}40 80%, transparent 100%)`,
              boxShadow: isSelected
                ? `0 0 40px ${bundle.color}60, inset 0 0 10px #000`
                : `0 0 30px ${bundle.color}30, inset 0 0 10px #000`,
              zIndex: 3,
              cursor: "pointer",
              transition: "box-shadow 200ms ease",
            }}
          />
        </Box>
      </Tooltip>

      {/* Label / inline rename */}
      {showLabel && isRenaming && onRenameCommit && onRenameCancel ? (
        <Box sx={{ position: "relative", top: r + BLACK_HOLE_RING_WIDTH + 10, zIndex: 10 }}>
          <InlineRenameField
            value={bundle.name}
            color={bundle.color}
            onCommit={onRenameCommit}
            onCancel={onRenameCancel}
          />
        </Box>
      ) : showLabel ? (
        <Typography
          variant="caption"
          sx={{
            position: "absolute",
            left: "50%",
            top: r + BLACK_HOLE_RING_WIDTH + 10,
            transform: "translateX(-50%)",
            color: bundle.color,
            fontWeight: 700,
            fontSize: "0.7rem",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            opacity: isSelected ? 1 : 0.85,
            pointerEvents: "none",
            zIndex: 4,
            transition: "opacity 200ms ease",
          }}
        >
          {bundle.icon} {bundle.name}
        </Typography>
      ) : null}

      {/* Orbiting star systems */}
      {orbitingStars.map((os) => (
        <OrbitalRing
          key={os.starSystem.bundle.id}
          orbitalRadius={orbitalRadius}
          startAngle={os.startAngle}
          duration={os.orbitDuration}
          paused={isDragging}
        >
          <StarSystem
            bundle={os.starSystem.bundle}
            centerX={0}
            centerY={0}
            orbitalRadius={os.starSystem.orbitalRadius}
            planets={os.starSystem.planets}
            zoom={zoom}
            cardWidth={cardWidth}
            cardHeight={cardHeight}
            isDragging={isDragging}
            onNoteSelect={onNoteSelect}
            onNoteEdit={onNoteEdit}
            selectedNoteId={selectedNoteId}
          />
        </OrbitalRing>
      ))}
    </Box>
  );
}

export default memo(BlackHoleInner);
