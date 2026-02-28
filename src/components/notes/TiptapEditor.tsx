"use client";

import { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Link from "@tiptap/extension-link";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { Box, IconButton, Tooltip } from "@mui/material";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import StrikethroughSIcon from "@mui/icons-material/StrikethroughS";
import CodeIcon from "@mui/icons-material/Code";
import LinkIcon from "@mui/icons-material/Link";
import { editorStyles } from "@/lib/theme/editor";
import EditorToolbar from "./EditorToolbar";
import SlashCommandMenu from "./SlashCommandMenu";

const lowlight = createLowlight(common);

interface TiptapEditorProps {
  content: string;
  onUpdate: (html: string) => void;
  placeholder?: string;
}

export default function TiptapEditor({
  content,
  onUpdate,
  placeholder = "Start writing... (type / for commands)",
}: TiptapEditorProps) {
  const isInitialMount = useRef(true);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // We use CodeBlockLowlight instead
      }),
      Placeholder.configure({
        placeholder,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML());
    },
    immediatelyRender: false,
  });

  // Sync external content changes (e.g. switching notes)
  useEffect(() => {
    if (!editor) return;
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const currentContent = editor.getHTML();
    if (currentContent !== content) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content, editor]);

  const setLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  if (!editor) return null;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Toolbar */}
      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          mb: 1,
        }}
      >
        <EditorToolbar editor={editor} />
      </Box>

      {/* Editor */}
      <Box
        sx={{
          flexGrow: 1,
          overflow: "auto",
          position: "relative",
          ...editorStyles,
        }}
      >
        {/* Floating bubble menu on text selection */}
        <BubbleMenu
          editor={editor}
        >
          <Box
            sx={{
              display: "flex",
              bgcolor: "background.paper",
              borderRadius: 2,
              boxShadow: 8,
              p: 0.25,
              gap: 0.25,
            }}
          >
            <Tooltip title="Bold" arrow>
              <IconButton
                size="small"
                onClick={() => editor.chain().focus().toggleBold().run()}
                sx={{
                  color: editor.isActive("bold") ? "primary.main" : "text.secondary",
                  borderRadius: 1,
                }}
              >
                <FormatBoldIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Italic" arrow>
              <IconButton
                size="small"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                sx={{
                  color: editor.isActive("italic") ? "primary.main" : "text.secondary",
                  borderRadius: 1,
                }}
              >
                <FormatItalicIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Strikethrough" arrow>
              <IconButton
                size="small"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                sx={{
                  color: editor.isActive("strike") ? "primary.main" : "text.secondary",
                  borderRadius: 1,
                }}
              >
                <StrikethroughSIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Code" arrow>
              <IconButton
                size="small"
                onClick={() => editor.chain().focus().toggleCode().run()}
                sx={{
                  color: editor.isActive("code") ? "primary.main" : "text.secondary",
                  borderRadius: 1,
                }}
              >
                <CodeIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Link" arrow>
              <IconButton
                size="small"
                onClick={setLink}
                sx={{
                  color: editor.isActive("link") ? "primary.main" : "text.secondary",
                  borderRadius: 1,
                }}
              >
                <LinkIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </BubbleMenu>

        {/* Slash command menu */}
        <SlashCommandMenu editor={editor} />

        {/* Editor content */}
        <EditorContent editor={editor} style={{ height: "100%" }} />
      </Box>
    </Box>
  );
}
