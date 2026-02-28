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
  Button,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import RestoreIcon from "@mui/icons-material/Restore";
import PushPinIcon from "@mui/icons-material/PushPin";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import StarIcon from "@mui/icons-material/Star";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import ArchiveIcon from "@mui/icons-material/Archive";
import UnarchiveIcon from "@mui/icons-material/Unarchive";
import { updateNote, softDeleteNote, restoreNote, permanentlyDeleteNote } from "@/lib/firebase/firestore";
import { useAuth } from "@/lib/hooks/useAuth";
import { useBundles } from "@/lib/hooks/useBundles";
import type { Note, NoteView } from "@/lib/types";
import TagInput from "./TagInput";
import TiptapEditor from "./TiptapEditor";

interface NoteEditorProps {
  note: Note;
  allTags: string[];
  view: NoteView;
  onDeleted: () => void;
}

export default function NoteEditor({ note, allTags, view, onDeleted }: NoteEditorProps) {
  const { user } = useAuth();
  const { bundles } = useBundles();
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
  }, [note.id, note.title, note.content]);

  const save = useCallback(
    (fields: Partial<Pick<Note, "title" | "content" | "bundleId" | "pinned" | "tags" | "favorited" | "archived">>) => {
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

  const handleSoftDelete = async () => {
    if (!user) return;
    await softDeleteNote(user.uid, note.id);
    onDeleted();
  };

  const handleRestore = async () => {
    if (!user) return;
    await restoreNote(user.uid, note.id);
    onDeleted();
  };

  const handlePermanentDelete = async () => {
    if (!user) return;
    await permanentlyDeleteNote(user.uid, note.id);
    onDeleted();
  };

  const handleArchive = async () => {
    if (!user) return;
    save({ archived: true });
    onDeleted();
  };

  const handleUnarchive = async () => {
    if (!user) return;
    save({ archived: false });
  };

  const isTrash = view === "trash";
  const isArchived = view === "archived";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", p: 3 }}>
      {/* Trash/Archive action bar */}
      {(isTrash || isArchived) && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 2,
            p: 1.5,
            bgcolor: isTrash ? "error.main" : "action.hover",
            color: isTrash ? "error.contrastText" : "text.primary",
            borderRadius: 3,
          }}
        >
          <Typography variant="body2" fontWeight={500} sx={{ flex: 1 }}>
            {isTrash ? "This note is in the trash" : "This note is archived"}
          </Typography>
          {isTrash ? (
            <>
              <Button
                size="small"
                variant="contained"
                color="inherit"
                startIcon={<RestoreIcon />}
                onClick={handleRestore}
                sx={{ color: "error.main", bgcolor: "error.contrastText" }}
              >
                Restore
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="inherit"
                startIcon={<DeleteForeverIcon />}
                onClick={handlePermanentDelete}
              >
                Delete Forever
              </Button>
            </>
          ) : (
            <Button
              size="small"
              variant="outlined"
              startIcon={<UnarchiveIcon />}
              onClick={handleUnarchive}
            >
              Unarchive
            </Button>
          )}
        </Box>
      )}

      {/* Toolbar */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        {!isTrash && (
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
        )}

        <Box sx={{ flexGrow: 1 }} />

        {!isTrash && (
          <>
            <Tooltip title={note.favorited ? "Unfavorite" : "Favorite"}>
              <IconButton onClick={() => save({ favorited: !note.favorited })} size="small">
                {note.favorited ? (
                  <StarIcon fontSize="small" sx={{ color: "warning.main" }} />
                ) : (
                  <StarOutlineIcon fontSize="small" />
                )}
              </IconButton>
            </Tooltip>

            <Tooltip title={note.pinned ? "Unpin" : "Pin"}>
              <IconButton onClick={() => save({ pinned: !note.pinned })} size="small">
                {note.pinned ? <PushPinIcon fontSize="small" /> : <PushPinOutlinedIcon fontSize="small" />}
              </IconButton>
            </Tooltip>

            {!isArchived && (
              <Tooltip title="Archive">
                <IconButton onClick={handleArchive} size="small">
                  <ArchiveIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            <Tooltip title="Move to Trash">
              <IconButton onClick={handleSoftDelete} size="small" color="error">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Box>

      {/* Tags */}
      {!isTrash && (
        <Box sx={{ mb: 2 }}>
          <TagInput
            tags={note.tags || []}
            allTags={allTags}
            onChange={(tags) => save({ tags })}
          />
        </Box>
      )}

      <Divider sx={{ mb: 2 }} />

      {/* Title */}
      <TextField
        value={title}
        onChange={(e) => handleTitleChange(e.target.value)}
        placeholder="Note title"
        variant="standard"
        fullWidth
        disabled={isTrash}
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
