"use client";

import { useEffect, useState, useMemo } from "react";
import { subscribeToNotes } from "@/lib/firebase/firestore";
import { useAuth } from "./useAuth";
import type { Note, NoteView } from "@/lib/types";

interface UseNotesOptions {
  bundleId?: string | null;
  searchQuery?: string;
  filterTag?: string | null;
  view?: NoteView;
}

export function useNotes({
  bundleId = null,
  searchQuery = "",
  filterTag = null,
  view = "active",
}: UseNotesOptions = {}) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setNotes([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = subscribeToNotes(user.uid, (data) => {
      // Ensure new fields exist for older notes
      const normalized = data.map((n) => ({
        ...n,
        tags: n.tags || [],
        favorited: n.favorited ?? false,
        archived: n.archived ?? false,
        deleted: n.deleted ?? false,
        deletedAt: n.deletedAt ?? null,
        positionX: n.positionX ?? null,
        positionY: n.positionY ?? null,
      }));
      setNotes(normalized);
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  // View-filtered notes
  const viewFilteredNotes = useMemo(() => {
    switch (view) {
      case "favorites":
        return notes.filter((n) => n.favorited && !n.archived && !n.deleted);
      case "archived":
        return notes.filter((n) => n.archived && !n.deleted);
      case "trash":
        return notes.filter((n) => n.deleted);
      case "active":
      default:
        return notes.filter((n) => !n.archived && !n.deleted);
    }
  }, [notes, view]);

  const filteredNotes = useMemo(() => {
    let result = viewFilteredNotes;

    // Filter by bundle (only in active/favorites views)
    if (bundleId && (view === "active" || view === "favorites")) {
      result = result.filter((n) => n.bundleId === bundleId);
    }

    // Filter by tag
    if (filterTag) {
      result = result.filter((n) => n.tags.includes(filterTag));
    }

    // Search by query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return result;
  }, [viewFilteredNotes, bundleId, filterTag, searchQuery, view]);

  const pinnedNotes = useMemo(
    () => filteredNotes.filter((n) => n.pinned),
    [filteredNotes]
  );

  const unpinnedNotes = useMemo(
    () => filteredNotes.filter((n) => !n.pinned),
    [filteredNotes]
  );

  // Collect all unique tags across all notes (not deleted)
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    notes
      .filter((n) => !n.deleted)
      .forEach((n) => n.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [notes]);

  // Counts for sidebar badges
  const counts = useMemo(() => ({
    active: notes.filter((n) => !n.archived && !n.deleted).length,
    favorites: notes.filter((n) => n.favorited && !n.archived && !n.deleted).length,
    archived: notes.filter((n) => n.archived && !n.deleted).length,
    trash: notes.filter((n) => n.deleted).length,
  }), [notes]);

  return {
    notes: filteredNotes,
    pinnedNotes,
    unpinnedNotes,
    allNotes: notes,
    allTags,
    counts,
    loading,
  };
}
