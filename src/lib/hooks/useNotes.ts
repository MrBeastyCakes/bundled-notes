"use client";

import { useEffect, useState, useMemo } from "react";
import { subscribeToNotes } from "@/lib/firebase/firestore";
import { useAuth } from "./useAuth";
import type { Note } from "@/lib/types";

interface UseNotesOptions {
  bundleId?: string | null;
  searchQuery?: string;
  filterTag?: string | null;
}

export function useNotes({ bundleId = null, searchQuery = "", filterTag = null }: UseNotesOptions = {}) {
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
      // Ensure tags field exists for older notes
      const normalized = data.map((n) => ({ ...n, tags: n.tags || [] }));
      setNotes(normalized);
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  const filteredNotes = useMemo(() => {
    let result = notes;

    // Filter by bundle
    if (bundleId) {
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
  }, [notes, bundleId, filterTag, searchQuery]);

  const pinnedNotes = useMemo(
    () => filteredNotes.filter((n) => n.pinned),
    [filteredNotes]
  );

  const unpinnedNotes = useMemo(
    () => filteredNotes.filter((n) => !n.pinned),
    [filteredNotes]
  );

  // Collect all unique tags across all notes
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    notes.forEach((n) => n.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [notes]);

  return { notes: filteredNotes, pinnedNotes, unpinnedNotes, allNotes: notes, allTags, loading };
}
