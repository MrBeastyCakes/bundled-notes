"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { Box, Typography, Skeleton, IconButton } from "@mui/material";
import NoteAddOutlined from "@mui/icons-material/NoteAddOutlined";
import CloseIcon from "@mui/icons-material/Close";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import StarIcon from "@mui/icons-material/Star";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import CenterFocusStrongIcon from "@mui/icons-material/CenterFocusStrong";
import EditIcon from "@mui/icons-material/Edit";
import PushPinIcon from "@mui/icons-material/PushPin";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import ArchiveIcon from "@mui/icons-material/Archive";
import DeleteIcon from "@mui/icons-material/Delete";
import PaletteIcon from "@mui/icons-material/Palette";
import EjectIcon from "@mui/icons-material/Eject";
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
import { useSelectionState } from "./useSelectionState";
import { useContextMenu } from "./useContextMenu";
import { useKeyboardShortcuts } from "./useKeyboardShortcuts";
import QuickActionRing from "./QuickActionRing";
import SpaceBackground from "./SpaceBackground";
import Planet from "./Planet";
import StarSystem from "./StarSystem";
import BlackHole from "./BlackHole";
import DragActionZones from "./DragActionZones";
import EditorOverlay from "./EditorOverlay";
import FloatingControls from "./FloatingControls";
import CommandPalette from "./CommandPalette";
import CanvasContextMenu from "./CanvasContextMenu";
import ConfirmDialog from "./ConfirmDialog";
import BundleColorPicker from "./BundleColorPicker";
import CreateBundlePopover from "./CreateBundlePopover";
import { useAuth } from "@/lib/hooks/useAuth";
import { useNotes } from "@/lib/hooks/useNotes";
import { useBundles } from "@/lib/hooks/useBundles";
import {
  createNote,
  createBundle,
  updateNote,
  updateBundle,
  deleteBundle,
  softDeleteNote,
  moveNoteToBundle,
  updateNotePosition,
} from "@/lib/firebase/firestore";
// bundleColors used internally by CreateBundlePopover/BundleColorPicker
import type { Note, NoteView } from "@/lib/types";

// Icon map for context menu hook
const CONTEXT_ICONS = {
  AddCircle: AddCircleOutlineIcon,
  Star: StarIcon,
  StarOutline: StarOutlineIcon,
  CenterFocus: CenterFocusStrongIcon,
  Edit: EditIcon,
  PushPin: PushPinIcon,
  PushPinOutlined: PushPinOutlinedIcon,
  Archive: ArchiveIcon,
  Delete: DeleteIcon,
  Palette: PaletteIcon,
  Eject: EjectIcon,
} as const;

