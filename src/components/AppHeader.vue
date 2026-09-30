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
    <ProfileMenu />
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
  .menu-btn {
    display: grid;
  }
}
</style>
