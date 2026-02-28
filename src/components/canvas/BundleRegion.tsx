"use client";

import { Box, Typography } from "@mui/material";
import { useDroppable } from "@dnd-kit/core";
import type { BundleRegionRect } from "./useCanvasLayout";

interface BundleRegionProps {
  region: BundleRegionRect;
}

export default function BundleRegion({ region }: BundleRegionProps) {
  const { bundle, x, y, width, height } = region;

  const { isOver, setNodeRef } = useDroppable({
    id: `bundle-region-${bundle.id}`,
    data: { bundleId: bundle.id },
  });

  return (
    <Box
      ref={setNodeRef}
      sx={{
        position: "absolute",
        left: x,
        top: y,
        width,
        height,
        bgcolor: isOver ? `${bundle.color}28` : `${bundle.color}12`,
        border: "2px solid",
        borderColor: isOver ? bundle.color : `${bundle.color}30`,
        borderRadius: 4,
        transition: "all 200ms ease",
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
    </Box>
  );
}
