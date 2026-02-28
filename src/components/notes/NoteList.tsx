"use client";

import { Box, Typography, Fab } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import NoteCard from "./NoteCard";
import SkeletonNoteCard from "@/components/ui/SkeletonNoteCard";
import SortableNoteList from "./SortableNoteList";
import type { Note } from "@/lib/types";

interface NoteListProps {
  pinnedNotes: Note[];
  unpinnedNotes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (noteId: string) => void;
  onCreateNote?: () => void;
  onReorder?: (noteIds: string[]) => void;
  loading: boolean;
}

export default function NoteList({
  pinnedNotes,
  unpinnedNotes,
  selectedNoteId,
  onSelectNote,
  onCreateNote,
  onReorder,
  loading,
}: NoteListProps) {
  const isEmpty = pinnedNotes.length === 0 && unpinnedNotes.length === 0;

  return (
    <Box sx={{ position: "relative", height: "100%" }}>
      <Box sx={{ p: 2, overflow: "auto", height: "100%" }}>
        {loading ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {[0, 1, 2, 3].map((i) => (
              <SkeletonNoteCard key={i} />
            ))}
          </Box>
        ) : isEmpty ? (
          <Box sx={{ textAlign: "center", mt: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No notes yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create your first note to get started
            </Typography>
          </Box>
        ) : onReorder ? (
          <SortableNoteList
            pinnedNotes={pinnedNotes}
            unpinnedNotes={unpinnedNotes}
            selectedNoteId={selectedNoteId}
            onSelectNote={onSelectNote}
            onReorder={onReorder}
          />
        ) : (
          <>
            {pinnedNotes.length > 0 && (
              <>
                <Typography
                  variant="overline"
                  color="text.secondary"
                  sx={{ display: "block", mb: 1 }}
                >
                  Pinned
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
                  {pinnedNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      selected={selectedNoteId === note.id}
                      onClick={() => onSelectNote(note.id)}
                    />
                  ))}
                </Box>
              </>
            )}

            {unpinnedNotes.length > 0 && (
              <>
                {pinnedNotes.length > 0 && (
                  <Typography
                    variant="overline"
                    color="text.secondary"
                    sx={{ display: "block", mb: 1 }}
                  >
                    Others
                  </Typography>
                )}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {unpinnedNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      selected={selectedNoteId === note.id}
                      onClick={() => onSelectNote(note.id)}
                    />
                  ))}
                </Box>
              </>
            )}
          </>
        )}
      </Box>

      {onCreateNote && (
        <Fab
          color="primary"
          onClick={onCreateNote}
          sx={{
            position: "fixed",
            bottom: { xs: 80, md: 24 },
            right: 24,
          }}
        >
          <AddIcon />
        </Fab>
      )}
    </Box>
  );
}
