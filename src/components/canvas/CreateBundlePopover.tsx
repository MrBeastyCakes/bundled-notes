"use client";

import { useState, useRef, useEffect, memo } from "react";
import { Popover, Box, TextField, Button, Typography } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { bundleColors } from "@/lib/theme/colors";

interface CreateBundlePopoverProps {
  open: boolean;
  anchorPosition: { x: number; y: number } | null;
  onClose: () => void;
  onCreate: (name: string, color: string) => void;
}

function CreateBundlePopoverInner({
  open,
  anchorPosition,
  onClose,
  onCreate,
}: CreateBundlePopoverProps) {
  const [name, setName] = useState("New Star");
  const [color, setColor] = useState(bundleColors[0]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus and select on open
  useEffect(() => {
    if (open) {
      setName("New Star");
      setColor(bundleColors[Math.floor(Math.random() * bundleColors.length)]);
      setTimeout(() => {
        const el = inputRef.current;
        if (el) {
          el.focus();
          el.select();
        }
      }, 100);
    }
  }, [open]);

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreate(trimmed, color);
    onClose();
  };

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
            p: 2,
            width: 260,
            overflow: "hidden",
          },
        },
      }}
      sx={{ zIndex: 12000 }}
    >
      <Typography
        variant="subtitle2"
        sx={{ fontWeight: 600, mb: 1.5, color: "text.primary" }}
      >
        New Star System
      </Typography>

      <TextField
        inputRef={inputRef}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleSubmit();
          }
          if (e.key === "Escape") {
            e.preventDefault();
            onClose();
          }
        }}
        placeholder="Star name"
        variant="outlined"
        size="small"
        fullWidth
        sx={{
          mb: 1.5,
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
            bgcolor: "rgba(255,255,255,0.06)",
          },
        }}
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 0.75,
          justifyItems: "center",
          mb: 2,
        }}
      >
        {bundleColors.map((c) => (
          <Box
            key={c}
            onClick={() => setColor(c)}
            sx={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              bgcolor: c,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: color === c ? "2px solid #fff" : "2px solid transparent",
              transition: "border-color 150ms ease, transform 150ms ease",
              "&:hover": {
                transform: "scale(1.15)",
              },
            }}
          >
            {color === c && (
              <CheckIcon sx={{ fontSize: 14, color: "#fff" }} />
            )}
          </Box>
        ))}
      </Box>

      <Button
        onClick={handleSubmit}
        variant="contained"
        size="small"
        fullWidth
        disabled={!name.trim()}
        sx={{
          borderRadius: 5,
          textTransform: "none",
          fontWeight: 600,
          bgcolor: color,
          "&:hover": { bgcolor: color, filter: "brightness(1.15)" },
        }}
      >
        Create
      </Button>
    </Popover>
  );
}

export default memo(CreateBundlePopoverInner);
