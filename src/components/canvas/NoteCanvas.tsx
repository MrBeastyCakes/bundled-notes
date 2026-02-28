"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Box } from "@mui/material";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useCanvasViewport } from "./useCanvasViewport";
import { useCanvasLayout } from "./useCanvasLayout";
import CanvasNoteCard from "./CanvasNoteCard";
import BundleRegion from "./BundleRegion";
import DragActionZones from "./DragActionZones";
import EditorOverlay from "./EditorOverlay";
import FloatingControls from "./FloatingControls";
import CommandPalette from "./CommandPalette";
import { useAuth } from "@/lib/hooks/useAuth";
import { useNotes } from "@/lib/hooks/useNotes";
import { useBundles } from "@/lib/hooks/useBundles";
import {
  createNote,
  updateNote,
  softDeleteNote,
  moveNoteToBundle,
  updateNotePosition,
} from "@/lib/firebase/firestore";
import type { Note, NoteView } from "@/lib/types";

export default function NoteCanvas() {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<NoteView>("active");
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editOriginRect, setEditOriginRect] = useState<DOMRect | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const { notes, allNotes, allTags, counts, loading } = useNotes({ view: activeView });
  const { bundles } = useBundles();

  const viewport = useCanvasViewport();
  const { positions, bundleRegions, CARD_WIDTH, CARD_HEIGHT } = useCanvasLayout(notes, bundles);

  const cardRefs = useRef<Map<string, HTMLElement>>(new Map());

  // Drag sensors — require a minimum distance to distinguish click from drag
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 8 },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 250, tolerance: 5 },
  });
  const sensors = useSensors(pointerSensor, touchSensor);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setIsDragging(false);
      if (!user) return;

      const { active, over, delta } = event;
      const noteId = active.id as string;
      const note = notes.find((n) => n.id === noteId);
      if (!note) return;

      // Check if dropped on an action zone
      if (over?.id === "zone-favorite") {
        await updateNote(user.uid, noteId, { favorited: !note.favorited });
        return;
      }
      if (over?.id === "zone-archive") {
        await updateNote(user.uid, noteId, { archived: true });
        return;
      }
      if (over?.id === "zone-trash") {
        await softDeleteNote(user.uid, noteId);
        return;
      }
      if (typeof over?.id === "string" && over.id.startsWith("bundle-zone-")) {
        const bundleId = over.data?.current?.bundleId || null;
        await moveNoteToBundle(user.uid, noteId, bundleId);
        return;
      }

      // Otherwise, reposition on canvas
      const pos = positions.get(noteId);
      if (pos) {
        const newX = pos.x + delta.x / viewport.zoom;
        const newY = pos.y + delta.y / viewport.zoom;
        await updateNotePosition(user.uid, noteId, Math.round(newX), Math.round(newY));
      }
    },
    [user, notes, positions, viewport.zoom]
  );

  const handleNoteClick = useCallback(
    (note: Note, element?: HTMLElement) => {
      if (element) {
        setEditOriginRect(element.getBoundingClientRect());
      }
      setEditingNote(note);
    },
    []
  );

  const handleCloseEditor = useCallback(() => {
    setEditingNote(null);
    setEditOriginRect(null);
  }, []);

  const handleCreateNote = useCallback(
    async (canvasX?: number, canvasY?: number) => {
      if (!user) return;
      const docRef = await createNote(user.uid, {
        title: "",
        content: "",
        bundleId: null,
      });
      // If position provided, save it
      if (canvasX !== undefined && canvasY !== undefined) {
        await updateNotePosition(user.uid, docRef.id, Math.round(canvasX), Math.round(canvasY));
      }
      // Open editor for the new note after a tick (wait for subscription)
      setTimeout(() => {
        const newNote = allNotes.find((n) => n.id === docRef.id);
        if (newNote) setEditingNote(newNote);
      }, 500);
    },
    [user, allNotes]
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      // Only on background
      if (e.target !== e.currentTarget) return;
      const { x, y } = viewport.screenToCanvas(e.clientX, e.clientY);
      handleCreateNote(x, y);
    },
    [viewport, handleCreateNote]
  );

  const handleViewChange = useCallback((view: NoteView) => {
    setActiveView(view);
    setEditingNote(null);
  }, []);

  // Ctrl+K to open search
  const handleGlobalKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    },
    []
  );

  // Register global keydown
  useEffect(() => {
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [handleGlobalKeyDown]);

  return (
    <Box
      sx={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        bgcolor: "background.default",
      }}
    >
      {/* Grid dot background */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: (theme) =>
            `radial-gradient(circle, ${theme.palette.divider} 1px, transparent 1px)`,
          backgroundSize: `${24 * viewport.zoom}px ${24 * viewport.zoom}px`,
          backgroundPosition: `${viewport.offsetX}px ${viewport.offsetY}px`,
          pointerEvents: "none",
        }}
      />

      <FloatingControls
        activeView={activeView}
        onViewChange={handleViewChange}
        zoom={viewport.zoom}
        onResetViewport={viewport.resetViewport}
        onCreateNote={() => handleCreateNote()}
        onOpenSearch={() => setSearchOpen(true)}
        counts={counts}
      />

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <DragActionZones visible={isDragging} bundles={bundles} />

        {/* Canvas surface */}
        <Box
          ref={viewport.containerRef}
          {...viewport.handlers}
          onDoubleClick={handleDoubleClick}
          sx={{
            position: "absolute",
            inset: 0,
            cursor: isDragging ? "grabbing" : "default",
            touchAction: "none",
          }}
        >
          {/* Transformed canvas layer */}
          <Box
            sx={{
              transform: `translate3d(${viewport.offsetX}px, ${viewport.offsetY}px, 0) scale(${viewport.zoom})`,
              transformOrigin: "0 0",
              position: "absolute",
              top: 0,
              left: 0,
            }}
          >
            {/* Bundle regions (behind notes) */}
            {bundleRegions.map((region) => (
              <BundleRegion key={region.bundle.id} region={region} />
            ))}

            {/* Notes */}
            {!loading &&
              notes.map((note) => {
                const pos = positions.get(note.id);
                if (!pos) return null;
                return (
                  <CanvasNoteCard
                    key={note.id}
                    note={note}
                    x={pos.x}
                    y={pos.y}
                    zoom={viewport.zoom}
                    width={CARD_WIDTH}
                    height={CARD_HEIGHT}
                    onClick={() => handleNoteClick(note)}
                  />
                );
              })}

            {/* Loading placeholder */}
            {loading && (
              <Box
                sx={{
                  position: "absolute",
                  top: "40vh",
                  left: "40vw",
                  color: "text.secondary",
                  fontSize: "1.1rem",
                  fontWeight: 500,
                }}
              >
                Loading notes...
              </Box>
            )}
          </Box>
        </Box>
      </DndContext>

      <EditorOverlay
        note={editingNote}
        allTags={allTags}
        view={activeView}
        onClose={handleCloseEditor}
        originRect={editOriginRect}
      />

      <CommandPalette
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        notes={allNotes}
        onSelectNote={(note) => {
          setEditingNote(note);
          setSearchOpen(false);
        }}
      />
    </Box>
  );
}
