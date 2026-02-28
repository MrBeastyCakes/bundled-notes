"use client";

import { useEffect, useState, useMemo } from "react";
import { subscribeToNotes } from "@/lib/firebase/firestore";
import { useAuth } from "./useAuth";
import type { Note } from "@/lib/types";

export function useNotes(activeBundleId: string | null = null) {
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
      setNotes(data);
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  const filteredNotes = useMemo(() => {
    if (!activeBundleId) return notes;
    return notes.filter((n) => n.bundleId === activeBundleId);
  }, [notes, activeBundleId]);

  const pinnedNotes = useMemo(
    () => filteredNotes.filter((n) => n.pinned),
    [filteredNotes]
  );

  const unpinnedNotes = useMemo(
    () => filteredNotes.filter((n) => !n.pinned),
    [filteredNotes]
  );

  return { notes: filteredNotes, pinnedNotes, unpinnedNotes, allNotes: notes, loading };
}
