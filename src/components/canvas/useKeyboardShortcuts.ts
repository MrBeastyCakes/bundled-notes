"use client";

import { useEffect, useCallback } from "react";

interface UseKeyboardShortcutsOptions {
  isEditing: boolean;
  selectedId: string | null;
  selectedType: "planet" | "star" | "blackhole" | null;
  onCreateNote: () => void;
  onCreateBundle: () => void;
  onDeleteSelected: () => void;
  onRenameSelected: () => void;
  onToggleSearch: () => void;
  onEscape: () => void;
}

export function useKeyboardShortcuts({
  isEditing,
  selectedId,
  selectedType,
  onCreateNote,
  onCreateBundle,
  onDeleteSelected,
  onRenameSelected,
  onToggleSearch,
  onEscape,
}: UseKeyboardShortcutsOptions) {
  const handler = useCallback(
    (e: KeyboardEvent) => {
      // Don't intercept when editing note content
      if (isEditing) {
        // Only handle Escape in editing mode (let EditorOverlay handle it)
        return;
      }

      // Don't intercept when typing in an input/textarea
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) {
        return;
      }

      // Ctrl+K — toggle search
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onToggleSearch();
        return;
      }

      // Ctrl+N — new note at viewport center
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === "n") {
        e.preventDefault();
        onCreateNote();
        return;
      }

      // Ctrl+Shift+N — new bundle
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "N") {
        e.preventDefault();
        onCreateBundle();
        return;
      }

      // Delete/Backspace — delete selected object
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        e.preventDefault();
        onDeleteSelected();
        return;
      }

      // F2 — rename selected star/blackhole
      if (e.key === "F2" && selectedId && (selectedType === "star" || selectedType === "blackhole")) {
        e.preventDefault();
        onRenameSelected();
        return;
      }

      // Escape — cascading close (handled by NoteCanvas's own Escape logic)
      if (e.key === "Escape") {
        onEscape();
      }
    },
    [
      isEditing,
      selectedId,
      selectedType,
      onCreateNote,
      onCreateBundle,
      onDeleteSelected,
      onRenameSelected,
      onToggleSearch,
      onEscape,
    ]
  );

  useEffect(() => {
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handler]);
}
