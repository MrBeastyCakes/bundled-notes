"use client";

import { memo } from "react";
import { Popover, Box } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { bundleColors } from "@/lib/theme/colors";

interface BundleColorPickerProps {
  open: boolean;
  anchorPosition: { x: number; y: number } | null;
  currentColor: string;
  onSelectColor: (color: string) => void;
  onClose: () => void;
}

function BundleColorPickerInner({
  open,
  anchorPosition,
  currentColor,
  onSelectColor,
  onClose,
}: BundleColorPickerProps) {
  const glassBackground = "rgba(31,31,35,0.92)";

  return (
    <Popover
      open={open && !!anchorPosition}
      onClose={onClose}
      anchorReference="anchorPosition"
      anchorPosition={
        anchorPosition
          ? { top: anchorPosition.y, left: anchorPosition.x }
          : undefined
      }
      transformOrigin={{ vertical: "top", horizontal: "left" }}
      slotProps={{
        paper: {
          sx: {
            bgcolor: glassBackground,
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            borderRadius: 3,
            border: 1,
            borderColor: "divider",
            boxShadow: 8,
            p: 1.5,
            overflow: "hidden",
          },
        },
      }}
      sx={{ zIndex: 12000 }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 1,
        }}
      >
        {bundleColors.map((color) => (
          <Box
            key={color}
            onClick={() => {
              onSelectColor(color);
              onClose();
            }}
            sx={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              bgcolor: color,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: currentColor === color ? "2px solid #fff" : "2px solid transparent",
              transition: "border-color 150ms ease, transform 150ms ease",
              "&:hover": {
                transform: "scale(1.15)",
              },
            }}
          >
            {currentColor === color && (
              <CheckIcon sx={{ fontSize: 16, color: "#fff" }} />
            )}
          </Box>
        ))}
      </Box>
    </Popover>
  );
}

export default memo(BundleColorPickerInner);
