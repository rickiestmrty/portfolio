# Portfolio

SaaS-style portfolio for Nestor Desabille. Vue 3 + Vite + Vue Router.

## Run

```bash
npm install
npm run dev
```

## Structure

- `src/data/projects.js`: sidebar projects. Add an entry to add a nav item and a page.
- `src/data/profile.js`: name, initials, email and profile photo.
- `src/components/AppHeader.vue`: title (left) and profile menu (right).
- `src/components/ProfileMenu.vue`: avatar dropdown with Profile and Logout.
- `src/components/AppSidebar.vue`: project nav, Settings at the bottom.
- `src/components/PlaceholderPage.vue`: placeholder layout used by every page.
- `src/views/`: route pages (project, settings, profile).
- `src/style.css`: design tokens (colors, radius, fonts).
