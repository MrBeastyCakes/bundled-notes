"use client";

import { memo } from "react";
import { Box, Typography } from "@mui/material";
import { useDraggable, useDroppable } from "@dnd-kit/core";
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
  // Droppable: planets can be dropped onto this star
  const { isOver, setNodeRef: setDropRef } = useDroppable({
    id: `star-system-${bundle.id}`,
    data: { bundleId: bundle.id, type: "star" },
  });

  // Draggable: star can be dragged onto a black hole
  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    transform: starTransform,
    isDragging: isStarDragging,
  } = useDraggable({
    id: `star-drag-${bundle.id}`,
    data: { bundleId: bundle.id, type: "star" },
  });

  const showLabel = zoom > 0.4;
  const dropAreaRadius = orbitalRadius + 60;

  return (
    <Box
      ref={setDropRef}
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

      {/* Droppable highlight area */}
      <Box
        sx={{
          position: "absolute",
          left: -dropAreaRadius,
          top: -dropAreaRadius,
          width: dropAreaRadius * 2,
          height: dropAreaRadius * 2,
          borderRadius: "50%",
          bgcolor: isOver ? `${bundle.color}18` : "transparent",
          border: isOver ? `2px solid ${bundle.color}40` : "2px solid transparent",
          transition: "all 200ms ease",
          pointerEvents: "none",
        }}
      />

      {/* Draggable star center glow */}
      <Box
        ref={setDragRef}
        {...listeners}
        {...attributes}
        sx={{
          position: "absolute",
          left: -STAR_CENTER_RADIUS * 1.5,
          top: -STAR_CENTER_RADIUS * 1.5,
          width: STAR_CENTER_RADIUS * 3,
          height: STAR_CENTER_RADIUS * 3,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: isStarDragging ? "grabbing" : "grab",
          zIndex: isStarDragging ? 1000 : 2,
          opacity: isStarDragging ? 0.7 : 1,
          transform: starTransform
            ? `translate3d(${starTransform.x / zoom}px, ${starTransform.y / zoom}px, 0)`
            : undefined,
          touchAction: "none",
          // Inner glow circle
          "&::before": {
            content: '""',
            position: "absolute",
            width: STAR_CENTER_RADIUS * 2,
            height: STAR_CENTER_RADIUS * 2,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${bundle.color} 0%, ${bundle.color}80 40%, transparent 70%)`,
            boxShadow: isOver
              ? `0 0 ${STAR_GLOW_BLUR * 1.5}px ${bundle.color}a0, 0 0 ${STAR_GLOW_BLUR * 3}px ${bundle.color}60`
              : `0 0 ${STAR_GLOW_BLUR}px ${bundle.color}80, 0 0 ${STAR_GLOW_BLUR * 2}px ${bundle.color}40, 0 0 ${STAR_GLOW_BLUR * 3}px ${bundle.color}20`,
            transition: "box-shadow 200ms ease",
          },
        }}
      />

      {/* Star label */}
      {showLabel && (
        <Typography
          variant="caption"
          sx={{
            position: "absolute",
            left: "50%",
            top: STAR_CENTER_RADIUS * 1.5 + 6,
            transform: "translateX(-50%)",
            color: bundle.color,
            fontWeight: 700,
            fontSize: "0.7rem",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            opacity: isOver ? 1 : 0.85,
            transition: "opacity 200ms ease",
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
