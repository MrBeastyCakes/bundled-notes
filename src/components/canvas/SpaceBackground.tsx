"use client";

import { Box } from "@mui/material";

interface SpaceBackgroundProps {
  zoom: number;
  offsetX: number;
  offsetY: number;
  isAnimating: boolean;
}

export default function SpaceBackground({ zoom, offsetX, offsetY, isAnimating }: SpaceBackgroundProps) {
  const transition = isAnimating
    ? "background-size 400ms cubic-bezier(0.2, 0, 0, 1), background-position 400ms cubic-bezier(0.2, 0, 0, 1)"
    : "none";

  return (
    <>
      {/* Layer 1: Distant faint stars */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: (theme) => {
            const color = theme.palette.mode === "dark" ? "rgba(255,255,255," : "rgba(0,0,0,";
            return `radial-gradient(circle, ${color}0.15) 0.5px, transparent 0.5px)`;
          },
          backgroundSize: `${32 * zoom * 0.8}px ${32 * zoom * 0.8}px`,
          backgroundPosition: `${offsetX * 0.8}px ${offsetY * 0.8}px`,
          pointerEvents: "none",
          transition,
        }}
      />
      {/* Layer 2: Medium stars */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: (theme) => {
            const color = theme.palette.mode === "dark" ? "rgba(255,255,255," : "rgba(0,0,0,";
            return `radial-gradient(circle, ${color}0.25) 0.8px, transparent 0.8px)`;
          },
          backgroundSize: `${64 * zoom * 0.9}px ${64 * zoom * 0.9}px`,
          backgroundPosition: `${offsetX * 0.9}px ${offsetY * 0.9}px`,
          pointerEvents: "none",
          transition,
        }}
      />
      {/* Layer 3: Bright nearby stars */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: (theme) => {
            const color = theme.palette.mode === "dark" ? "rgba(255,255,255," : "rgba(0,0,0,";
            return `radial-gradient(circle, ${color}0.4) 1px, transparent 1px)`;
          },
          backgroundSize: `${128 * zoom}px ${128 * zoom}px`,
          backgroundPosition: `${offsetX}px ${offsetY}px`,
          pointerEvents: "none",
          transition,
        }}
      />
    </>
  );
}
