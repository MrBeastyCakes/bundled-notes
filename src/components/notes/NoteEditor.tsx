"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import PushPinIcon from "@mui/icons-material/PushPin";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import { updateNote, deleteNote } from "@/lib/firebase/firestore";
import { useAuth } from "@/lib/hooks/useAuth";
import { useBundles } from "@/lib/hooks/useBundles";
import type { Note } from "@/lib/types";
import TagInput from "./TagInput";
import TiptapEditor from "./TiptapEditor";

interface NoteEditorProps {
  note: Note;
  allTags: string[];
  onDeleted: () => void;
}

export default function NoteEditor({ note, allTags, onDeleted }: NoteEditorProps) {
  const { user } = useAuth();
  const { bundles } = useBundles();
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
  }, [note.id, note.title, note.content]);

  const save = useCallback(
    (fields: Partial<Pick<Note, "title" | "content" | "bundleId" | "pinned" | "tags">>) => {
      if (!user) return;
      updateNote(user.uid, note.id, fields);
    },
    [user, note.id]
  );

  const handleTitleChange = (value: string) => {
    setTitle(value);
    save({ title: value });
  };

  const handleContentChange = (html: string) => {
    setContent(html);
    save({ content: html });
  };

  const handleDelete = async () => {
    if (!user) return;
    await deleteNote(user.uid, note.id);
    onDeleted();
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", p: 3 }}>
      {/* Toolbar */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Bundle</InputLabel>
          <Select
            value={note.bundleId || ""}
            onChange={(e) => save({ bundleId: e.target.value || null })}
            label="Bundle"
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {bundles.map((b) => (
              <MenuItem key={b.id} value={b.id}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: b.color }}
                  />
                  {b.name}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ flexGrow: 1 }} />

        <Tooltip title={note.pinned ? "Unpin" : "Pin"}>
          <IconButton onClick={() => save({ pinned: !note.pinned })} size="small">
            {note.pinned ? <PushPinIcon fontSize="small" /> : <PushPinOutlinedIcon fontSize="small" />}
          </IconButton>
        </Tooltip>

        <Tooltip title="Delete">
          <IconButton onClick={handleDelete} size="small" color="error">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Tags */}
      <Box sx={{ mb: 2 }}>
        <TagInput
          tags={note.tags || []}
          allTags={allTags}
          onChange={(tags) => save({ tags })}
        />
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Title */}
      <TextField
        value={title}
        onChange={(e) => handleTitleChange(e.target.value)}
        placeholder="Note title"
        variant="standard"
        fullWidth
        InputProps={{
          disableUnderline: true,
          sx: { fontSize: "1.5rem", fontWeight: 600 },
        }}
        sx={{ mb: 2 }}
      />

      {/* Tiptap Editor — hybrid Typora-like editing */}
      <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
        <TiptapEditor
          content={content}
          onUpdate={handleContentChange}
        />
      </Box>

      {/* Footer */}
      <Box sx={{ pt: 1, display: "flex", justifyContent: "flex-end" }}>
        <Typography variant="caption" color="text.secondary">
          Last edited {note.updatedAt.toLocaleString()}
        </Typography>
      </Box>
    </Box>
  );
}
