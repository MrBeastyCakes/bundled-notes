"use client";

import { useState, useEffect, useCallback } from "react";
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
  const [viewportHeight, setViewportHeight] = useState<string>("100%");

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

  // Adjust overlay height when virtual keyboard opens/closes
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const onResize = () => {
      setViewportHeight(`${vv.height}px`);
    };
    onResize();
    vv.addEventListener("resize", onResize);
    return () => vv.removeEventListener("resize", onResize);
  }, []);

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
            top: 0,
            left: 0,
            right: 0,
            height: viewportHeight,
            zIndex: 10001,
            display: "flex",
            flexDirection: "column",
            paddingTop: "env(safe-area-inset-top, 0px)",
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
                top: "max(16px, env(safe-area-inset-top, 0px))",
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
