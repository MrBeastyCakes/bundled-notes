"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Box,
  TextField,
  IconButton,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
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
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { updateNote, deleteNote } from "@/lib/firebase/firestore";
import { useAuth } from "@/lib/hooks/useAuth";
import { useBundles } from "@/lib/hooks/useBundles";
import type { Note } from "@/lib/types";

interface NoteEditorProps {
  note: Note;
  onDeleted: () => void;
}

export default function NoteEditor({ note, onDeleted }: NoteEditorProps) {
  const { user } = useAuth();
  const { bundles } = useBundles();
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setViewMode("edit");
  }, [note.id, note.title, note.content]);

  const save = useCallback(
    (fields: Partial<Pick<Note, "title" | "content" | "bundleId" | "pinned">>) => {
      if (!user) return;
      updateNote(user.uid, note.id, fields);
    },
    [user, note.id]
  );

  const handleTitleChange = (value: string) => {
    setTitle(value);
    save({ title: value });
  };

  const handleContentChange = (value: string) => {
    setContent(value);
    save({ content: value });
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

        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_, v) => v && setViewMode(v)}
          size="small"
        >
          <ToggleButton value="edit">
            <EditIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton value="preview">
            <VisibilityIcon fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>

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

      {/* Content */}
      {viewMode === "edit" ? (
        <TextField
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Start writing... (Markdown supported)"
          multiline
          fullWidth
          variant="standard"
          InputProps={{ disableUnderline: true }}
          sx={{
            flexGrow: 1,
            "& .MuiInputBase-root": { alignItems: "flex-start" },
            "& textarea": {
              fontFamily: '"Inter", monospace',
              fontSize: "0.95rem",
              lineHeight: 1.7,
            },
          }}
        />
      ) : (
        <Box
          sx={{
            flexGrow: 1,
            overflow: "auto",
            "& h1, & h2, & h3": { mt: 2, mb: 1 },
            "& p": { mb: 1.5, lineHeight: 1.7 },
            "& ul, & ol": { pl: 3 },
            "& code": {
              bgcolor: "action.hover",
              px: 0.5,
              py: 0.25,
              borderRadius: 1,
              fontFamily: "monospace",
              fontSize: "0.875em",
            },
            "& pre": {
              bgcolor: "action.hover",
              p: 2,
              borderRadius: 2,
              overflow: "auto",
              "& code": { bgcolor: "transparent", p: 0 },
            },
            "& blockquote": {
              borderLeft: 3,
              borderColor: "primary.main",
              pl: 2,
              ml: 0,
              color: "text.secondary",
            },
            "& a": { color: "primary.main" },
            "& table": {
              borderCollapse: "collapse",
              width: "100%",
              "& th, & td": {
                border: 1,
                borderColor: "divider",
                p: 1,
                textAlign: "left",
              },
            },
          }}
        >
          {content ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          ) : (
            <Typography color="text.secondary" fontStyle="italic">
              Nothing to preview
            </Typography>
          )}
        </Box>
      )}

      {/* Footer */}
      <Box sx={{ pt: 1, display: "flex", justifyContent: "flex-end" }}>
        <Typography variant="caption" color="text.secondary">
          Last edited {note.updatedAt.toLocaleString()}
        </Typography>
      </Box>
    </Box>
  );
}
