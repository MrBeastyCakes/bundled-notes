// Tiptap editor styles for M3 Expressive theme
// Applied via sx prop on the editor container

export const editorStyles = {
  "& .tiptap": {
    outline: "none",
    minHeight: "100%",
    fontSize: "0.95rem",
    lineHeight: 1.7,
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',

    "& > * + *": {
      marginTop: "0.5em",
    },

    // Headings
    "& h1": {
      fontSize: "1.75rem",
      fontWeight: 600,
      lineHeight: 1.3,
      mt: 3,
      mb: 1,
    },
    "& h2": {
      fontSize: "1.4rem",
      fontWeight: 600,
      lineHeight: 1.35,
      mt: 2.5,
      mb: 1,
    },
    "& h3": {
      fontSize: "1.15rem",
      fontWeight: 600,
      lineHeight: 1.4,
      mt: 2,
      mb: 0.5,
    },

    // Paragraphs
    "& p": {
      mb: 0.5,
      lineHeight: 1.7,
    },
    "& p.is-editor-empty:first-of-type::before": {
      content: "attr(data-placeholder)",
      float: "left",
      color: "text.secondary",
      opacity: 0.5,
      pointerEvents: "none",
      height: 0,
    },

    // Lists
    "& ul, & ol": {
      pl: 3,
      mb: 1,
    },
    "& li": {
      mb: 0.25,
    },
    "& li p": {
      mb: 0,
    },

    // Task lists (checklists)
    "& ul[data-type='taskList']": {
      listStyle: "none",
      pl: 0,

      "& li": {
        display: "flex",
        alignItems: "flex-start",
        gap: "8px",
        mb: 0.5,

        "& > label": {
          flexShrink: 0,
          mt: "3px",
          "& input[type='checkbox']": {
            width: 18,
            height: 18,
            cursor: "pointer",
            accentColor: "var(--tiptap-primary)",
          },
        },

        "& > div": {
          flex: 1,
        },
      },

      '& li[data-checked="true"] > div': {
        textDecoration: "line-through",
        opacity: 0.6,
      },
    },

    // Inline code
    "& code": {
      bgcolor: "action.hover",
      px: 0.75,
      py: 0.25,
      borderRadius: 1,
      fontFamily: '"Fira Code", "Consolas", monospace',
      fontSize: "0.875em",
    },

    // Code blocks
    "& pre": {
      bgcolor: "action.hover",
      p: 2,
      borderRadius: 2,
      overflow: "auto",
      my: 1.5,
      "& code": {
        bgcolor: "transparent",
        p: 0,
        borderRadius: 0,
        fontSize: "0.875rem",
        fontFamily: '"Fira Code", "Consolas", monospace',
        lineHeight: 1.6,
      },
    },

    // Blockquotes
    "& blockquote": {
      borderLeft: 3,
      borderColor: "primary.main",
      pl: 2,
      ml: 0,
      my: 1.5,
      color: "text.secondary",
      fontStyle: "italic",
    },

    // Horizontal rule
    "& hr": {
      border: "none",
      borderTop: 1,
      borderColor: "divider",
      my: 2,
    },

    // Links
    "& a": {
      color: "primary.main",
      textDecoration: "underline",
      textDecorationColor: "rgba(86, 95, 255, 0.4)",
      cursor: "pointer",
      "&:hover": {
        textDecorationColor: "primary.main",
      },
    },

    // Bold / Italic / Strikethrough
    "& strong": {
      fontWeight: 600,
    },

    // Images
    "& img": {
      maxWidth: "100%",
      height: "auto",
      borderRadius: 2,
    },

    // Table
    "& table": {
      borderCollapse: "collapse",
      width: "100%",
      my: 1.5,
      "& th, & td": {
        border: 1,
        borderColor: "divider",
        p: 1,
        textAlign: "left",
      },
      "& th": {
        fontWeight: 600,
        bgcolor: "action.hover",
      },
    },
  },
} as const;
