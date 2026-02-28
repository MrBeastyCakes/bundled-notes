"use client";

import { useState, useMemo } from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import AppShell from "@/components/layout/AppShell";
import NoteList from "@/components/notes/NoteList";
import NoteEditor from "@/components/notes/NoteEditor";
import BundleBreadcrumbs from "@/components/bundles/BundleBreadcrumbs";
import CreateBundleDialog from "@/components/bundles/CreateBundleDialog";
import { useNotes } from "@/lib/hooks/useNotes";
import { useAuth } from "@/lib/hooks/useAuth";
import { createNote } from "@/lib/firebase/firestore";

export default function NotesPage() {
  const { user } = useAuth();
  const [activeBundleId, setActiveBundleId] = useState<string | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [bundleDialogOpen, setBundleDialogOpen] = useState(false);
  const [bundleDialogParentId, setBundleDialogParentId] = useState<string | null>(null);

  const { pinnedNotes, unpinnedNotes, allNotes, loading } = useNotes(activeBundleId);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  const selectedNote = useMemo(
    () => allNotes.find((n) => n.id === selectedNoteId) || null,
    [allNotes, selectedNoteId]
  );

  const handleCreateNote = async () => {
    if (!user) return;
    const docRef = await createNote(user.uid, {
      title: "",
      content: "",
      bundleId: activeBundleId,
    });
    setSelectedNoteId(docRef.id);
  };

  const handleOpenBundleDialog = (parentId: string | null) => {
    setBundleDialogParentId(parentId);
    setBundleDialogOpen(true);
  };

  return (
    <AppShell
      activeBundleId={activeBundleId}
      onSelectBundle={(id) => {
        setActiveBundleId(id);
        setSelectedNoteId(null);
      }}
      onCreateBundle={handleOpenBundleDialog}
    >
      <Box sx={{ display: "flex", height: "calc(100vh - 64px)" }}>
        {/* Note list panel */}
        <Box
          sx={{
            width: isMobile && selectedNote ? 0 : { xs: "100%", lg: 360 },
            minWidth: isMobile && selectedNote ? 0 : { xs: "100%", lg: 360 },
            borderRight: 1,
            borderColor: "divider",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            transition: "all 300ms cubic-bezier(0.2, 0, 0, 1)",
          }}
        >
          <Box sx={{ p: 2, pb: 0 }}>
            <BundleBreadcrumbs
              activeBundleId={activeBundleId}
              onSelectBundle={setActiveBundleId}
            />
          </Box>
          <NoteList
            pinnedNotes={pinnedNotes}
            unpinnedNotes={unpinnedNotes}
            selectedNoteId={selectedNoteId}
            onSelectNote={setSelectedNoteId}
            onCreateNote={handleCreateNote}
            loading={loading}
          />
        </Box>

        {/* Editor panel */}
        <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
          {selectedNote ? (
            <NoteEditor
              note={selectedNote}
              onDeleted={() => setSelectedNoteId(null)}
            />
          ) : (
            <Box
              sx={{
                height: "100%",
                display: { xs: "none", lg: "flex" },
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box sx={{ textAlign: "center", color: "text.secondary" }}>
                Select a note or create a new one
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      <CreateBundleDialog
        open={bundleDialogOpen}
        onClose={() => setBundleDialogOpen(false)}
        defaultParentId={bundleDialogParentId}
      />
    </AppShell>
  );
}
