# Gaprio Blogs Web

A modern, high-performance blogging platform built with **Next.js 16** and **React 19**. Gaprio Blogs lets writers publish rich-text articles, readers discover content through categories and tags, and administrators moderate every corner of the platform — all wrapped in a fast, responsive, and beautifully animated UI.

---

## Overview

Gaprio Blogs is the **frontend** half of a full-stack blogging system. It consumes a RESTful **Node.js / Express** backend (`/api/v1`) and renders content using Next.js's App Router with a hybrid Server-Side Rendering (SSR) + Client-Side Rendering (CSR) approach.

### How the pieces fit together

```
┌──────────────────────────┐         ┌──────────────────────────────┐
│   Gaprio Blogs Frontend  │  HTTP   │  Express Backend (REST API)  │
│   (This repository)      │ ◄─────► │  http://localhost:8000       │
│   Next.js 16 / React 19  │         │  /api/v1/*                   │
└──────────────────────────┘         └──────────────────────────────┘
```

All data flows through a **single Axios API client** (`lib/api/apiClient.js`) that handles authentication tokens, automatic JWT refresh, and error normalisation — so individual page components never worry about HTTP details.

---

## Features

### For Readers
- 📰 **Public blog feed** — Browse paginated, published posts filtered by category, tag, author, or search query.
- 📖 **SEO-optimised article pages** — Each post is served via SSR for fast first paint and rich link previews.
- 💬 **Nested comment threads** — Read and paginate through top-level comments and their replies.
- 🔖 **Like & Bookmark** — Authenticated users can toggle likes and bookmarks on any post.

