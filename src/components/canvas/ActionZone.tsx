"use client";

import { Box, Typography } from "@mui/material";
import { useDroppable } from "@dnd-kit/core";

interface ActionZoneProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  position: "top" | "right" | "bottom" | "left";
}

const positionStyles: Record<string, React.CSSProperties> = {
  top: {
    top: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: 280,
    height: 80,
    borderRadius: "0 0 24px 24px",
  },
  right: {
    right: 0,
    top: "50%",
    transform: "translateY(-50%)",
    width: 80,
    height: 280,
    borderRadius: "24px 0 0 24px",
  },
  left: {
    left: 0,
    top: "50%",
    transform: "translateY(-50%)",
    width: 80,
    height: 280,
    borderRadius: "0 24px 24px 0",
  },
  bottom: {
    bottom: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: "auto",
    minWidth: 280,
    height: 80,
    borderRadius: "24px 24px 0 0",
  },
};

export default function ActionZone({ id, label, icon, color, position }: ActionZoneProps) {
  const { isOver, setNodeRef } = useDroppable({ id });

  const isVertical = position === "left" || position === "right";

  return (
    <Box
      ref={setNodeRef}
      sx={{
        position: "absolute",
        ...positionStyles[position],
        bgcolor: isOver ? `${color}30` : `${color}18`,
        border: "2px solid",
        borderColor: isOver ? color : `${color}40`,
        display: "flex",
        flexDirection: isVertical ? "column" : "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
        transition: "all 200ms ease",
        boxShadow: isOver ? `0 0 24px ${color}40` : "none",
        zIndex: 9999,
        "& .MuiSvgIcon-root": {
          fontSize: isOver ? 32 : 24,
          color,
          transition: "font-size 200ms ease",
        },
      }}
    >
      {icon}
      <Typography
        variant="caption"
        fontWeight={600}
        sx={{ color, fontSize: "0.7rem", letterSpacing: "0.03em" }}
      >
        {label}
      </Typography>
    </Box>
  );
}
