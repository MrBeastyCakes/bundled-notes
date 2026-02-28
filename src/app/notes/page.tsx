"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Box, TextField, InputAdornment, Typography, IconButton, useMediaQuery, useTheme } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import StarIcon from "@mui/icons-material/Star";
import ArchiveIcon from "@mui/icons-material/Archive";
import DeleteIcon from "@mui/icons-material/Delete";
import AppShell from "@/components/layout/AppShell";
import NoteList from "@/components/notes/NoteList";
import NoteEditor from "@/components/notes/NoteEditor";
import BundleBreadcrumbs from "@/components/bundles/BundleBreadcrumbs";
import CreateBundleDialog from "@/components/bundles/CreateBundleDialog";
import TrashBanner from "@/components/notes/TrashBanner";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import PageTransition from "@/components/layout/PageTransition";
import { TagFilterBar } from "@/components/notes/TagInput";
import { useNotes } from "@/lib/hooks/useNotes";
import { useAuth } from "@/lib/hooks/useAuth";
import { createNote, reorderNotes } from "@/lib/firebase/firestore";
import type { NoteView } from "@/lib/types";

const VIEW_LABELS: Record<NoteView, { label: string; icon: React.ReactNode; emptyText: string }> = {
  active: { label: "All Notes", icon: null, emptyText: "No notes yet. Create one!" },
  favorites: { label: "Favorites", icon: <StarIcon sx={{ color: "warning.main" }} />, emptyText: "No favorite notes. Star a note to see it here." },
  archived: { label: "Archive", icon: <ArchiveIcon />, emptyText: "No archived notes." },
  trash: { label: "Trash", icon: <DeleteIcon />, emptyText: "Trash is empty." },
};

export default function NotesPage() {
  const { user } = useAuth();
  const [activeBundleId, setActiveBundleId] = useState<string | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [bundleDialogOpen, setBundleDialogOpen] = useState(false);
  const [bundleDialogParentId, setBundleDialogParentId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<NoteView>("active");

  // Mobile scroll-hide bottom nav
  const [bottomNavVisible, setBottomNavVisible] = useState(true);
  const lastScrollY = useRef(0);

  const { pinnedNotes, unpinnedNotes, allNotes, allTags, counts, loading } = useNotes({
    bundleId: activeBundleId,
    searchQuery,
    filterTag,
    view: activeView,
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  const selectedNote = useMemo(
    () => allNotes.find((n) => n.id === selectedNoteId) || null,
    [allNotes, selectedNoteId]
  );

  // Hide bottom nav on scroll down
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setBottomNavVisible(currentY <= lastScrollY.current || currentY < 50);
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const handleViewChange = (view: NoteView) => {
    setActiveView(view);
    setSelectedNoteId(null);
    setFilterTag(null);
    setSearchQuery("");
  };

  const handleReorder = async (noteIds: string[]) => {
    if (!user) return;
    await reorderNotes(user.uid, noteIds);
  };

  const viewInfo = VIEW_LABELS[activeView];
  const showBundles = activeView === "active";
  const canCreateNote = activeView === "active";

  return (
    <AppShell
      activeBundleId={activeBundleId}
      activeView={activeView}
      onSelectBundle={(id) => {
        setActiveBundleId(id);
        setSelectedNoteId(null);
        setFilterTag(null);
        setSearchQuery("");
      }}
      onSelectView={handleViewChange}
      onCreateBundle={handleOpenBundleDialog}
      counts={counts}
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
          <Box sx={{ p: 2, pb: 1 }}>
            {/* View header or bundle breadcrumbs */}
            {showBundles ? (
              <BundleBreadcrumbs
                activeBundleId={activeBundleId}
                onSelectBundle={setActiveBundleId}
              />
            ) : (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                {viewInfo.icon}
                <Typography variant="h6" fontWeight={600}>
                  {viewInfo.label}
                </Typography>
              </Box>
            )}

            {/* Search bar */}
            <TextField
              fullWidth
              size="small"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ mt: 1.5 }}
            />

            {/* Tag filter chips */}
            {allTags.length > 0 && activeView !== "trash" && (
              <Box sx={{ mt: 1 }}>
                <TagFilterBar
                  allTags={allTags}
                  activeTag={filterTag}
                  onSelectTag={setFilterTag}
                />
              </Box>
            )}
          </Box>

          {/* Trash banner */}
          {activeView === "trash" && counts.trash > 0 && <TrashBanner />}

          <PageTransition transitionKey={activeView + (activeBundleId || "")}>
            <NoteList
              pinnedNotes={pinnedNotes}
              unpinnedNotes={unpinnedNotes}
              selectedNoteId={selectedNoteId}
              onSelectNote={setSelectedNoteId}
              onCreateNote={canCreateNote ? handleCreateNote : undefined}
              onReorder={activeView === "active" ? handleReorder : undefined}
              loading={loading}
            />
          </PageTransition>
        </Box>

        {/* Editor panel */}
        <Box
          sx={{
            flexGrow: 1,
            overflow: "hidden",
            transition: "all 300ms cubic-bezier(0.2, 0, 0, 1)",
          }}
        >
          {selectedNote ? (
            <Box sx={{ height: "100%", position: "relative" }}>
              {/* Mobile back button */}
              {isMobile && (
                <IconButton
                  onClick={() => setSelectedNoteId(null)}
                  sx={{
                    position: "absolute",
                    top: 12,
                    left: 12,
                    zIndex: 10,
                    bgcolor: "background.paper",
                    boxShadow: 2,
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  <ArrowBackIcon />
                </IconButton>
              )}
              <NoteEditor
                note={selectedNote}
                allTags={allTags}
                view={activeView}
                onDeleted={() => setSelectedNoteId(null)}
              />
            </Box>
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
                {viewInfo.emptyText}
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* Mobile bottom nav */}
      {isMobile && !selectedNote && (
        <MobileBottomNav
          activeView={activeView}
          onSelectView={handleViewChange}
          visible={bottomNavVisible}
        />
      )}

      <CreateBundleDialog
        open={bundleDialogOpen}
        onClose={() => setBundleDialogOpen(false)}
        defaultParentId={bundleDialogParentId}
      />
    </AppShell>
  );
}
