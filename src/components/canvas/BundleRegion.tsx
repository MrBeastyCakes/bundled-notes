"use client";

import { Box, Typography } from "@mui/material";
import type { BundleRegionRect } from "./useCanvasLayout";

interface BundleRegionProps {
  region: BundleRegionRect;
}

export default function BundleRegion({ region }: BundleRegionProps) {
  const { bundle, x, y, width, height } = region;

  return (
    <Box
      sx={{
        position: "absolute",
        left: x,
        top: y,
        width,
        height,
        bgcolor: `${bundle.color}14`, // 8% opacity
        border: "1.5px dashed",
        borderColor: `${bundle.color}40`, // 25% opacity
        borderRadius: 4,
        pointerEvents: "none",
      }}
    >
      <Typography
        variant="caption"
        sx={{
          position: "absolute",
          top: 6,
          left: 12,
          color: bundle.color,
          fontWeight: 600,
          fontSize: "0.7rem",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          opacity: 0.8,
        }}
      >
        {bundle.icon} {bundle.name}
      </Typography>
    </Box>
  );
}
