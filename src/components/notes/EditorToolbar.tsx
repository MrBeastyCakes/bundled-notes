"use client";

import { Box, IconButton, Tooltip, Divider } from "@mui/material";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import StrikethroughSIcon from "@mui/icons-material/StrikethroughS";
import CodeIcon from "@mui/icons-material/Code";
import LinkIcon from "@mui/icons-material/Link";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import HorizontalRuleIcon from "@mui/icons-material/HorizontalRule";
import DataObjectIcon from "@mui/icons-material/DataObject";
import type { Editor } from "@tiptap/react";

interface ToolbarButtonProps {
  icon: React.ReactNode;
  tooltip: string;
  active?: boolean;
  onClick: () => void;
}

function ToolbarButton({ icon, tooltip, active, onClick }: ToolbarButtonProps) {
  return (
    <Tooltip title={tooltip} arrow>
      <IconButton
        size="small"
        onClick={onClick}
        sx={{
          borderRadius: 1.5,
          color: active ? "primary.main" : "text.secondary",
          bgcolor: active ? "action.selected" : "transparent",
          "&:hover": {
            bgcolor: active ? "action.selected" : "action.hover",
          },
        }}
      >
        {icon}
      </IconButton>
    </Tooltip>
  );
}

interface EditorToolbarProps {
  editor: Editor | null;
}

export default function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.25,
        flexWrap: "wrap",
        py: 0.5,
        px: 0.5,
      }}
    >
      {/* Headings */}
      <ToolbarButton
        icon={<Box sx={{ fontWeight: 700, fontSize: "0.8rem", width: 24, textAlign: "center" }}>H1</Box>}
        tooltip="Heading 1 (Ctrl+Alt+1)"
        active={editor.isActive("heading", { level: 1 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      />
      <ToolbarButton
        icon={<Box sx={{ fontWeight: 700, fontSize: "0.75rem", width: 24, textAlign: "center" }}>H2</Box>}
        tooltip="Heading 2 (Ctrl+Alt+2)"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      />
      <ToolbarButton
        icon={<Box sx={{ fontWeight: 700, fontSize: "0.7rem", width: 24, textAlign: "center" }}>H3</Box>}
        tooltip="Heading 3 (Ctrl+Alt+3)"
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      />

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      {/* Inline formatting */}
      <ToolbarButton
        icon={<FormatBoldIcon fontSize="small" />}
        tooltip="Bold (Ctrl+B)"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      />
      <ToolbarButton
        icon={<FormatItalicIcon fontSize="small" />}
        tooltip="Italic (Ctrl+I)"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      />
      <ToolbarButton
        icon={<StrikethroughSIcon fontSize="small" />}
        tooltip="Strikethrough (Ctrl+Shift+X)"
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      />
      <ToolbarButton
        icon={<CodeIcon fontSize="small" />}
        tooltip="Inline Code (Ctrl+E)"
        active={editor.isActive("code")}
        onClick={() => editor.chain().focus().toggleCode().run()}
      />
      <ToolbarButton
        icon={<LinkIcon fontSize="small" />}
        tooltip="Link (Ctrl+K)"
        active={editor.isActive("link")}
        onClick={setLink}
      />

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      {/* Block elements */}
      <ToolbarButton
        icon={<FormatListBulletedIcon fontSize="small" />}
        tooltip="Bullet List"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      />
      <ToolbarButton
        icon={<FormatListNumberedIcon fontSize="small" />}
        tooltip="Numbered List"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      />
      <ToolbarButton
        icon={<CheckBoxIcon fontSize="small" />}
        tooltip="Checklist"
        active={editor.isActive("taskList")}
        onClick={() => editor.chain().focus().toggleTaskList().run()}
      />

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      <ToolbarButton
        icon={<DataObjectIcon fontSize="small" />}
        tooltip="Code Block"
        active={editor.isActive("codeBlock")}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      />
      <ToolbarButton
        icon={<FormatQuoteIcon fontSize="small" />}
        tooltip="Blockquote"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      />
      <ToolbarButton
        icon={<HorizontalRuleIcon fontSize="small" />}
        tooltip="Divider"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      />
    </Box>
  );
}
