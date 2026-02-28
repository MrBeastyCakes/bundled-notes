# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Dev Commands

```bash
npm run dev          # Start dev server (Turbopack) at localhost:3000
npm run build        # Production build (static export to /out)
npm run start        # Serve production build
npm run lint         # ESLint
firebase deploy      # Deploy to Firebase Hosting (requires firebase-tools CLI)
```

## Architecture

**Stack**: Next.js 16 (App Router, static export) + Firebase (Auth + Firestore) + MUI v7 with custom M3 Expressive theming.

### Data Flow

All state comes from Firestore via real-time subscriptions. No local state management library — hooks (`useNotes`, `useBundles`) subscribe to Firestore `onSnapshot` and expose data reactively. Auth state flows through `AuthContext`.

### Firebase (lazy initialization)

Firebase is initialized lazily via `getFirebaseAuth()` and `getFirebaseDb()` in `src/lib/firebase/config.ts` to avoid SSR/static-export errors. All files that need Firebase must call these functions rather than importing singletons.

- `src/lib/firebase/config.ts` — lazy app/auth/db initialization
- `src/lib/firebase/auth.ts` — signUp, signIn, signInWithGoogle, signOut
- `src/lib/firebase/firestore.ts` — CRUD for notes and bundles with real-time subscriptions
- `firestore.rules` — security rules (users can only access their own data)

Firebase config comes from `.env.local` (see `.env.local.example`).

### Firestore Data Model

```
users/{userId}
  ├── bundles/{bundleId}  — name, color, icon, parentBundleId, order
  └── notes/{noteId}      — title, content (Markdown), bundleId, pinned
```

**Nested bundles** use an adjacency list pattern: `parentBundleId: string | null`. The flat collection is transformed into a tree client-side in `useBundles`. Root bundles have `parentBundleId: null`.

### Theming (M3 Expressive)

MUI is configured with Material 3 Expressive design tokens in `src/lib/theme/`. Color palettes are derived from a primary blue (#565fff) with tonal values in `colors.ts`. Dark mode is the default. Theme toggle is managed by `ThemeContext`.

Key M3 overrides: 28px card/dialog radii, 20px button radii, `cubic-bezier(0.2, 0, 0, 1)` easing, Inter font.

### Routing

| Route | Purpose |
|-------|---------|
| `/` | Landing page (redirects to `/notes` if authenticated) |
| `/login` | Login form + Google sign-in |
| `/signup` | Registration form + Google sign-in |
| `/notes` | Main app (auth-guarded) — sidebar + note list + editor |

The `/notes` layout (`src/app/notes/layout.tsx`) acts as an auth guard, redirecting to `/login` if not authenticated.

### Component Organization

- `src/components/auth/` — LoginForm, SignupForm, GoogleSignInButton
- `src/components/layout/` — AppShell (sidebar + content), Header, Sidebar
- `src/components/bundles/` — BundleTree (recursive), BundleTreeItem, BundleChip, BundleBreadcrumbs, CreateBundleDialog
- `src/components/notes/` — NoteCard, NoteList, NoteEditor (Markdown with live preview)
- `src/lib/hooks/` — useAuth, useBundles (tree builder), useNotes (filtered by bundle)
- `src/contexts/` — AuthContext, ThemeContext

### Static Export

`next.config.ts` sets `output: "export"` for Firebase Hosting. All pages are client-rendered ("use client"). The `firebase.json` serves from `/out` with SPA rewrites.
