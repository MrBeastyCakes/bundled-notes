"use client";

import { memo } from "react";
import { Box, Typography } from "@mui/material";
import { useDroppable } from "@dnd-kit/core";
import OrbitalRing from "./OrbitalRing";
import Planet from "./Planet";
import { STAR_CENTER_RADIUS, STAR_GLOW_BLUR } from "./spaceTheme";
import { ORBIT_PATH_OPACITY } from "@/lib/theme/colors";
import type { Note, Bundle } from "@/lib/types";

export interface StarPlanetData {
  note: Note;
  radius: number;
  startAngle: number;
  orbitDuration: number;
}

interface StarSystemProps {
  bundle: Bundle;
  centerX: number;
  centerY: number;
  orbitalRadius: number;
  planets: StarPlanetData[];
  zoom: number;
  cardWidth: number;
  cardHeight: number;
  isDragging: boolean;
  onNoteClick: (note: Note) => void;
}

function StarSystemInner({
  bundle,
  centerX,
  centerY,
  orbitalRadius,
  planets,
  zoom,
  cardWidth,
  cardHeight,
  isDragging,
  onNoteClick,
}: StarSystemProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `star-system-${bundle.id}`,
    data: { bundleId: bundle.id },
  });

  const showLabel = zoom > 0.4;

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
      {/* Orbital path ring (visual only) */}
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

      {/* Droppable area (invisible circle) */}
      <Box
        sx={{
          position: "absolute",
          left: -(orbitalRadius + 40),
          top: -(orbitalRadius + 40),
          width: (orbitalRadius + 40) * 2,
          height: (orbitalRadius + 40) * 2,
          borderRadius: "50%",
          bgcolor: isOver ? `${bundle.color}15` : "transparent",
          transition: "background-color 200ms ease",
          pointerEvents: "none",
        }}
      />

      {/* Star center glow */}
      <Box
        sx={{
          position: "absolute",
          left: -STAR_CENTER_RADIUS,
          top: -STAR_CENTER_RADIUS,
          width: STAR_CENTER_RADIUS * 2,
          height: STAR_CENTER_RADIUS * 2,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${bundle.color} 0%, ${bundle.color}80 40%, transparent 70%)`,
          boxShadow: `0 0 ${STAR_GLOW_BLUR}px ${bundle.color}80, 0 0 ${STAR_GLOW_BLUR * 2}px ${bundle.color}40, 0 0 ${STAR_GLOW_BLUR * 3}px ${bundle.color}20`,
          transition: "box-shadow 200ms ease",
          zIndex: 2,
        }}
      />

      {/* Star label */}
      {showLabel && (
        <Typography
          variant="caption"
          sx={{
            position: "absolute",
            left: "50%",
            top: STAR_CENTER_RADIUS + 6,
            transform: "translateX(-50%)",
            color: bundle.color,
            fontWeight: 700,
            fontSize: "0.65rem",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            opacity: 0.85,
            pointerEvents: "none",
            zIndex: 2,
          }}
        >
          {bundle.icon} {bundle.name}
        </Typography>
      )}

      {/* Orbiting planets */}
      {planets.map((planet) => (
        <OrbitalRing
          key={planet.note.id}
          orbitalRadius={orbitalRadius}
          startAngle={planet.startAngle}
          duration={planet.orbitDuration}
          paused={isDragging}
        >
          <Planet
            note={planet.note}
            radius={planet.radius}
            zoom={zoom}
            cardWidth={cardWidth}
            cardHeight={cardHeight}
            bundleColor={bundle.color}
            onClick={() => onNoteClick(planet.note)}
          />
        </OrbitalRing>
      ))}
    </Box>
  );
}

export default memo(StarSystemInner);
