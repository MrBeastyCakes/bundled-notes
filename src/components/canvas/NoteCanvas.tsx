"use client";

import { useState, useCallback, useEffect } from "react";
import { Box, Typography, Skeleton, IconButton } from "@mui/material";
import NoteAddOutlined from "@mui/icons-material/NoteAddOutlined";
import CloseIcon from "@mui/icons-material/Close";
import { motion } from "framer-motion";
import {
  DndContext,
  DragEndEvent,
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
import { GRID_DOT_OPACITY } from "@/lib/theme/colors";
import type { Note, NoteView } from "@/lib/types";

export default function NoteCanvas() {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<NoteView>("active");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [coachDismissed, setCoachDismissed] = useState(true);

  const { notes, allNotes, allTags, counts, loading } = useNotes({ view: activeView });
  const { bundles } = useBundles();

  const viewport = useCanvasViewport();
  const { positions, bundleRegions, CARD_WIDTH, CARD_HEIGHT } = useCanvasLayout(notes, bundles);

  const editingNote = allNotes.find((n) => n.id === editingNoteId) || null;

  // Check drag onboarding coach mark on mount
  useEffect(() => {
    const dismissed = localStorage.getItem("drag-onboarding-dismissed");
    if (!dismissed) {
      setCoachDismissed(false);
    }
  }, []);

  const dismissCoachMark = useCallback(() => {
    setCoachDismissed(true);
    localStorage.setItem("drag-onboarding-dismissed", "true");
  }, []);

  // Build a bundle lookup map for passing bundleColor to cards
  const bundleMap = new Map(bundles.map((b) => [b.id, b]));

  // Press-and-hold to drag — prevents conflict with pinch-to-zoom
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { delay: 300, tolerance: 5 },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 400, tolerance: 8 },
  });
  const sensors = useSensors(pointerSensor, touchSensor);

  const handleDragStart = useCallback(() => {
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

      // Bottom bar action zones
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

      // Dropped on a bundle container — assign note to that bundle
      if (typeof over?.id === "string" && over.id.startsWith("bundle-region-")) {
        const bundleId = over.data?.current?.bundleId || null;
        if (bundleId !== note.bundleId) {
          await moveNoteToBundle(user.uid, noteId, bundleId);
        }
        // Also reposition
        const pos = positions.get(noteId);
        if (pos) {
          const newX = pos.x + delta.x / viewport.zoom;
          const newY = pos.y + delta.y / viewport.zoom;
          await updateNotePosition(user.uid, noteId, Math.round(newX), Math.round(newY));
        }
        return;
      }

      // Dropped on empty canvas — remove from bundle if it had one, and reposition
      const pos = positions.get(noteId);
      if (pos) {
        const newX = pos.x + delta.x / viewport.zoom;
        const newY = pos.y + delta.y / viewport.zoom;
        await updateNotePosition(user.uid, noteId, Math.round(newX), Math.round(newY));

        // If dragged out of a bundle onto empty canvas, unassign
        if (note.bundleId && !over) {
          await moveNoteToBundle(user.uid, noteId, null);
        }
      }
    },
    [user, notes, positions, viewport.zoom]
  );

  // Click note → zoom in → enter edit mode
  const handleNoteClick = useCallback(
    (note: Note) => {
      if (isEditing || viewport.isAnimating) return;

      const pos = positions.get(note.id);
      if (!pos) return;

      setEditingNoteId(note.id);
      viewport.zoomToCard(pos.x, pos.y, CARD_WIDTH, CARD_HEIGHT);

      setTimeout(() => {
        setIsEditing(true);
      }, 450);
    },
    [isEditing, viewport, positions, CARD_WIDTH, CARD_HEIGHT]
  );

  // Close editor → zoom back out
  const handleCloseEditor = useCallback(() => {
    setIsEditing(false);
    viewport.zoomBack();

    setTimeout(() => {
      setEditingNoteId(null);
    }, 450);
  }, [viewport]);

  // Item 1: FAB creates note at viewport center
  const handleCreateNote = useCallback(
    async (canvasX?: number, canvasY?: number) => {
      if (!user) return;
      // When no explicit position given (FAB click), place at viewport center
      let finalX = canvasX;
      let finalY = canvasY;
      if (finalX === undefined || finalY === undefined) {
        const center = viewport.screenToCanvas(
          window.innerWidth / 2,
          window.innerHeight / 2
        );
        finalX = center.x;
        finalY = center.y;
      }
      const docRef = await createNote(user.uid, {
        title: "",
        content: "",
        bundleId: null,
      });
      await updateNotePosition(user.uid, docRef.id, Math.round(finalX), Math.round(finalY));
      setTimeout(() => {
        const newNote = allNotes.find((n) => n.id === docRef.id);
        if (newNote) {
          handleNoteClick(newNote);
        }
      }, 600);
    },
    [user, allNotes, handleNoteClick, viewport]
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target !== e.currentTarget) return;
      if (isEditing) return;
      const { x, y } = viewport.screenToCanvas(e.clientX, e.clientY);
      handleCreateNote(x, y);
    },
    [viewport, handleCreateNote, isEditing]
  );

  const handleViewChange = useCallback((view: NoteView) => {
    setActiveView(view);
    setEditingNoteId(null);
    setIsEditing(false);
  }, []);

  // Ctrl+K search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Item 3: Generate skeleton positions for loading state (2x3 grid)
  const skeletonPositions = Array.from({ length: 6 }, (_, i) => ({
    x: (i % 2) * (CARD_WIDTH + 24),
    y: Math.floor(i / 2) * (CARD_HEIGHT + 24),
  }));

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
      {/* Grid dot background — Item 7: use GRID_DOT_OPACITY */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: (theme) => {
            const dotColor = theme.palette.divider;
            return `radial-gradient(circle, ${dotColor}${Math.round(GRID_DOT_OPACITY * 255).toString(16).padStart(2, "0")} 1px, transparent 1px)`;
          },
          backgroundSize: `${24 * viewport.zoom}px ${24 * viewport.zoom}px`,
          backgroundPosition: `${viewport.offsetX}px ${viewport.offsetY}px`,
          pointerEvents: "none",
          transition: viewport.isAnimating
            ? "background-size 400ms cubic-bezier(0.2, 0, 0, 1), background-position 400ms cubic-bezier(0.2, 0, 0, 1)"
            : "none",
        }}
      />

      {!isEditing && (
        <FloatingControls
          activeView={activeView}
          onViewChange={handleViewChange}
          zoom={viewport.zoom}
          onResetViewport={viewport.resetViewport}
          onCreateNote={() => handleCreateNote()}
          onOpenSearch={() => setSearchOpen(true)}
          counts={counts}
        />
      )}

      {/* Item 2: Canvas empty state */}
      {!loading && notes.length === 0 && (
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
            pointerEvents: "none",
            zIndex: 1,
          }}
        >
          <NoteAddOutlined sx={{ fontSize: 64, color: "text.secondary", opacity: 0.3 }} />
          <Typography variant="h5" color="text.secondary">
            No notes yet
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", opacity: 0.6 }}>
            Double-click anywhere or press + to create your first note
          </Typography>
        </Box>
      )}

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {!isEditing && <DragActionZones visible={isDragging} />}

        {/* Canvas surface */}
        <Box
          ref={viewport.containerRef}
          {...(isEditing ? {} : viewport.handlers)}
          onDoubleClick={isEditing ? undefined : handleDoubleClick}
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
              transition: viewport.isAnimating
                ? "transform 400ms cubic-bezier(0.2, 0, 0, 1)"
                : "none",
            }}
          >
            {/* Bundle containers — droppable regions */}
            {bundleRegions.map((region) => (
              <BundleRegion key={region.bundle.id} region={region} />
            ))}

            {/* Item 4: Notes with entrance stagger animation + Item 5: bundleColor */}
            {!loading &&
              notes.map((note, index) => {
                const pos = positions.get(note.id);
                if (!pos) return null;
                const bundle = note.bundleId ? bundleMap.get(note.bundleId) : undefined;
                return (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.3) }}
                    style={{ position: "absolute", left: 0, top: 0 }}
                  >
                    <CanvasNoteCard
                      note={note}
                      x={pos.x}
                      y={pos.y}
                      zoom={viewport.zoom}
                      width={CARD_WIDTH}
                      height={CARD_HEIGHT}
                      onClick={() => handleNoteClick(note)}
                      bundleColor={bundle?.color}
                    />
                  </motion.div>
                );
              })}

            {/* Item 3: Loading skeleton state — 2x3 grid of skeleton cards */}
            {loading &&
              skeletonPositions.map((pos, i) => (
                <Box
                  key={`skeleton-${i}`}
                  sx={{
                    position: "absolute",
                    left: pos.x,
                    top: pos.y,
                    width: CARD_WIDTH,
                    height: CARD_HEIGHT,
                  }}
                >
                  <Skeleton
                    variant="rounded"
                    width={CARD_WIDTH}
                    height={CARD_HEIGHT}
                    sx={{ borderRadius: 3 }}
                  />
                </Box>
              ))}
          </Box>
        </Box>
      </DndContext>

      {/* Item 6: Drag onboarding coach mark */}
      {!coachDismissed && !loading && notes.length > 0 && (() => {
        const firstNote = notes[0];
        const firstPos = positions.get(firstNote.id);
        if (!firstPos) return null;
        // Position below the first card in screen space
        const screenX = firstPos.x * viewport.zoom + viewport.offsetX + (CARD_WIDTH * viewport.zoom) / 2;
        const screenY = firstPos.y * viewport.zoom + viewport.offsetY + CARD_HEIGHT * viewport.zoom + 8;
        return (
          <Box
            sx={{
              position: "absolute",
              left: screenX,
              top: screenY,
              transform: "translateX(-50%)",
              bgcolor: "background.paper",
              border: 1,
              borderColor: "divider",
              borderRadius: 2,
              px: 1.5,
              py: 0.75,
              display: "flex",
              alignItems: "center",
              gap: 1,
              boxShadow: 3,
              zIndex: 10,
              whiteSpace: "nowrap",
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Press and hold to drag
            </Typography>
            <IconButton size="small" onClick={dismissCoachMark} sx={{ p: 0.25 }}>
              <CloseIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Box>
        );
      })()}

      <EditorOverlay
        note={isEditing ? editingNote : null}
        allTags={allTags}
        view={activeView}
        onClose={handleCloseEditor}
      />

      <CommandPalette
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        notes={allNotes}
        onSelectNote={(note) => {
          setSearchOpen(false);
          handleNoteClick(note);
        }}
      />
    </Box>
  );
}
