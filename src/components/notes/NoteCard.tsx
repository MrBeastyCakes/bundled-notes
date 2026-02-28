"use client";

import { Card, CardContent, CardActionArea, Typography, Box, Chip } from "@mui/material";
import PushPinIcon from "@mui/icons-material/PushPin";
import StarIcon from "@mui/icons-material/Star";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import BundleChip from "@/components/bundles/BundleChip";
import type { Note } from "@/lib/types";

interface NoteCardProps {
  note: Note;
  selected: boolean;
  onClick: () => void;
}

export default function NoteCard({ note, selected, onClick }: NoteCardProps) {
  const preview = note.content.slice(0, 120).replace(/[#*_~`>]/g, "");
  const dateStr = note.updatedAt.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  return (
    <Card
      elevation={0}
      sx={{
        border: 1,
        borderColor: selected ? "primary.main" : "divider",
        bgcolor: selected ? "action.selected" : "background.paper",
        opacity: note.archived ? 0.7 : 1,
        transition: "all 200ms cubic-bezier(0.2, 0, 0, 1)",
        "&:hover": {
          borderColor: "primary.main",
          transform: "translateY(-1px)",
        },
      }}
    >
      <CardActionArea onClick={onClick} sx={{ p: 0 }}>
        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <Typography variant="subtitle1" fontWeight={600} noWrap sx={{ flex: 1 }}>
              {note.title || "Untitled"}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, ml: 1, flexShrink: 0 }}>
              {note.favorited && (
                <StarIcon sx={{ fontSize: 16, color: "warning.main" }} />
              )}
              {note.pinned && (
                <PushPinIcon
                  fontSize="small"
                  color="primary"
                  sx={{ transform: "rotate(45deg)", fontSize: 16 }}
                />
              )}
            </Box>
          </Box>

          {preview && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.5,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {preview}
            </Typography>
          )}

          {note.tags?.length > 0 && (
            <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 1 }}>
              {note.tags.slice(0, 3).map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  icon={<LocalOfferIcon sx={{ fontSize: 12 }} />}
                  variant="outlined"
                  sx={{ borderRadius: 2, height: 22, fontSize: "0.7rem" }}
                />
              ))}
              {note.tags.length > 3 && (
                <Chip
                  label={`+${note.tags.length - 3}`}
                  size="small"
                  variant="outlined"
                  sx={{ borderRadius: 2, height: 22, fontSize: "0.7rem" }}
                />
              )}
            </Box>
          )}

          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 1.5 }}>
            <BundleChip bundleId={note.bundleId} />
            <Typography variant="caption" color="text.secondary">
              {dateStr}
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
