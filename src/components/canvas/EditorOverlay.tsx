"use client";

import { useEffect, useCallback } from "react";
import { Box, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { motion, AnimatePresence } from "framer-motion";
import NoteEditor from "@/components/notes/NoteEditor";
import type { Note, NoteView } from "@/lib/types";

interface EditorOverlayProps {
  note: Note | null;
  allTags: string[];
  view: NoteView;
  onClose: () => void;
  originRect?: DOMRect | null;
}

export default function EditorOverlay({
  note,
  allTags,
  view,
  onClose,
  originRect,
}: EditorOverlayProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && note) {
        onClose();
      }
    },
    [note, onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Compute initial animation values from origin card rect
  const getInitial = () => {
    if (!originRect) return { opacity: 0, scale: 0.9 };
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    return {
      opacity: 0,
      x: originRect.left + originRect.width / 2 - vw / 2,
      y: originRect.top + originRect.height / 2 - vh / 2,
      scaleX: originRect.width / vw,
      scaleY: originRect.height / vh,
    };
  };

  return (
    <AnimatePresence>
      {note && (
        <>
          {/* Scrim */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.6)",
              zIndex: 10000,
            }}
            onClick={onClose}
          />

          {/* Editor panel */}
          <motion.div
            initial={getInitial()}
            animate={{ opacity: 1, x: 0, y: 0, scaleX: 1, scaleY: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
              duration: 0.4,
              ease: [0.2, 0, 0, 1],
            }}
            style={{
              position: "fixed",
              inset: 16,
              zIndex: 10001,
              display: "flex",
              flexDirection: "column",
              borderRadius: 28,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                flex: 1,
                bgcolor: "background.paper",
                borderRadius: 7,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                position: "relative",
              }}
            >
              {/* Close button */}
              <IconButton
                onClick={onClose}
                sx={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  zIndex: 10,
                  bgcolor: "action.hover",
                  "&:hover": { bgcolor: "action.selected" },
                }}
              >
                <CloseIcon />
              </IconButton>

              <NoteEditor
                note={note}
                allTags={allTags}
                view={view}
                onDeleted={onClose}
              />
            </Box>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
