"use client";

import { useState, useRef, useEffect, useCallback, memo } from "react";
import { TextField } from "@mui/material";

interface InlineRenameFieldProps {
  value: string;
  color: string;
  onCommit: (newName: string) => void;
  onCancel: () => void;
}

function InlineRenameFieldInner({
  value,
  color,
  onCommit,
  onCancel,
}: InlineRenameFieldProps) {
  const [text, setText] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus and select all on mount
    const el = inputRef.current;
    if (el) {
      el.focus();
      el.select();
    }
  }, []);

  const commit = useCallback(() => {
    const trimmed = text.trim();
    if (trimmed && trimmed !== value) {
      onCommit(trimmed);
    } else {
      onCancel();
    }
  }, [text, value, onCommit, onCancel]);

  return (
    <TextField
      inputRef={inputRef}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === "Enter") {
          e.preventDefault();
          commit();
        }
        if (e.key === "Escape") {
          e.preventDefault();
          onCancel();
        }
      }}
      onBlur={commit}
      onClick={(e) => e.stopPropagation()}
      variant="standard"
      size="small"
      slotProps={{
        input: {
          disableUnderline: true,
          sx: {
            color,
            fontWeight: 700,
            fontSize: "0.7rem",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            textAlign: "center",
            p: 0,
            "& input": {
              textAlign: "center",
              p: "2px 4px",
              borderRadius: 1,
              bgcolor: "rgba(255,255,255,0.08)",
            },
          },
        },
      }}
      sx={{
        position: "absolute",
        left: "50%",
        transform: "translateX(-50%)",
        minWidth: 60,
        maxWidth: 140,
        zIndex: 10,
      }}
    />
  );
}

export default memo(InlineRenameFieldInner);
