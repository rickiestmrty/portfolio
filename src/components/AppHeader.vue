<script setup>
import ProfileMenu from './ProfileMenu.vue'
import { profile } from '@/data/profile'

defineProps({ navOpen: Boolean })
defineEmits(['toggle-nav'])
</script>

<template>
  <header class="header">
    <div class="start">
      <button
        type="button"
        class="menu-btn"
        :aria-label="navOpen ? 'Close navigation' : 'Open navigation'"
        :aria-expanded="navOpen"
        aria-controls="app-sidebar"
        @click="$emit('toggle-nav')"
      >
        <svg v-if="navOpen" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
      </button>
      <RouterLink to="/" class="brand">{{ profile.firstName }}'s Portfolio</RouterLink>
    </div>
    <div class="actions">
      <a :href="`mailto:${profile.email}`" class="btn" aria-label="Contact by email">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
        <span class="btn-label">Contact</span>
      </a>
      <a :href="profile.resume" :download="profile.resumeFileName" class="btn primary" aria-label="Download resume">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></svg>
        <span class="btn-label">Resume</span>
      </a>
      <a
        :href="profile.linkedin"
        target="_blank"
        rel="noopener noreferrer"
        class="btn icon-only"
        aria-label="LinkedIn (opens in a new tab)"
        title="LinkedIn"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" /></svg>
      </a>
      <ProfileMenu />
    </div>
  </header>
</template>

<style scoped>
.header {
  height: var(--header-h);
  flex-shrink: 0;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  position: relative;
  z-index: 30;
}
.start {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.btn {
  height: 40px;
  padding: 0 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
  color: var(--text);
  font-size: 14px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  white-space: nowrap;
  transition: background 0.15s, border-color 0.15s;
}
.btn:hover {
  background: var(--hover);
}
.btn.primary {
  border-color: var(--text);
  background: var(--text);
  color: var(--on-brand);
}
.btn.primary:hover {
  border-color: var(--accent);
  background: var(--accent);
}
.btn.icon-only {
  width: 40px;
  padding: 0;
}
.brand {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.menu-btn {
  display: none;
  width: 44px;
  height: 44px;
  margin-left: -10px;
  padding: 0;
  border: 0;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--text);
  cursor: pointer;
  place-items: center;
  flex-shrink: 0;
}
.menu-btn:hover {
  background: var(--hover);
}
@media (max-width: 768px) {
  .header {
    padding: 0 16px;
  }
  .actions {
    gap: 4px;
  }
  /* Icon-only on small screens. The links keep their aria-labels. */
  .btn {
    width: 40px;
    padding: 0;
  }
  .btn-label {
    display: none;
  }
  .menu-btn {
    display: grid;
  }
}
</style>
