"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Box, Typography } from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import NoteCard from "./NoteCard";
import type { Note } from "@/lib/types";

interface SortableNoteItemProps {
  note: Note;
  selected: boolean;
  onClick: () => void;
}

function SortableNoteItem({ note, selected, onClick }: SortableNoteItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: note.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : "auto" as const,
  };

  return (
    <Box ref={setNodeRef} style={style} sx={{ display: "flex", alignItems: "stretch", gap: 0 }}>
      <Box
        {...attributes}
        {...listeners}
        sx={{
          display: "flex",
          alignItems: "center",
          px: 0.5,
          cursor: "grab",
          color: "text.secondary",
          opacity: 0.4,
          "&:hover": { opacity: 1 },
          "&:active": { cursor: "grabbing" },
        }}
      >
        <DragIndicatorIcon fontSize="small" />
      </Box>
      <Box sx={{ flex: 1 }}>
        <NoteCard note={note} selected={selected} onClick={onClick} />
      </Box>
    </Box>
  );
}

interface SortableNoteListProps {
  pinnedNotes: Note[];
  unpinnedNotes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (noteId: string) => void;
  onReorder: (noteIds: string[]) => void;
}

export default function SortableNoteList({
  pinnedNotes,
  unpinnedNotes,
  selectedNoteId,
  onSelectNote,
  onReorder,
}: SortableNoteListProps) {
  const allNotes = [...pinnedNotes, ...unpinnedNotes];
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = allNotes.findIndex((n) => n.id === active.id);
    const newIndex = allNotes.findIndex((n) => n.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = [...allNotes];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    onReorder(reordered.map((n) => n.id));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={(e) => setActiveId(e.active.id as string)}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={allNotes.map((n) => n.id)} strategy={verticalListSortingStrategy}>
        {pinnedNotes.length > 0 && (
          <>
            <Typography variant="overline" color="text.secondary" sx={{ display: "block", mb: 1 }}>
              Pinned
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
              {pinnedNotes.map((note) => (
                <SortableNoteItem
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
              <Typography variant="overline" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                Others
              </Typography>
            )}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {unpinnedNotes.map((note) => (
                <SortableNoteItem
                  key={note.id}
                  note={note}
                  selected={selectedNoteId === note.id}
                  onClick={() => onSelectNote(note.id)}
                />
              ))}
            </Box>
          </>
        )}
      </SortableContext>
    </DndContext>
  );
}
