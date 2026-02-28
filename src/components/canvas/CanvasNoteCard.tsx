"use client";

import { Box, Typography, Chip } from "@mui/material";
import PushPinIcon from "@mui/icons-material/PushPin";
import StarIcon from "@mui/icons-material/Star";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import { useDraggable } from "@dnd-kit/core";
import type { Note } from "@/lib/types";

interface CanvasNoteCardProps {
  note: Note;
  x: number;
  y: number;
  zoom: number;
  width: number;
  height: number;
  onClick: () => void;
}

export default function CanvasNoteCard({
  note,
  x,
  y,
  zoom,
  width,
  height,
  onClick,
}: CanvasNoteCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: note.id,
    data: { note },
  });

  const preview = note.content.slice(0, 100).replace(/<[^>]*>/g, "").replace(/[#*_~`>]/g, "");
  const dateStr = note.updatedAt.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  const style: React.CSSProperties = {
    position: "absolute",
    left: x,
    top: y,
    width,
    height,
    transform: transform
      ? `translate3d(${transform.x / zoom}px, ${transform.y / zoom}px, 0)`
      : undefined,
    zIndex: isDragging ? 1000 : 1,
    opacity: isDragging ? 0.85 : 1,
    cursor: isDragging ? "grabbing" : "pointer",
    transition: isDragging ? "none" : "box-shadow 200ms ease, border-color 200ms ease",
  };

  return (
    <Box
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      onClick={(e) => {
        if (!isDragging && !transform) onClick();
      }}
      sx={{
        bgcolor: "background.paper",
        border: 1,
        borderColor: "divider",
        borderRadius: 3,
        p: 2,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        boxShadow: isDragging ? 8 : 1,
        "&:hover": {
          borderColor: "primary.main",
          boxShadow: 3,
        },
        touchAction: "none",
        userSelect: "none",
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 0.5 }}>
        <Typography variant="subtitle2" fontWeight={600} noWrap sx={{ flex: 1 }}>
          {note.title || "Untitled"}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, ml: 1, flexShrink: 0 }}>
          {note.favorited && <StarIcon sx={{ fontSize: 14, color: "warning.main" }} />}
          {note.pinned && (
            <PushPinIcon sx={{ fontSize: 14, color: "primary.main", transform: "rotate(45deg)" }} />
          )}
        </Box>
      </Box>

      {/* Preview */}
      {preview && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            flex: 1,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            lineHeight: 1.4,
          }}
        >
          {preview}
        </Typography>
      )}

      {/* Tags */}
      {note.tags?.length > 0 && (
        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 0.5 }}>
          {note.tags.slice(0, 2).map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              icon={<LocalOfferIcon sx={{ fontSize: 10 }} />}
              variant="outlined"
              sx={{ borderRadius: 2, height: 18, fontSize: "0.65rem" }}
            />
          ))}
          {note.tags.length > 2 && (
            <Chip
              label={`+${note.tags.length - 2}`}
              size="small"
              variant="outlined"
              sx={{ borderRadius: 2, height: 18, fontSize: "0.65rem" }}
            />
          )}
        </Box>
      )}

      {/* Footer */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", mt: "auto", pt: 0.5 }}>
        <Typography variant="caption" color="text.secondary" fontSize="0.65rem">
          {dateStr}
        </Typography>
      </Box>
    </Box>
  );
}
