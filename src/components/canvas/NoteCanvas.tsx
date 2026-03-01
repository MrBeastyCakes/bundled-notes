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
import SpaceBackground from "./SpaceBackground";
import Planet from "./Planet";
import StarSystem from "./StarSystem";
import BlackHole from "./BlackHole";
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
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [coachDismissed, setCoachDismissed] = useState(true);

  const { notes, allNotes, allTags, counts, loading } = useNotes({ view: activeView });
  const { bundles, tree } = useBundles();

  const viewport = useCanvasViewport();
  const {
    freeNotePositions,
    starSystems,
    blackHoles,
    allNotePositions,
    CARD_WIDTH,
    CARD_HEIGHT,
  } = useCanvasLayout(notes, bundles, tree);

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

  // Build a bundle lookup map
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
    viewport.setDragActive(true);
  }, [viewport]);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setIsDragging(false);
      viewport.setDragActive(false);
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

      // Dropped on a star system — assign note to that bundle
      if (typeof over?.id === "string" && over.id.startsWith("star-system-")) {
        const bundleId = over.data?.current?.bundleId || null;
        if (bundleId !== note.bundleId) {
          await moveNoteToBundle(user.uid, noteId, bundleId);
        }
        return;
      }

      // Dropped on a black hole — assign note to that bundle
      if (typeof over?.id === "string" && over.id.startsWith("black-hole-")) {
        const bundleId = over.data?.current?.bundleId || null;
        if (bundleId !== note.bundleId) {
          await moveNoteToBundle(user.uid, noteId, bundleId);
        }
        return;
      }

      // Dropped on empty canvas — reposition free-floating note
      const pos = allNotePositions.get(noteId);
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
    [user, notes, allNotePositions, viewport]
  );

  // Click note → zoom in → enter edit mode
  const handleNoteClick = useCallback(
    (note: Note) => {
      if (isEditing || viewport.isAnimating) return;

      const pos = allNotePositions.get(note.id);
      if (!pos) return;

      setEditingNoteId(note.id);
      // Offset from center to top-left for zoomToCard
      viewport.zoomToCard(
        pos.x - CARD_WIDTH / 2,
        pos.y - CARD_HEIGHT / 2,
        CARD_WIDTH,
        CARD_HEIGHT
      );

      setTimeout(() => {
        setIsEditing(true);
      }, 450);
    },
    [isEditing, viewport, allNotePositions, CARD_WIDTH, CARD_HEIGHT]
  );

  // Close editor → zoom back out
  const handleCloseEditor = useCallback(() => {
    setIsEditing(false);
    viewport.zoomBack();

    setTimeout(() => {
      setEditingNoteId(null);
    }, 450);
  }, [viewport]);

  // FAB creates note at viewport center
  const handleCreateNote = useCallback(
    async (canvasX?: number, canvasY?: number) => {
      if (!user) return;
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

  // Loading skeleton positions
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
      {/* Starfield background */}
      <SpaceBackground
        zoom={viewport.zoom}
        offsetX={viewport.offsetX}
        offsetY={viewport.offsetY}
        isAnimating={viewport.isAnimating}
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

      {/* Canvas empty state */}
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
            No planets yet
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", opacity: 0.6 }}>
            Double-click to create your first planet
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
            {/* Black holes (parent bundles with children) */}
            {!loading &&
              blackHoles.map((bh) => (
                <motion.div
                  key={`bh-${bh.bundle.id}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  style={{ position: "absolute", left: 0, top: 0 }}
                >
                  <BlackHole
                    layout={bh}
                    zoom={viewport.zoom}
                    cardWidth={CARD_WIDTH}
                    cardHeight={CARD_HEIGHT}
                    isDragging={isDragging}
                    onNoteClick={handleNoteClick}
                  />
                </motion.div>
              ))}

            {/* Star systems (leaf bundles) */}
            {!loading &&
              starSystems.map((sys) => (
                <motion.div
                  key={`star-${sys.bundle.id}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  style={{ position: "absolute", left: 0, top: 0 }}
                >
                  <StarSystem
                    bundle={sys.bundle}
                    centerX={sys.centerX}
                    centerY={sys.centerY}
                    orbitalRadius={sys.orbitalRadius}
                    planets={sys.planets}
                    zoom={viewport.zoom}
                    cardWidth={CARD_WIDTH}
                    cardHeight={CARD_HEIGHT}
                    isDragging={isDragging}
                    onNoteClick={handleNoteClick}
                  />
                </motion.div>
              ))}

            {/* Free-floating planets (unbundled notes) */}
            {!loading &&
              freeNotePositions.map((fn, index) => (
                <motion.div
                  key={fn.note.id}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.3) }}
                  style={{
                    position: "absolute",
                    left: fn.x,
                    top: fn.y,
                  }}
                >
                  <Planet
                    note={fn.note}
                    radius={fn.radius}
                    zoom={viewport.zoom}
                    cardWidth={CARD_WIDTH}
                    cardHeight={CARD_HEIGHT}
                    bundleColor={fn.note.bundleId ? bundleMap.get(fn.note.bundleId)?.color : undefined}
                    onClick={() => handleNoteClick(fn.note)}
                  />
                </motion.div>
              ))}

            {/* Loading skeleton */}
            {loading &&
              skeletonPositions.map((pos, i) => (
                <Box
                  key={`skeleton-${i}`}
                  sx={{
                    position: "absolute",
                    left: pos.x,
                    top: pos.y,
                    width: 60,
                    height: 60,
                  }}
                >
                  <Skeleton
                    variant="circular"
                    width={60}
                    height={60}
                    sx={{ opacity: 0.3 }}
                  />
                </Box>
              ))}
          </Box>
        </Box>
      </DndContext>

      {/* Drag onboarding coach mark */}
      {!coachDismissed && !loading && notes.length > 0 && (() => {
        const firstFree = freeNotePositions[0];
        if (!firstFree) return null;
        const screenX = firstFree.x * viewport.zoom + viewport.offsetX;
        const screenY = firstFree.y * viewport.zoom + viewport.offsetY + firstFree.radius * viewport.zoom + 8;
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
