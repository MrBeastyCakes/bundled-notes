"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  Box,
  TextField,
  Typography,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import SearchOffOutlinedIcon from "@mui/icons-material/SearchOffOutlined";
import { motion, AnimatePresence } from "framer-motion";
import type { Note } from "@/lib/types";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  notes: Note[];
  onSelectNote: (note: Note) => void;
}

export default function CommandPalette({
  open,
  onClose,
  notes,
  onSelectNote,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    if (!query.trim()) return notes.filter((n) => !n.deleted).slice(0, 10);
    const q = query.toLowerCase().trim();
    return notes
      .filter(
        (n) =>
          !n.deleted &&
          (n.title.toLowerCase().includes(q) ||
            n.content.toLowerCase().includes(q) ||
            n.tags.some((t) => t.toLowerCase().includes(q)))
      )
      .slice(0, 10);
  }, [notes, query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && results[selectedIndex]) {
        onSelectNote(results[selectedIndex]);
        onClose();
      } else if (e.key === "Escape") {
        onClose();
      }
    },
    [results, selectedIndex, onSelectNote, onClose]
  );

  // Global Ctrl+K listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (open) onClose();
        // Opening is handled by parent
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Scrim */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.4)",
              zIndex: 11000,
            }}
            onClick={onClose}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
            style={{
              position: "fixed",
              top: "15%",
              left: "50%",
              transform: "translateX(-50%)",
              width: "min(560px, 90vw)",
              zIndex: 11001,
            }}
          >
            <Box
              sx={{
                bgcolor: "background.paper",
                borderRadius: 4,
                boxShadow: 24,
                border: 1,
                borderColor: "divider",
                overflow: "hidden",
              }}
              onKeyDown={handleKeyDown}
            >
              <TextField
                inputRef={inputRef}
                fullWidth
                placeholder="Search notes..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 0,
                    "& fieldset": { border: "none" },
                  },
                  "& .MuiOutlinedInput-input": {
                    py: 2,
                    fontSize: "1.1rem",
                  },
                }}
              />

              {results.length > 0 ? (
                <List sx={{ maxHeight: 400, overflow: "auto", py: 0.5 }}>
                  {results.map((note, idx) => {
                    const preview = note.content
                      .slice(0, 80)
                      .replace(/<[^>]*>/g, "")
                      .replace(/[#*_~`>]/g, "");
                    return (
                      <ListItemButton
                        key={note.id}
                        selected={idx === selectedIndex}
                        onClick={() => {
                          onSelectNote(note);
                          onClose();
                        }}
                        sx={{ px: 2, py: 1 }}
                      >
                        <ListItemText
                          primary={
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Typography variant="body2" fontWeight={600}>
                                {note.title || "Untitled"}
                              </Typography>
                              {note.tags.slice(0, 2).map((t) => (
                                <Chip
                                  key={t}
                                  label={t}
                                  size="small"
                                  variant="outlined"
                                  sx={{ height: 18, fontSize: "0.65rem", borderRadius: 2 }}
                                />
                              ))}
                            </Box>
                          }
                          secondary={preview}
                          secondaryTypographyProps={{
                            noWrap: true,
                            variant: "caption",
                          }}
                        />
                      </ListItemButton>
                    );
                  })}
                </List>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1,
                    py: 4,
                  }}
                >
                  <SearchOffOutlinedIcon
                    sx={{ fontSize: 48, color: "text.secondary", opacity: 0.3 }}
                  />
                  <Typography variant="body1" color="text.secondary">
                    No matching notes
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.6 }}>
                    Try a different search term
                  </Typography>
                </Box>
              )}

              <Box
                sx={{
                  borderTop: 1,
                  borderColor: "divider",
                  px: 2,
                  py: 1,
                  display: "flex",
                  gap: 2,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  <kbd style={{ fontFamily: "inherit" }}>↑↓</kbd> navigate
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  <kbd style={{ fontFamily: "inherit" }}>Enter</kbd> open
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  <kbd style={{ fontFamily: "inherit" }}>Esc</kbd> close
                </Typography>
              </Box>
            </Box>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
