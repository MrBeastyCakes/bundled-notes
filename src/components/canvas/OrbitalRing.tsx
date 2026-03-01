"use client";

import { memo } from "react";
import { Box } from "@mui/material";

interface OrbitalRingProps {
  orbitalRadius: number;
  startAngle: number; // radians
  duration: number; // seconds for full orbit
  paused: boolean;
  children: React.ReactNode;
}

/**
 * CSS-animated orbit wrapper.
 * Uses rotate() on an outer div + counter-rotate on inner div
 * so the child stays upright while orbiting.
 */
function OrbitalRingInner({ orbitalRadius, startAngle, duration, paused, children }: OrbitalRingProps) {
  // Convert start angle to animation-delay (negative = start at that position)
  const delaySeconds = -(startAngle / (2 * Math.PI)) * duration;
  const playState = paused ? "paused" : "running";

  return (
    <Box
      sx={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 0,
        height: 0,
        "@keyframes orbit-spin": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        animation: `orbit-spin ${duration}s linear infinite`,
        animationDelay: `${delaySeconds}s`,
        animationPlayState: playState,
      }}
    >
      {/* Counter-rotate + translate to orbital radius so child stays upright */}
      <Box
        sx={{
          position: "absolute",
          left: 0,
          top: 0,
          "@keyframes orbit-counter": {
            from: { transform: `translateX(${orbitalRadius}px) rotate(0deg)` },
            to: { transform: `translateX(${orbitalRadius}px) rotate(-360deg)` },
          },
          animation: `orbit-counter ${duration}s linear infinite`,
          animationDelay: `${delaySeconds}s`,
          animationPlayState: playState,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default memo(OrbitalRingInner);
