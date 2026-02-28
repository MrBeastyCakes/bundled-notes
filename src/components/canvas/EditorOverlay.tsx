"use client";

import { useEffect, useCallback } from "react";
import { Box, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { motion, AnimatePresence } from "framer-motion";
import NoteEditor from "@/components/notes/NoteEditor";
import type { Note, NoteView } from "@/lib/types";

interface EditorOverlayProps {
  note: Note | null;
  allTags: string[];
  view: NoteView;
  onClose: () => void;
}

export default function EditorOverlay({
  note,
  allTags,
  view,
  onClose,
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

  return (
    <AnimatePresence>
      {note && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, delay: 0.2 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10001,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              flex: 1,
              bgcolor: "background.paper",
              display: "flex",
              flexDirection: "column",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Back button */}
            <IconButton
              onClick={onClose}
              sx={{
                position: "absolute",
                top: 16,
                left: 16,
                zIndex: 10,
                bgcolor: "action.hover",
                "&:hover": { bgcolor: "action.selected" },
              }}
            >
              <ArrowBackIcon />
            </IconButton>

            <NoteEditor
              note={note}
              allTags={allTags}
              view={view}
              onDeleted={onClose}
            />
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
