# CLAUDE.md

Personal portfolio built as a SaaS-style dashboard.

- Stack: Vue 3 (`<script setup>`), Vite, Vue Router. No UI library.
- Styles: scoped CSS per component. Use the CSS variables in `src/style.css`. Do not hard-code new colors.
- Font: Geist (body), Geist Mono (small labels). Loaded in `index.html`.
- Routes: `/dashboard`, `/projects/:slug`, `/hire-me`, `/profile`. `/` redirects to `/dashboard`, `/settings` redirects to `/hire-me`.
- Page titles and Open Graph text live in `src/data/pages.js`. Add an entry there for every new route.
- Project case blocks (Problem / What I built / Result) live in `study` in `src/data/projects.js`. `TODO` values are facts still to fill in.
- `public/resume.pdf` is the Resume button's file. It is a placeholder until replaced.
- Project list lives in `src/data/projects.js`. Profile info lives in `src/data/profile.js`.
- Page content is placeholder for now (`PlaceholderPage.vue`). Replace per view when real content is ready.
- Logout in `ProfileMenu.vue` is a TODO. It only navigates to `/`.
- Commands: `npm run dev`, `npm run build`.
