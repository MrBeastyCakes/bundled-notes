# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Dev Commands

```bash
npm run dev          # Start dev server (Turbopack) at localhost:3000
npm run build        # Production build (static export to /out)
npm run lint         # ESLint
```

There is no test framework configured. No test runner or test files exist.

## CI/CD

GitHub Actions (`.github/workflows/`) deploy to Firebase Hosting on push to `master`. Firebase config is injected via GitHub Secrets (`NEXT_PUBLIC_FIREBASE_*`, `FIREBASE_TOKEN`). Project ID: `bundled-notes-app`.

## Architecture

**Stack**: Next.js 16 (App Router, static export) + Firebase (Auth + Firestore) + MUI v7 (M3 Expressive theming) + Tiptap rich text editor + @dnd-kit (drag-and-drop) + Framer Motion (animations).

**Path alias**: `@/*` maps to `./src/*` (configured in `tsconfig.json`).

### Spatial Canvas UI

The primary interface (`/notes`) is an infinite spatial canvas (`NoteCanvas`), not a traditional sidebar+list layout. Notes appear as draggable cards on a pannable/zoomable surface.

Key interaction patterns:
- **Pan**: click+drag on empty canvas (mouse), single-finger drag (touch)
- **Zoom**: scroll wheel (mouse), pinch-to-zoom (touch)
- **Zoom-to-edit**: clicking a note card animates the viewport to fill the screen with that card, then opens a full-screen editor overlay
- **Press-and-hold drag**: notes require a 300ms hold before dragging starts (prevents conflict with pinch-to-zoom)
- **Drag action zones**: dragging a note reveals a bottom bar with Favorite/Archive/Trash drop zones
- **Double-click**: creates a new note at that canvas position
- **Ctrl+K**: opens command palette for searching notes

Canvas state is managed by two hooks:
- `useCanvasViewport` — pan/zoom state, coordinate transforms (`screenToCanvas`), animated zoom-to-card and zoom-back
- `useCanvasLayout` — positions notes on the canvas (stored `positionX`/`positionY` or auto-grid fallback), computes bundle region bounding boxes

The old sidebar+list components (`AppShell`, `Sidebar`, `NoteList`, `SortableNoteList`, etc.) still exist in the codebase but are not currently rendered — the `/notes` page only renders `NoteCanvas`.

### Rich Text Editor (Tiptap)

Note content is stored as **HTML**, not Markdown. The editor uses Tiptap with these extensions: StarterKit, TaskList/TaskItem, Link, CodeBlockLowlight (syntax highlighting via lowlight), Placeholder. There is a floating bubble menu for inline formatting and a slash command menu (`/` commands) for block-level formatting.

`NoteEditor` wraps `TiptapEditor` and handles the title field, bundle assignment, tags, and note lifecycle actions (pin, favorite, archive, soft-delete).

### Data Flow

All state comes from Firestore via real-time `onSnapshot` subscriptions. No local state management library. Hooks subscribe and expose data reactively:
- `useNotes` — subscribes to all user notes, applies view filtering (`active | favorites | archived | trash`), bundle filtering, tag filtering, and text search client-side
- `useBundles` — subscribes to bundles, builds the adjacency-list tree client-side
- `useAuth` — wraps Firebase Auth state via `AuthContext`

Note saves are **immediate and unbatched** — every keystroke in the title or editor calls `updateNote` directly against Firestore. There is no debounce.

### Firebase (lazy initialization)

Firebase is initialized lazily via `getFirebaseAuth()` and `getFirebaseDb()` in `src/lib/firebase/config.ts` to avoid SSR/static-export errors. All files that need Firebase must call these functions rather than importing singletons.

Firebase config comes from `.env.local` (see `.env.local.example` for required `NEXT_PUBLIC_FIREBASE_*` vars).

### Firestore Data Model

```
users/{userId}
  ├── bundles/{bundleId}  — name, color, icon, parentBundleId, order
  └── notes/{noteId}      — title, content (HTML), bundleId, tags[], pinned,
                             favorited, archived, deleted, deletedAt,
                             positionX, positionY
```

**Nested bundles** use an adjacency list: `parentBundleId: string | null`. Root bundles have `parentBundleId: null`.

**Soft delete**: `deleteNote()` sets `deleted: true` + `deletedAt` timestamp. `permanentlyDeleteNote()` is a real Firestore delete. The `useNotes` hook normalizes older documents that lack newer fields (`tags`, `favorited`, `archived`, `deleted`, `positionX`, `positionY`).

**Canvas positions**: `positionX`/`positionY` are nullable. Notes without stored positions are auto-laid out in a grid by `useCanvasLayout`. Positions are persisted to Firestore on drag-end via `updateNotePosition` or `batchUpdatePositions`.

**Bundle regions**: On the canvas, bundles render as colored bounding-box containers around their member notes (`BundleRegion`). Dragging a note onto a bundle region assigns it; dragging it off removes the assignment.

### Theming (M3 Expressive)

MUI is configured with Material 3 Expressive design tokens in `src/lib/theme/`. Color palettes derive from primary blue (#565fff). Dark mode is the default. Theme toggle is in `ThemeContext`.

Key M3 overrides: 28px card/dialog radii, 20px button radii, `cubic-bezier(0.2, 0, 0, 1)` easing, Inter font.

### Routing

| Route | Purpose |
|-------|---------|
| `/` | Landing page (redirects to `/notes` if authenticated) |
| `/login` | Login form + Google sign-in |
| `/signup` | Registration form + Google sign-in |
| `/notes` | Main app (auth-guarded) — spatial canvas UI |

The `/notes` layout (`src/app/notes/layout.tsx`) acts as an auth guard, redirecting to `/login` if not authenticated.

### Static Export

`next.config.ts` sets `output: "export"` for Firebase Hosting. All pages are client-rendered (`"use client"`). `firebase.json` serves from `/out` with SPA rewrites.
