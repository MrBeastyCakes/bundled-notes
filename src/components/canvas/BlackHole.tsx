"use client";

import { memo } from "react";
import { Box, Typography } from "@mui/material";
import { useDroppable } from "@dnd-kit/core";
import OrbitalRing from "./OrbitalRing";
import StarSystem from "./StarSystem";
import { BLACK_HOLE_CENTER_RADIUS, BLACK_HOLE_RING_WIDTH } from "./spaceTheme";
import { ORBIT_PATH_OPACITY } from "@/lib/theme/colors";
import type { BlackHoleLayout } from "./useCanvasLayout";
import type { Note } from "@/lib/types";

interface BlackHoleProps {
  layout: BlackHoleLayout;
  zoom: number;
  cardWidth: number;
  cardHeight: number;
  isDragging: boolean;
  onNoteClick: (note: Note) => void;
}

function BlackHoleInner({
  layout,
  zoom,
  cardWidth,
  cardHeight,
  isDragging,
  onNoteClick,
}: BlackHoleProps) {
  const { bundle, centerX, centerY, orbitalRadius, orbitingStars } = layout;

  const { isOver, setNodeRef } = useDroppable({
    id: `black-hole-${bundle.id}`,
    data: { bundleId: bundle.id },
  });

  const showLabel = zoom > 0.3;
  const r = BLACK_HOLE_CENTER_RADIUS;

  return (
    <Box
      ref={setNodeRef}
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
          opacity: 0.7,
          pointerEvents: "none",
          zIndex: 2,
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
          boxShadow: `0 0 30px ${bundle.color}30, inset 0 0 10px #000`,
          zIndex: 3,
        }}
      />

      {/* Label */}
      {showLabel && (
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
            opacity: 0.85,
            pointerEvents: "none",
            zIndex: 4,
          }}
        >
          {bundle.icon} {bundle.name}
        </Typography>
      )}

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
            onNoteClick={onNoteClick}
          />
        </OrbitalRing>
      ))}
    </Box>
  );
}

export default memo(BlackHoleInner);
