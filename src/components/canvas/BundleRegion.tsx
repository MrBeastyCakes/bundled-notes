"use client";

import { useCallback, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import { useDroppable } from "@dnd-kit/core";
import type { BundleRegionRect } from "./useCanvasLayout";

interface BundleRegionProps {
  region: BundleRegionRect;
  zoom: number;
  onResizeEnd?: (bundleId: string, width: number, height: number) => void;
}

export default function BundleRegion({ region, zoom, onResizeEnd }: BundleRegionProps) {
  const { bundle, x, y, width, height } = region;

  const { isOver, setNodeRef } = useDroppable({
    id: `bundle-region-${bundle.id}`,
    data: { bundleId: bundle.id },
  });

  const [resizeDelta, setResizeDelta] = useState({ dx: 0, dy: 0 });
  const isResizing = useRef(false);
  const resizeStart = useRef({ x: 0, y: 0 });

  const handleResizePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      e.preventDefault();
      isResizing.current = true;
      resizeStart.current = { x: e.clientX, y: e.clientY };
      setResizeDelta({ dx: 0, dy: 0 });

      const handleMove = (ev: PointerEvent) => {
        if (!isResizing.current) return;
        const dx = (ev.clientX - resizeStart.current.x) / zoom;
        const dy = (ev.clientY - resizeStart.current.y) / zoom;
        setResizeDelta({ dx, dy });
      };

      const handleUp = () => {
        if (!isResizing.current) return;
        isResizing.current = false;
        setResizeDelta((prev) => {
          const newW = Math.max(200, width + prev.dx);
          const newH = Math.max(120, height + prev.dy);
          onResizeEnd?.(bundle.id, Math.round(newW), Math.round(newH));
          return { dx: 0, dy: 0 };
        });
        window.removeEventListener("pointermove", handleMove);
        window.removeEventListener("pointerup", handleUp);
      };

      window.addEventListener("pointermove", handleMove);
      window.addEventListener("pointerup", handleUp);
    },
    [zoom, width, height, bundle.id, onResizeEnd]
  );

  const displayW = Math.max(200, width + resizeDelta.dx);
  const displayH = Math.max(120, height + resizeDelta.dy);

  return (
    <Box
      ref={setNodeRef}
      sx={{
        position: "absolute",
        left: x,
        top: y,
        width: displayW,
        height: displayH,
        bgcolor: isOver ? `${bundle.color}28` : `${bundle.color}10`,
        border: "2px solid",
        borderColor: isOver ? bundle.color : `${bundle.color}30`,
        borderRadius: 4,
        transition: resizeDelta.dx || resizeDelta.dy ? "none" : "all 200ms ease",
        boxShadow: isOver ? `inset 0 0 30px ${bundle.color}15, 0 0 20px ${bundle.color}20` : "none",
      }}
    >
      {/* Header bar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.75,
          px: 1.5,
          py: 0.75,
          borderBottom: "1px solid",
          borderColor: `${bundle.color}25`,
        }}
      >
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            bgcolor: bundle.color,
            flexShrink: 0,
          }}
        />
        <Typography
          variant="caption"
          sx={{
            color: bundle.color,
            fontWeight: 700,
            fontSize: "0.7rem",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            opacity: isOver ? 1 : 0.85,
            transition: "opacity 200ms ease",
          }}
        >
          {bundle.icon} {bundle.name}
        </Typography>
      </Box>

      {/* Resize handle */}
      <Box
        onPointerDown={handleResizePointerDown}
        sx={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: 24,
          height: 24,
          cursor: "nwse-resize",
          touchAction: "none",
          // Visual affordance
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: 4,
            right: 4,
            width: 14,
            height: 14,
            borderBottom: "3px solid",
            borderRight: "3px solid",
            borderColor: isOver ? bundle.color : `${bundle.color}70`,
            borderRadius: "0 0 12px 0",
            transition: "border-color 200ms ease",
          },
          "&:hover::after": {
            borderColor: bundle.color,
          },
        }}
      />
    </Box>
  );
}
