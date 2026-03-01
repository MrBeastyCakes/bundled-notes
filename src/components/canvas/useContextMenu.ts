"use client";

import { useState, useCallback, useMemo, createElement } from "react";
import type { ContextMenuItem } from "./CanvasContextMenu";
import type { Note, Bundle } from "@/lib/types";

type TargetType = "canvas" | "planet" | "star" | "blackhole";

interface ContextMenuState {
  open: boolean;
  position: { x: number; y: number };
  canvasPosition: { x: number; y: number };
  targetType: TargetType;
  targetId: string | null;
}

const INITIAL_STATE: ContextMenuState = {
  open: false,
  position: { x: 0, y: 0 },
  canvasPosition: { x: 0, y: 0 },
  targetType: "canvas",
  targetId: null,
};

export interface UseContextMenuOptions {
  screenToCanvas: (x: number, y: number) => { x: number; y: number };
  notes: Note[];
  bundles: Bundle[];
  onCreateNote: (x: number, y: number) => void;
  onCreateBundle: () => void;
  onEditNote: (note: Note) => void;
  onToggleFavorite: (noteId: string) => void;
  onTogglePin: (noteId: string) => void;
  onArchiveNote: (noteId: string) => void;
  onDeleteNote: (noteId: string) => void;
  onRenameBundle: (bundleId: string) => void;
  onRecolorBundle: (bundleId: string) => void;
  onDeleteBundle: (bundleId: string) => void;
  onUnparentBundle: (bundleId: string) => void;
  onAddNoteToBundle: (bundleId: string) => void;
  onResetViewport: () => void;
}

// Icon factory using createElement to avoid JSX in .ts file
function icon(iconComponent: React.ElementType): React.ReactNode {
  return createElement(iconComponent, { sx: { fontSize: 18 } });
}

export function useContextMenu(
  options: UseContextMenuOptions,
  icons: {
    AddCircle: React.ElementType;
    Star: React.ElementType;
    StarOutline: React.ElementType;
    CenterFocus: React.ElementType;
    Edit: React.ElementType;
    PushPin: React.ElementType;
    PushPinOutlined: React.ElementType;
    Archive: React.ElementType;
    Delete: React.ElementType;
    Palette: React.ElementType;
    Eject: React.ElementType;
  }
) {
  const [state, setState] = useState<ContextMenuState>(INITIAL_STATE);

  const close = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();

      const target = (e.target as HTMLElement).closest?.(
        "[data-context-target]"
      ) as HTMLElement | null;

      const targetType = (target?.getAttribute("data-context-target") as TargetType) || "canvas";
      const targetId = target?.getAttribute("data-context-id") || null;

      const canvasPos = options.screenToCanvas(e.clientX, e.clientY);

      setState({
        open: true,
        position: { x: e.clientX, y: e.clientY },
        canvasPosition: canvasPos,
        targetType,
        targetId,
      });
    },
    [options]
  );

  const items = useMemo((): ContextMenuItem[] => {
    const { targetType, targetId } = state;

    if (targetType === "canvas") {
      return [
        {
          id: "new-planet",
          label: "New Planet",
          icon: icon(icons.AddCircle),
          onClick: () => options.onCreateNote(state.canvasPosition.x, state.canvasPosition.y),
        },
        {
          id: "new-star",
          label: "New Star System",
          icon: icon(icons.Star),
          onClick: () => options.onCreateBundle(),
          dividerAfter: true,
        },
        {
          id: "reset-view",
          label: "Reset View",
          icon: icon(icons.CenterFocus),
          onClick: () => options.onResetViewport(),
        },
      ];
    }

    if (targetType === "planet" && targetId) {
      const note = options.notes.find((n) => n.id === targetId);
      if (!note) return [];
      return [
        {
          id: "edit",
          label: "Edit",
          icon: icon(icons.Edit),
          onClick: () => options.onEditNote(note),
        },
        {
          id: "favorite",
          label: note.favorited ? "Unfavorite" : "Favorite",
          icon: icon(note.favorited ? icons.Star : icons.StarOutline),
          onClick: () => options.onToggleFavorite(targetId),
        },
        {
          id: "pin",
          label: note.pinned ? "Unpin" : "Pin",
          icon: icon(note.pinned ? icons.PushPin : icons.PushPinOutlined),
          dividerAfter: true,
          onClick: () => options.onTogglePin(targetId),
        },
        {
          id: "archive",
          label: "Archive",
          icon: icon(icons.Archive),
          onClick: () => options.onArchiveNote(targetId),
        },
        {
          id: "delete",
          label: "Move to Trash",
          icon: icon(icons.Delete),
          onClick: () => options.onDeleteNote(targetId),
          destructive: true,
        },
      ];
    }

    if (targetType === "star" && targetId) {
      const bundle = options.bundles.find((b) => b.id === targetId);
      if (!bundle) return [];
      const starItems: ContextMenuItem[] = [
        {
          id: "rename",
          label: "Rename",
          icon: icon(icons.Edit),
          onClick: () => options.onRenameBundle(targetId),
        },
        {
          id: "recolor",
          label: "Change Color",
          icon: icon(icons.Palette),
          onClick: () => options.onRecolorBundle(targetId),
        },
        {
          id: "add-planet",
          label: "Add Planet",
          icon: icon(icons.AddCircle),
          onClick: () => options.onAddNoteToBundle(targetId),
          dividerAfter: true,
        },
      ];
      if (bundle.parentBundleId) {
        starItems.push({
          id: "unparent",
          label: "Unparent",
          icon: icon(icons.Eject),
          onClick: () => options.onUnparentBundle(targetId),
        });
      }
      starItems.push({
        id: "delete",
        label: "Delete Star",
        icon: icon(icons.Delete),
        onClick: () => options.onDeleteBundle(targetId),
        destructive: true,
      });
      return starItems;
    }

    if (targetType === "blackhole" && targetId) {
      const bundle = options.bundles.find((b) => b.id === targetId);
      if (!bundle) return [];
      return [
        {
          id: "rename",
          label: "Rename",
          icon: icon(icons.Edit),
          onClick: () => options.onRenameBundle(targetId),
        },
        {
          id: "recolor",
          label: "Change Color",
          icon: icon(icons.Palette),
          onClick: () => options.onRecolorBundle(targetId),
        },
        {
          id: "add-star",
          label: "Add Star",
          icon: icon(icons.Star),
          onClick: () => options.onCreateBundle(),
          dividerAfter: true,
        },
        {
          id: "delete",
          label: "Delete Black Hole",
          icon: icon(icons.Delete),
          onClick: () => options.onDeleteBundle(targetId),
          destructive: true,
        },
      ];
    }

    return [];
  }, [state, options, icons]);

  return {
    ...state,
    items,
    close,
    handleContextMenu,
  };
}
