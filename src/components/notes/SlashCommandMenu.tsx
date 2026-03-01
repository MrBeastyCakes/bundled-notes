"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Paper, List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import TitleIcon from "@mui/icons-material/Title";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CodeIcon from "@mui/icons-material/Code";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import HorizontalRuleIcon from "@mui/icons-material/HorizontalRule";
import type { Editor } from "@tiptap/react";

interface SlashCommand {
  label: string;
  description: string;
  icon: React.ReactNode;
  action: (editor: Editor) => void;
}

const COMMANDS: SlashCommand[] = [
  {
    label: "Heading 1",
    description: "Large section heading",
    icon: <TitleIcon />,
    action: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    label: "Heading 2",
    description: "Medium section heading",
    icon: <TitleIcon sx={{ fontSize: "1.2rem" }} />,
    action: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    label: "Heading 3",
    description: "Small section heading",
    icon: <TitleIcon sx={{ fontSize: "1rem" }} />,
    action: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    label: "Bullet List",
    description: "Unordered list",
    icon: <FormatListBulletedIcon />,
    action: (editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    label: "Numbered List",
    description: "Ordered list",
    icon: <FormatListNumberedIcon />,
    action: (editor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    label: "Checklist",
    description: "Task list with checkboxes",
    icon: <CheckBoxIcon />,
    action: (editor) => editor.chain().focus().toggleTaskList().run(),
  },
  {
    label: "Code Block",
    description: "Code with syntax highlighting",
    icon: <CodeIcon />,
    action: (editor) => editor.chain().focus().toggleCodeBlock().run(),
  },
  {
    label: "Blockquote",
    description: "Quote or callout",
    icon: <FormatQuoteIcon />,
    action: (editor) => editor.chain().focus().toggleBlockquote().run(),
  },
  {
    label: "Divider",
    description: "Horizontal rule",
    icon: <HorizontalRuleIcon />,
    action: (editor) => editor.chain().focus().setHorizontalRule().run(),
  },
];

interface SlashCommandMenuProps {
  editor: Editor;
}

export default function SlashCommandMenu({ editor }: SlashCommandMenuProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  const filteredCommands = COMMANDS.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(query.toLowerCase()) ||
      cmd.description.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!open) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedIndex((i) => (i + 1) % filteredCommands.length);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedIndex((i) => (i - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (event.key === "Enter") {
        event.preventDefault();
        if (filteredCommands[selectedIndex]) {
          // Delete the slash and query text
          const { from } = editor.state.selection;
          const slashStart = from - query.length - 1; // -1 for the slash
          editor.chain().focus().deleteRange({ from: slashStart, to: from }).run();
          filteredCommands[selectedIndex].action(editor);
          setOpen(false);
        }
      } else if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
      }
    },
    [open, filteredCommands, selectedIndex, editor, query]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [handleKeyDown]);

  useEffect(() => {
    const handleUpdate = () => {
      const { state } = editor;
      const { from } = state.selection;
      const textBefore = state.doc.textBetween(
        Math.max(0, from - 50),
        from,
        "\n"
      );

      // Check if we're in a slash command context
      const slashMatch = textBefore.match(/\/([a-zA-Z0-9 ]*)$/);
      if (slashMatch) {
        setQuery(slashMatch[1]);
        setSelectedIndex(0);
        setOpen(true);

        // Get cursor position for menu placement
        const coords = editor.view.coordsAtPos(from);
        const editorRect = editor.view.dom.getBoundingClientRect();
        setPosition({
          top: coords.bottom - editorRect.top + 8,
          left: coords.left - editorRect.left,
        });
      } else {
        setOpen(false);
        setQuery("");
      }
    };

    editor.on("update", handleUpdate);
    editor.on("selectionUpdate", handleUpdate);
    return () => {
      editor.off("update", handleUpdate);
      editor.off("selectionUpdate", handleUpdate);
    };
  }, [editor]);

  if (!open || filteredCommands.length === 0) return null;

  return (
    <Paper
      ref={menuRef}
      elevation={8}
      sx={{
        position: "absolute",
        top: position.top,
        left: position.left,
        zIndex: 1300,
        minWidth: 240,
        maxHeight: 320,
        overflow: "auto",
        borderRadius: 3,
      }}
    >
      <List dense disablePadding sx={{ py: 0.5 }}>
        {filteredCommands.map((cmd, i) => (
          <ListItemButton
            key={cmd.label}
            selected={i === selectedIndex}
            onClick={() => {
              const { from } = editor.state.selection;
              const slashStart = from - query.length - 1;
              editor.chain().focus().deleteRange({ from: slashStart, to: from }).run();
              cmd.action(editor);
              setOpen(false);
            }}
            sx={{ px: 2, py: 0.75, mx: 0.5, borderRadius: 2 }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: "primary.main" }}>
              {cmd.icon}
            </ListItemIcon>
            <ListItemText
              primary={cmd.label}
              secondary={cmd.description}
              primaryTypographyProps={{ variant: "body2", fontWeight: 500 }}
              secondaryTypographyProps={{ variant: "caption" }}
            />
          </ListItemButton>
        ))}
      </List>
    </Paper>
  );
}