### For Authors
- ✍️ **Rich-text editor** — Write and format posts using [Tiptap](https://tiptap.dev/), a headless, extensible editor.
- 🖼️ **Image upload & cropping** — Drag-and-drop images with `react-dropzone`, then crop to the perfect ratio with `react-image-crop`.
- 📊 **Personal dashboard** — View, edit, and delete your own posts. Track drafts vs. published articles.
- 🔐 **Secure authentication** — Register, verify email via OTP, log in, and reset passwords.

### For Administrators
- 🛡️ **Admin dashboard** — View all users and all posts (regardless of status).
- 🚫 **User moderation** — Promote / demote roles (`USER`, `WRITER`, `AUTHOR`, `ADMIN`), ban/unban users, or force-delete accounts.
- 📝 **Post moderation** — Override post status (`DRAFT`, `PUBLISHED`, `ARCHIVED`) or force-delete any post.
- 🗨️ **Comment moderation** — Approve or hide comments platform-wide.

### Cross-cutting
- 🔄 **Automatic token refresh** — The Axios response interceptor silently refreshes expired JWTs and retries the original request, so users never see random logouts.
- 🎨 **Smooth animations** — Framer Motion and GSAP power page transitions, scroll effects, and micro-interactions.
- 📱 **Fully responsive** — Layouts adapt to mobile, tablet, and desktop via Tailwind CSS v4 utilities.
- 📈 **Vercel Analytics & Speed Insights** — Built-in performance monitoring via `@vercel/analytics` and `@vercel/speed-insights`.

---

## Tech Stack

### Core Framework & Runtime

| Technology | Version | Purpose |
|---|---|---|
| [Next.js](https://nextjs.org/) | 16.2.7 | Meta-framework — App Router, SSR, file-based routing, image optimisation |
| [React](https://react.dev/) | 19.2.4 | UI component library |

### State Management & Data Fetching

| Technology | Purpose |
|---|---|
| [TanStack React Query](https://tanstack.com/query) | Server-state management — caching, background refetches, pagination |
| [Zustand](https://zustand.docs.pmnd.rs/) | Client-side global state (UI toggles, theme, modals) |
| [Axios](https://axios-http.com/) | HTTP client with request/response interceptors for auth |
| [js-cookie](https://github.com/js-cookie/js-cookie) | Read/write authentication tokens from browser cookies |

### Styling & Animation

| Technology | Purpose |
|---|---|
| [Tailwind CSS v4](https://tailwindcss.com/) | Utility-first CSS framework |
| [clsx](https://github.com/lukeed/clsx) + [tailwind-merge](https://github.com/dcastil/tailwind-merge) | `cn()` helper — merge Tailwind classes without conflicts |
| [Framer Motion](https://motion.dev/) | Declarative React animations and page transitions |
| [GSAP](https://gsap.com/) + [@gsap/react](https://gsap.com/resources/React/) | Advanced scroll-triggered and timeline-based animations |
| [Lenis](https://lenis.darkroom.engineering/) | Smooth scroll engine |

### Forms & Content

| Technology | Purpose |
|---|---|
| [React Hook Form](https://react-hook-form.com/) | Performant, flexible form state management |
| [Zod](https://zod.dev/) | Schema-based form validation (used via `@hookform/resolvers`) |
| [Tiptap](https://tiptap.dev/) | Headless rich-text editor for blog post creation |
| [react-dropzone](https://react-dropzone.js.org/) | Drag-and-drop file upload zone |
| [react-image-crop](https://github.com/DanFessworthy/react-image-crop) / [react-easy-crop](https://github.com/ValentinH/react-easy-crop) | Client-side image cropping before upload |

### Rendering & Utilities

| Technology | Purpose |
|---|---|
| [react-markdown](https://github.com/remarkjs/react-markdown) + [remark-gfm](https://github.com/remarkjs/remark-gfm) | Render Markdown content (including GitHub Flavored Markdown tables, strikethrough, etc.) |
| [Shiki](https://shiki.matsu.io/) | Syntax highlighting for code blocks inside blog posts |
| [date-fns](https://date-fns.org/) | Lightweight date formatting and manipulation |
| [reading-time](https://github.com/ngryman/reading-time) | Calculate estimated reading time for articles |
| [Fuse.js](https://fusejs.io/) | Client-side fuzzy search |
| [Recharts](https://recharts.org/) | Data visualisation / charts for the dashboard |
| [jsPDF](https://github.com/parallax/jsPDF) + [html-to-image](https://github.com/nicklockwood/html-to-image) / [html2canvas](https://html2canvas.hertzen.com/) | Export content as PDF or image |
| [canvas-confetti](https://github.com/catdad/canvas-confetti) | Celebration confetti animations |
| [Sharp](https://sharp.pixelplumbing.com/) | Server-side image processing and optimisation |

### Icons & Notifications

| Technology | Purpose |
|---|---|
| [Lucide React](https://lucide.dev/) | Modern, consistent SVG icon set |
| [React Icons](https://react-icons.github.io/react-icons/) | Additional icon packs (Font Awesome, Material, etc.) |
| [Sonner](https://sonner.emilkowal.dev/) | Toast notification system |
| [react-hot-toast](https://react-hot-toast.com/) | Alternative toast notifications |
| [nextjs-toploader](https://github.com/TheSGJ/nextjs-toploader) | Slim progress bar at the top of the page during route transitions |

### Dev Tools

| Technology | Purpose |
|---|---|
| [ESLint](https://eslint.org/) | JavaScript linting (configured with `eslint-config-next`) |
| [PostCSS](https://postcss.org/) | CSS processing pipeline (used by Tailwind v4 via `@tailwindcss/postcss`) |

---

## Project Structure

Below is an annotated map of every file and directory. If you're new to the codebase, read through this carefully — it shows you **where to find things** and **why they live there**.

```
gaprio-blogs-web/
│
├── app/                            # 🗂  Next.js App Router (pages + layouts)
│   ├── favicon.ico                 #     Browser tab icon
│   ├── globals.css                 #     Global styles — Tailwind imports, CSS custom properties,
│   │                               #     dark mode support via prefers-color-scheme
│   ├── layout.js                   #     Root layout — wraps every page with <html>, <body>,
│   │                               #     loads Geist & Geist Mono fonts via next/font
│   └── page.js                     #     Home page component (currently the Next.js starter page)
│
├── hooks/                          # 🪝  Custom React hooks (the data-fetching layer)
│   ├── mutations/                  #     React Query `useMutation` hooks (write operations)
│   │   ├── useAuthMutations.js     #       Login, Register, Logout — auto-injects deviceId,
│   │   │                           #       stores tokens in cookies, invalidates user cache
│   │   ├── useCategoryMutations.js #       Create / Update / Delete categories and tags (Admin)
│   │   ├── useInteractionMutations.js #    Like, Bookmark, Comment CRUD, Admin moderation
│   │   ├── usePostMutations.js     #       Create / Update / Delete posts (Author + Admin)
│   │   └── useUserMutations.js     #       Update profile, change password, delete account,
│   │                               #       Admin: role changes, ban/unban, force-delete
│   └── queries/                    #     React Query `useQuery` hooks (read operations)
│       ├── useCategoryQueries.js   #       Fetch categories (30 min cache), tags, category by slug
│       ├── useInteractionQueries.js#       Fetch paginated comments for a post (2 min cache)
│       ├── usePostQueries.js       #       Public feed, single post by slug, author's posts, admin list
│       └── useUserQueries.js       #       Get current user (5 min cache), public profiles, admin user list
│
├── lib/                            # 📚  Core utilities and API client layer
│   ├── api/                        #     API communication modules
│   │   ├── apiClient.js            #       Central Axios instance — baseURL, CORS credentials,
│   │   │                           #       request interceptor (injects Bearer token),
│   │   │                           #       response interceptor (auto-refresh on 401)
│   │   ├── auth.api.js             #       Auth endpoints: register, verifyEmail, login, logout,
│   │   │                           #       refreshSession, forgotPassword, resetPassword
│   │   ├── category.api.js         #       Category + Tag endpoints: CRUD for both (public + admin)
│   │   ├── interaction.api.js      #       Interaction endpoints: comments, likes, bookmarks, moderation
│   │   ├── posts.api.js            #       Post endpoints: public feed, CRUD (author), admin overrides
│   │   ├── queryKeys.js            #       React Query key factory — centralised cache key definitions
│   │   │                           #       to prevent typos and make invalidation predictable
│   │   └── user.api.js             #       User endpoints: public profiles, self-service, admin ops
│   └── utils/                      #     Shared helper functions
│       ├── index.js                #       `cn()` — merges Tailwind classes via clsx + tailwind-merge
│       └── device.js               #       `getDeviceId()` — generates and persists a UUID per browser
│                                   #       (used to identify the device in auth sessions)
│
├── public/                         # 🌐  Static assets served at the root URL
│   ├── file.svg                    #     Decorative SVG icons (from Next.js starter)
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
│
├── .gitignore                      #     Files excluded from Git (node_modules, .next, .env*, etc.)
├── eslint.config.mjs               #     ESLint flat config — extends next/core-web-vitals
├── jsconfig.json                   #     Path aliases: `@/*` maps to the project root
├── next.config.mjs                 #     Next.js configuration (currently default)
├── package.json                    #     Dependencies, scripts (dev, build, start, lint)
├── postcss.config.mjs              #     PostCSS config — uses @tailwindcss/postcss plugin
├── FRONTEND_DOCS.md                #     Detailed frontend architecture documentation
└── AGENTS.md                       #     AI agent instructions for contributors
```

### Key Architectural Decisions

1. **Hooks as the data layer** — Components never call `apiClient` directly. They use hooks from `hooks/queries/` (for reads) or `hooks/mutations/` (for writes). This keeps components "dumb" and testable.

2. **Centralised query keys** — All React Query cache keys are defined in `lib/api/queryKeys.js`. When a mutation succeeds, it invalidates the exact keys it affects, triggering automatic background refetches.

3. **Decoupled API modules** — Each backend resource (`auth`, `posts`, `users`, `categories`, `interactions`) has its own API file in `lib/api/`. All error handling is standardised via a shared `handleApiError()` utility.

4. **`@/*` path alias** — Import from any directory using `@/hooks/...`, `@/lib/...`, etc. instead of brittle relative paths like `../../lib/...`. Configured in `jsconfig.json`.

---

## Installation

### Prerequisites

Before you begin, make sure you have the following installed on your machine:

| Tool | Minimum Version | How to Check |
|---|---|---|
| [Node.js](https://nodejs.org/) | v18.0.0+ | `node --version` |
| [npm](https://www.npmjs.com/) | v9.0.0+ (ships with Node) | `npm --version` |
| [Git](https://git-scm.com/) | Any recent version | `git --version` |

> **Note:** You also need the **Gaprio Blogs Backend** running (either locally on `http://localhost:8000` or a staging server). This frontend cannot function without the API.

### Step-by-step Setup

**1. Clone the repository**

```bash
git clone https://github.com/YOUR-USERNAME/gaprio-blogs-web.git
cd gaprio-blogs-web
```

**2. Install dependencies**

```bash
npm install
```

This will install all packages listed in `package.json` and generate a `node_modules/` directory. The lock file (`package-lock.json`) ensures deterministic installs.

**3. Create your environment file**

```bash
# On macOS / Linux:
cp .env.example .env.local

# On Windows (PowerShell):
Copy-Item .env.example .env.local
```

If there's no `.env.example`, create `.env.local` manually:

```bash
# Windows PowerShell:
New-Item -Path .env.local -ItemType File
```

Then add the required variables (see [Environment Variables](#environment-variables) below).

---

## Running Locally

### Development mode (recommended for daily work)

```bash
npm run dev
```

This starts the Next.js development server with **Hot Module Replacement (HMR)** — any file change instantly reflects in the browser without a full reload.

> **Default URL:** [http://localhost:3000](http://localhost:3000)

### Production build + serve

To test the optimised production bundle locally:

```bash
# Step 1: Build the project
npm run build

# Step 2: Serve the production build
npm run start
```

### Linting

Run ESLint to catch code quality issues:

```bash
npm run lint
```

### All available scripts

| Script | Command | Description |
|---|---|---|
| `dev` | `next dev` | Start the development server with HMR |
| `build` | `next build` | Create an optimised production build in `.next/` |
| `start` | `next start` | Serve the production build locally |
| `lint` | `eslint` | Run the ESLint linter across the project |

---

## Environment Variables

Create a file named **`.env.local`** in the project root. Next.js loads this file automatically and makes variables prefixed with `NEXT_PUBLIC_` available in the browser.

```env
# ─────────────────────────────────────────────
# REQUIRED
# ─────────────────────────────────────────────

# The base URL of the Gaprio Blogs Express backend.
# This must include the /api/v1 prefix.
# Example: https://api.gaprio.com/api/v1 (production)
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### How variables work in Next.js

| Prefix | Accessible where | Use case |
|---|---|---|
| `NEXT_PUBLIC_` | Browser **and** server | API URLs, public keys, feature flags |
| _(no prefix)_ | Server only | Database secrets, private API keys |

> **⚠️ Security warning:** Never put sensitive secrets (database passwords, private API keys) in a `NEXT_PUBLIC_` variable. Anything with that prefix is embedded in the client-side JavaScript bundle and visible to anyone inspecting your site.

### Variable reference

| Variable | Required | Default | Description |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | ✅ Yes | `http://localhost:8000/api/v1` | The full base URL of the backend API. The Axios client in `apiClient.js` falls back to the default if this variable is missing, but you should always set it explicitly. |

---

## Deployment

### Vercel (recommended)

Gaprio Blogs is designed for deployment on [Vercel](https://vercel.com/), the company behind Next.js. The project already includes `@vercel/analytics` and `@vercel/speed-insights` for production monitoring.

**1. Push your code to GitHub / GitLab / Bitbucket.**

**2. Import the repository on Vercel:**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Select your repository
   - Vercel auto-detects Next.js and configures the build

**3. Set environment variables:**
   - In the Vercel project settings → **Environment Variables**
   - Add `NEXT_PUBLIC_API_URL` pointing to your production backend

**4. Deploy.** Vercel runs `npm run build` automatically and serves the output on a global CDN.

### Other platforms

Since this is a standard Next.js project, you can also deploy to:

| Platform | Notes |
|---|---|
| [Netlify](https://www.netlify.com/) | Use the `@netlify/plugin-nextjs` adapter |
| [AWS Amplify](https://aws.amazon.com/amplify/) | Native Next.js support |
| [Docker](https://www.docker.com/) | Use `next build` + `next start` in a Node.js container |
| [Railway](https://railway.app/) | Auto-detects Next.js projects |

### Production checklist

- [ ] `NEXT_PUBLIC_API_URL` points to the production backend (not `localhost`)
- [ ] The backend's CORS policy allows requests from your frontend domain
- [ ] Environment variables are set in the hosting platform (not committed to Git)
- [ ] `npm run build` completes without errors
- [ ] Authentication cookies use `secure: true` and `sameSite: 'strict'` (already configured in the code)

---

## Understanding the Architecture

This section goes deeper into how the code works. If you're just getting started, this will help you understand the "why" behind the codebase's structure.

### Data Flow: From button click to screen update

Here's what happens when a user, say, **likes a post**:

```
1. User clicks ❤️ button

2. Component calls the `useToggleLikeMutation` hook
   └── hooks/mutations/useInteractionMutations.js

3. The hook calls `interactionApi.toggleLike({ postId })`
   └── lib/api/interaction.api.js

4. The API module sends a POST request via `apiClient`
   └── lib/api/apiClient.js
   └── The request interceptor injects the Bearer token from cookies

5. Backend responds with { isLiked: true }

6. The mutation's `onSuccess` callback fires:
   └── Invalidates queryKeys.posts.all
   └── React Query automatically refetches the posts list in the background

7. The UI updates — the like count reflects the new state ✅
```

### Authentication Flow

```
                      ┌─────────────────────────┐
                      │   User enters email +    │
                      │   password on /login     │
                      └───────────┬─────────────┘
                                  │
                      ┌───────────▼─────────────┐
                      │  useLoginMutation fires  │
                      │  Injects deviceId        │
                      └───────────┬─────────────┘
                                  │
                      ┌───────────▼─────────────┐
                      │  POST /auth/login        │
                      │  → Backend validates     │
                      │  → Returns tokens + user │
                      └───────────┬─────────────┘
                                  │
                ┌─────────────────┴─────────────────┐
                │  Tokens saved to browser cookies   │
                │  (accessToken + refreshToken)      │
                └─────────────────┬─────────────────┘
                                  │
              ┌───────────────────▼───────────────────┐
              │  Every subsequent API request:         │
              │  Request interceptor reads accessToken │
              │  from cookies → attaches as Bearer     │
              └───────────────────┬───────────────────┘
                                  │
              ┌───────────────────▼───────────────────┐
              │  If a 401 is returned:                 │
              │  Response interceptor pauses request   │
              │  → POSTs /auth/refresh with            │
              │    refreshToken                        │
              │  → Saves new tokens                    │
              │  → Retries the original request        │
              └───────────────────────────────────────┘
```

### React Query Key Factory

All cache keys live in `lib/api/queryKeys.js`. This factory pattern prevents typos and makes cache invalidation predictable. Here's how it works:

```js
// queryKeys.js defines structured keys like:
queryKeys.posts.list({ page: 1 })   // → ['posts', 'list', { filters: { page: 1 } }]
queryKeys.posts.detail('my-slug')   // → ['posts', 'detail', 'my-slug']
queryKeys.users.me()                // → ['users', 'me']

// When a mutation succeeds, it invalidates the right keys:
queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() })
// This tells React Query: "All cached post lists are now stale — refetch them."
```

### The `cn()` Utility

The `cn()` function in `lib/utils/index.js` is a small but critical utility used throughout the project. It combines [`clsx`](https://github.com/lukeed/clsx) (conditional class construction) with [`tailwind-merge`](https://github.com/dcastil/tailwind-merge) (intelligent Tailwind class deduplication):

```js
import { cn } from '@/lib/utils';

// Without cn() — broken! Both padding classes are applied, causing conflicts.
<div className={`px-4 ${isCompact ? 'px-2' : ''}`} />

// With cn() — correct! tailwind-merge keeps only the last padding value.
<div className={cn('px-4', isCompact && 'px-2')} />
```

### The Device ID System

The `getDeviceId()` function in `lib/utils/device.js` generates a unique UUID for each browser and persists it in `localStorage`. This ID is injected into login and registration requests so the backend can track sessions per device:

```js
import { getDeviceId } from '@/lib/utils/device';

// First call on a new browser:
getDeviceId(); // → "a1b2c3d4-e5f6-..." (generated and saved to localStorage)

// Every subsequent call on the same browser:
getDeviceId(); // → "a1b2c3d4-e5f6-..." (read from localStorage)
```

---

## Contributing

We welcome contributions from developers of all skill levels! Here's how to get involved.

### The Contribution Workflow

1. **Fork the repository** — Click the "Fork" button on GitHub to create your own copy.

2. **Clone your fork locally**
   ```bash
   git clone https://github.com/YOUR-USERNAME/gaprio-blogs-web.git
   cd gaprio-blogs-web
   ```

3. **Install dependencies and set up environment**
   ```bash
   npm install
   cp .env.example .env.local
   # Edit .env.local with your backend URL
   ```

4. **Create a feature branch** — Never commit directly to `main`.
   ```bash
   git checkout -b feature/your-feature-name
   ```
   Use descriptive prefixes:
   | Prefix | Example | When to use |
   |---|---|---|
   | `feature/` | `feature/author-dashboard` | New functionality |
   | `bugfix/` | `bugfix/login-redirect` | Fixing a bug |
   | `style/` | `style/navbar-responsiveness` | Visual / CSS changes |
   | `hotfix/` | `hotfix/token-refresh-loop` | Urgent production fix |

5. **Write your code and test**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) and verify your changes across mobile, tablet, and desktop viewports.

6. **Commit with a clear message**
   ```bash
   git add .
   git commit -m "feat: added responsive sidebar to the author dashboard"
   ```

7. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

8. **Open a Pull Request** — Go to the original repository on GitHub, click "Compare & pull request", provide a clear description, and include screenshots or GIFs of any UI changes.

### Coding Standards

| Rule | Details |
|---|---|
| **Styling** | Use Tailwind CSS classes only — no inline `style={}`. For dynamic classes, use the `cn()` utility from `@/lib/utils`. |
| **Forms** | Build all forms with `react-hook-form` and validate with `Zod` schemas. |
| **Server state** | Use TanStack React Query hooks from `hooks/queries/` and `hooks/mutations/`. Never call API functions directly from components. |
| **Client state** | Use Zustand stores for global UI state (modals, themes, sidebar). Use `useState` for local component state. |
| **File organisation** | Keep `app/` directory pages thin. Heavy logic and reusable layout components belong in a `components/` directory (to be created), not inline in `page.js` files. |
| **Imports** | Use the `@/` path alias (e.g., `import { cn } from '@/lib/utils'`) instead of relative paths. |

### What makes a great PR

- ✅ Clear, descriptive title
- ✅ Screenshots or screen recordings of UI changes
- ✅ Links to any related issues (e.g., "Fixes #12")
- ✅ Responsive design verified on mobile, tablet, and desktop
- ✅ No `console.log` statements left in production code
- ✅ Lint passes (`npm run lint`)

---

## License

This project is **proprietary**. All rights reserved by the Gaprio team. Please contact the project maintainers for licensing inquiries.

---

<p align="center">
  Built with ❤️ by the <strong>Gaprio Labs</strong> team
</p>