export default function NoteCanvas() {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<NoteView>("active");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [coachDismissed, setCoachDismissed] = useState(true);

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
  }>({ open: false, title: "", message: "", onConfirm: () => {} });

  // Inline rename state
  const [renamingBundleId, setRenamingBundleId] = useState<string | null>(null);

  // Color picker state
  const [colorPickerState, setColorPickerState] = useState<{
    open: boolean;
    bundleId: string | null;
    position: { x: number; y: number } | null;
  }>({ open: false, bundleId: null, position: null });

  // Create bundle popover state
  const [createBundleState, setCreateBundleState] = useState<{
    open: boolean;
    position: { x: number; y: number } | null;
  }>({ open: false, position: null });

  const { notes, allNotes, allTags, counts, loading } = useNotes({ view: activeView });
  const { bundles, tree } = useBundles();
  const selection = useSelectionState();

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
    selection.deselect();
  }, [viewport, selection]);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setIsDragging(false);
      viewport.setDragActive(false);
      if (!user) return;

      const { active, over, delta } = event;
      const activeId = active.id as string;
      const activeData = active.data?.current;

      // --- Star dragged onto a black hole → reparent bundle ---
      if (activeData?.type === "star" && activeData?.bundleId) {
        const starBundleId = activeData.bundleId as string;
        if (typeof over?.id === "string" && over.id.startsWith("black-hole-")) {
          const parentBundleId = over.data?.current?.bundleId || null;
          if (parentBundleId && parentBundleId !== starBundleId) {
            await updateBundle(user.uid, starBundleId, { parentBundleId });
          }
        }
        if (!over) {
          const bundle = bundles.find((b) => b.id === starBundleId);
          if (bundle?.parentBundleId) {
            await updateBundle(user.uid, starBundleId, { parentBundleId: null });
          }
        }
        return;
      }

      // --- Planet (note) drag ---
      const noteId = activeId;
      const note = notes.find((n) => n.id === noteId);
      if (!note) return;

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

      if (typeof over?.id === "string" && over.id.startsWith("star-system-")) {
        const bundleId = over.data?.current?.bundleId || null;
        if (bundleId !== note.bundleId) {
          await moveNoteToBundle(user.uid, noteId, bundleId);
        }
        return;
      }

      if (typeof over?.id === "string" && over.id.startsWith("black-hole-")) {
        const bundleId = over.data?.current?.bundleId || null;
        if (bundleId !== note.bundleId) {
          await moveNoteToBundle(user.uid, noteId, bundleId);
        }
        return;
      }

      const pos = allNotePositions.get(noteId);
      if (pos) {
        const newX = pos.x + delta.x / viewport.zoom;
        const newY = pos.y + delta.y / viewport.zoom;
        await updateNotePosition(user.uid, noteId, Math.round(newX), Math.round(newY));
        if (note.bundleId && !over) {
          await moveNoteToBundle(user.uid, noteId, null);
        }
      }
    },
    [user, notes, bundles, allNotePositions, viewport]
  );

  // Single-click note → select it
  const handleNoteSelect = useCallback(
    (note: Note) => {
      if (isEditing || viewport.isAnimating) return;
      selection.select(note.id, "planet");
    },
    [isEditing, viewport.isAnimating, selection]
  );

  // Double-click note → zoom in → enter edit mode
  const handleNoteEdit = useCallback(
    (note: Note) => {
      if (isEditing || viewport.isAnimating) return;
      const pos = allNotePositions.get(note.id);
      if (!pos) return;

      selection.deselect();
      setEditingNoteId(note.id);
      viewport.zoomToCard(
        pos.x - CARD_WIDTH / 2,
        pos.y - CARD_HEIGHT / 2,
        CARD_WIDTH,
        CARD_HEIGHT
      );
      setTimeout(() => setIsEditing(true), 450);
    },
    [isEditing, viewport, allNotePositions, CARD_WIDTH, CARD_HEIGHT, selection]
  );

  // Close editor → zoom back out
  const handleCloseEditor = useCallback(() => {
    setIsEditing(false);
    viewport.zoomBack();
    setTimeout(() => setEditingNoteId(null), 450);
  }, [viewport]);

  // Create note at position
  const handleCreateNote = useCallback(
    async (canvasX?: number, canvasY?: number) => {
      if (!user) return;
      let finalX = canvasX;
      let finalY = canvasY;
      if (finalX === undefined || finalY === undefined) {
        const center = viewport.screenToCanvas(window.innerWidth / 2, window.innerHeight / 2);
        finalX = center.x;
        finalY = center.y;
      }
      const docRef = await createNote(user.uid, { title: "", content: "", bundleId: null });
      await updateNotePosition(user.uid, docRef.id, Math.round(finalX), Math.round(finalY));
      setTimeout(() => {
        const newNote = allNotes.find((n) => n.id === docRef.id);
        if (newNote) handleNoteEdit(newNote);
      }, 600);
    },
    [user, allNotes, handleNoteEdit, viewport]
  );

  // Create bundle — opens popover (or quick-creates from context menu)
  const handleCreateBundle = useCallback(() => {
    setCreateBundleState({
      open: true,
      position: { x: window.innerWidth / 2 - 130, y: window.innerHeight / 2 - 100 },
    });
  }, []);

  // Delete bundle with confirmation
  const handleDeleteBundle = useCallback(
    (bundleId: string) => {
      const bundle = bundles.find((b) => b.id === bundleId);
      if (!bundle || !user) return;

      const isBlackHole = bundles.some((b) => b.parentBundleId === bundleId);
      const label = isBlackHole ? "black hole" : "star";

      setConfirmDialog({
        open: true,
        title: `Delete ${label}?`,
        message: `"${bundle.name}" will be deleted. All notes will become free-floating planets.`,
        confirmLabel: "Delete",
        onConfirm: async () => {
          // Unassign all notes from this bundle
          const bundleNotes = notes.filter((n) => n.bundleId === bundleId);
          for (const note of bundleNotes) {
            await moveNoteToBundle(user.uid, note.id, null);
          }
          // Unparent child bundles
          const childBundles = bundles.filter((b) => b.parentBundleId === bundleId);
          for (const child of childBundles) {
            await updateBundle(user.uid, child.id, { parentBundleId: null });
          }
          await deleteBundle(user.uid, bundleId);
          selection.deselect();
          setConfirmDialog((prev) => ({ ...prev, open: false }));
        },
      });
    },
    [user, notes, bundles, selection]
  );

  // Delete note with confirmation
  const handleDeleteNote = useCallback(
    (noteId: string) => {
      const note = notes.find((n) => n.id === noteId);
      if (!note || !user) return;

      setConfirmDialog({
        open: true,
        title: "Move to Trash?",
        message: `"${note.title || "Untitled"}" will be moved to trash.`,
        confirmLabel: "Trash",
        onConfirm: async () => {
          await softDeleteNote(user.uid, noteId);
          selection.deselect();
          setConfirmDialog((prev) => ({ ...prev, open: false }));
        },
      });
    },
    [user, notes, selection]
  );

  // Context menu action handlers
  const handleToggleFavorite = useCallback(
    async (noteId: string) => {
      if (!user) return;
      const note = notes.find((n) => n.id === noteId);
      if (note) await updateNote(user.uid, noteId, { favorited: !note.favorited });
    },
    [user, notes]
  );

  const handleTogglePin = useCallback(
    async (noteId: string) => {
      if (!user) return;
      const note = notes.find((n) => n.id === noteId);
      if (note) await updateNote(user.uid, noteId, { pinned: !note.pinned });
    },
    [user, notes]
  );

  const handleArchiveNote = useCallback(
    async (noteId: string) => {
      if (!user) return;
      await updateNote(user.uid, noteId, { archived: true });
    },
    [user]
  );

  const handleUnparentBundle = useCallback(
    async (bundleId: string) => {
      if (!user) return;
      await updateBundle(user.uid, bundleId, { parentBundleId: null });
    },
    [user]
  );

  const handleAddNoteToBundle = useCallback(
    async (bundleId: string) => {
      if (!user) return;
      const docRef = await createNote(user.uid, { title: "", content: "", bundleId });
      setTimeout(() => {
        const newNote = allNotes.find((n) => n.id === docRef.id);
        if (newNote) handleNoteEdit(newNote);
      }, 600);
    },
    [user, allNotes, handleNoteEdit]
  );

  // Rename bundle — activates inline rename field on the star/blackhole
  const handleRenameBundle = useCallback((bundleId: string) => {
    setRenamingBundleId(bundleId);
    selection.select(bundleId, bundles.some((b) => b.parentBundleId === bundleId) ? "blackhole" : "star");
  }, [bundles, selection]);

  const handleRenameCommit = useCallback(
    async (newName: string) => {
      if (!user || !renamingBundleId) return;
      await updateBundle(user.uid, renamingBundleId, { name: newName });
      setRenamingBundleId(null);
    },
    [user, renamingBundleId]
  );

  const handleRenameCancel = useCallback(() => {
    setRenamingBundleId(null);
  }, []);

  // Recolor bundle — opens color picker popover
  const handleRecolorBundle = useCallback((bundleId: string) => {
    // Position the color picker near the center of the viewport
    setColorPickerState({
      open: true,
      bundleId,
      position: { x: window.innerWidth / 2 - 80, y: window.innerHeight / 2 - 60 },
    });
  }, []);

  const handleColorSelect = useCallback(
    async (color: string) => {
      if (!user || !colorPickerState.bundleId) return;
      await updateBundle(user.uid, colorPickerState.bundleId, { color });
    },
    [user, colorPickerState.bundleId]
  );

  // Create bundle with name and color from popover
  const handleCreateBundleWithDetails = useCallback(
    async (name: string, color: string) => {
      if (!user) return;
      await createBundle(user.uid, {
        name,
        color,
        icon: "",
        parentBundleId: null,
        order: bundles.length,
      });
    },
    [user, bundles]
  );

  // Context menu options (memoized)
  const contextMenuOptions = useMemo(
    () => ({
      screenToCanvas: viewport.screenToCanvas,
      notes,
      bundles,
      onCreateNote: (x: number, y: number) => handleCreateNote(x, y),
      onCreateBundle: handleCreateBundle,
      onEditNote: handleNoteEdit,
      onToggleFavorite: handleToggleFavorite,
      onTogglePin: handleTogglePin,
      onArchiveNote: handleArchiveNote,
      onDeleteNote: handleDeleteNote,
      onRenameBundle: handleRenameBundle,
      onRecolorBundle: handleRecolorBundle,
      onDeleteBundle: handleDeleteBundle,
      onUnparentBundle: handleUnparentBundle,
      onAddNoteToBundle: handleAddNoteToBundle,
      onResetViewport: viewport.resetViewport,
    }),
    [
      viewport.screenToCanvas,
      viewport.resetViewport,
      notes,
      bundles,
      handleCreateNote,
      handleCreateBundle,
      handleNoteEdit,
      handleToggleFavorite,
      handleTogglePin,
      handleArchiveNote,
      handleDeleteNote,
      handleRenameBundle,
      handleRecolorBundle,
      handleDeleteBundle,
      handleUnparentBundle,
      handleAddNoteToBundle,
    ]
  );

  const contextMenu = useContextMenu(contextMenuOptions, CONTEXT_ICONS);

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target !== e.currentTarget) return;
      if (isEditing) return;
      const { x, y } = viewport.screenToCanvas(e.clientX, e.clientY);
      handleCreateNote(x, y);
    },
    [viewport, handleCreateNote, isEditing]
  );

  // Click on empty canvas → deselect
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget && selection.selectedId) {
        selection.deselect();
      }
    },
    [selection]
  );

  const handleViewChange = useCallback((view: NoteView) => {
    setActiveView(view);
    setEditingNoteId(null);
    setIsEditing(false);
  }, []);

  // Escape cascade handler
  const handleEscape = useCallback(() => {
    if (isEditing) return;
    if (renamingBundleId) { setRenamingBundleId(null); return; }
    if (colorPickerState.open) { setColorPickerState({ open: false, bundleId: null, position: null }); return; }
    if (createBundleState.open) { setCreateBundleState({ open: false, position: null }); return; }
    if (contextMenu.open) { contextMenu.close(); return; }
    if (searchOpen) { setSearchOpen(false); return; }
    if (selection.selectedId) { selection.deselect(); }
  }, [isEditing, renamingBundleId, colorPickerState.open, createBundleState.open, contextMenu, searchOpen, selection]);

  // Delete selected object handler
  const handleDeleteSelected = useCallback(() => {
    if (!selection.selectedId) return;
    if (selection.selectedType === "planet") {
      handleDeleteNote(selection.selectedId);
    } else if (selection.selectedType === "star" || selection.selectedType === "blackhole") {
      handleDeleteBundle(selection.selectedId);
    }
  }, [selection, handleDeleteNote, handleDeleteBundle]);

  // Rename selected bundle handler
  const handleRenameSelected = useCallback(() => {
    if (selection.selectedId && (selection.selectedType === "star" || selection.selectedType === "blackhole")) {
      handleRenameBundle(selection.selectedId);
    }
  }, [selection, handleRenameBundle]);

  // Centralized keyboard shortcuts
  useKeyboardShortcuts({
    isEditing,
    selectedId: selection.selectedId,
    selectedType: selection.selectedType,
    onCreateNote: () => handleCreateNote(),
    onCreateBundle: handleCreateBundle,
    onDeleteSelected: handleDeleteSelected,
    onRenameSelected: handleRenameSelected,
    onToggleSearch: () => setSearchOpen((prev) => !prev),
    onEscape: handleEscape,
  });

  // Compute quick action ring position based on selection
  const quickActionTarget = useMemo(() => {
    if (!selection.selectedId || !selection.selectedType || isDragging || isEditing) return null;

    if (selection.selectedType === "planet") {
      // Check free planets first
      const free = freeNotePositions.find((fp) => fp.note.id === selection.selectedId);
      if (free) {
        return { centerX: free.x, centerY: free.y, radius: free.radius, note: free.note, bundle: null };
      }
      // Check planets in star systems
      for (const sys of starSystems) {
        const planet = sys.planets.find((p) => p.note.id === selection.selectedId);
        if (planet) {
          // Orbital planets move — skip quick actions for them (they're inside orbit rings)
          return null;
        }
      }
      return null;
    }

    if (selection.selectedType === "star") {
      const sys = starSystems.find((s) => s.bundle.id === selection.selectedId);
      if (sys) {
        return { centerX: sys.centerX, centerY: sys.centerY, radius: 20, note: null, bundle: sys.bundle };
      }
      return null;
    }

    if (selection.selectedType === "blackhole") {
      const bh = blackHoles.find((b) => b.bundle.id === selection.selectedId);
      if (bh) {
        return { centerX: bh.centerX, centerY: bh.centerY, radius: 30, note: null, bundle: bh.bundle };
      }
      return null;
    }

    return null;
  }, [selection, freeNotePositions, starSystems, blackHoles, isDragging, isEditing]);

  // Quick action context menu trigger (for "More" button)
  const handleQuickActionContextMenu = useCallback(
    (e: React.MouseEvent) => {
      if (!e) return;
      contextMenu.handleContextMenu(e);
    },
    [contextMenu]
  );

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

        <Box
          ref={viewport.containerRef}
          {...(isEditing ? {} : viewport.handlers)}
          onDoubleClick={isEditing ? undefined : handleDoubleClick}
          onClick={handleCanvasClick}
          onContextMenu={isEditing ? undefined : contextMenu.handleContextMenu}
          sx={{
            position: "absolute",
            inset: 0,
            cursor: isDragging ? "grabbing" : "default",
            touchAction: "none",
          }}
        >
          <Box
            onClick={handleCanvasClick}
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
                    onNoteSelect={handleNoteSelect}
                    onNoteEdit={handleNoteEdit}
                    selectedNoteId={selection.selectedType === "planet" ? selection.selectedId : null}
                    isSelected={selection.selectedType === "blackhole" && selection.selectedId === bh.bundle.id}
                    onSelect={() => selection.select(bh.bundle.id, "blackhole")}
                    isRenaming={renamingBundleId === bh.bundle.id}
                    onRenameCommit={handleRenameCommit}
                    onRenameCancel={handleRenameCancel}
                  />
                </motion.div>
              ))}

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
                    onNoteSelect={handleNoteSelect}
                    onNoteEdit={handleNoteEdit}
                    selectedNoteId={selection.selectedType === "planet" ? selection.selectedId : null}
                    isSelected={selection.selectedType === "star" && selection.selectedId === sys.bundle.id}
                    onSelect={() => selection.select(sys.bundle.id, "star")}
                    isRenaming={renamingBundleId === sys.bundle.id}
                    onRenameCommit={handleRenameCommit}
                    onRenameCancel={handleRenameCancel}
                  />
                </motion.div>
              ))}

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
                    isSelected={selection.selectedType === "planet" && selection.selectedId === fn.note.id}
                    onSelect={() => handleNoteSelect(fn.note)}
                    onEdit={() => handleNoteEdit(fn.note)}
                  />
                </motion.div>
              ))}

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
                  <Skeleton variant="circular" width={60} height={60} sx={{ opacity: 0.3 }} />
                </Box>
              ))}

            {/* Quick action ring for selected objects */}
            {quickActionTarget && (
              <QuickActionRing
                visible={!!selection.selectedId && !renamingBundleId}
                selectedType={selection.selectedType}
                note={quickActionTarget.note}
                bundle={quickActionTarget.bundle}
                onEditNote={
                  quickActionTarget.note
                    ? () => handleNoteEdit(quickActionTarget.note!)
                    : undefined
                }
                onToggleFavorite={
                  quickActionTarget.note
                    ? () => handleToggleFavorite(quickActionTarget.note!.id)
                    : undefined
                }
                onRenameBundle={
                  quickActionTarget.bundle
                    ? () => handleRenameBundle(quickActionTarget.bundle!.id)
                    : undefined
                }
                onRecolorBundle={
                  quickActionTarget.bundle
                    ? () => handleRecolorBundle(quickActionTarget.bundle!.id)
                    : undefined
                }
                onOpenContextMenu={handleQuickActionContextMenu}
                centerX={quickActionTarget.centerX}
                centerY={quickActionTarget.centerY}
                objectRadius={quickActionTarget.radius}
                zoom={viewport.zoom}
              />
            )}
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

      {/* Context menu */}
      <CanvasContextMenu
        open={contextMenu.open}
        anchorPosition={contextMenu.position}
        items={contextMenu.items}
        onClose={contextMenu.close}
      />

      {/* Confirm dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel={confirmDialog.confirmLabel}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
      />

      {/* Bundle color picker */}
      <BundleColorPicker
        open={colorPickerState.open}
        anchorPosition={colorPickerState.position}
        currentColor={
          colorPickerState.bundleId
            ? bundles.find((b) => b.id === colorPickerState.bundleId)?.color || ""
            : ""
        }
        onSelectColor={handleColorSelect}
        onClose={() => setColorPickerState({ open: false, bundleId: null, position: null })}
      />

      {/* Create bundle popover */}
      <CreateBundlePopover
        open={createBundleState.open}
        anchorPosition={createBundleState.position}
        onClose={() => setCreateBundleState({ open: false, position: null })}
        onCreate={handleCreateBundleWithDetails}
      />

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
          handleNoteEdit(note);
        }}
      />
    </Box>
  );
}
