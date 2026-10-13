<script setup>
import { projects } from '@/data/projects'

defineProps({ open: Boolean })
defineEmits(['close'])
</script>

<template>
  <Transition name="fade">
    <div v-if="open" class="scrim" aria-hidden="true" @click="$emit('close')" />
  </Transition>
  <nav id="app-sidebar" class="sidebar" :class="{ open }" aria-label="Work">
    <div class="group">
      <RouterLink to="/dashboard" class="nav-item" active-class="active">
        <svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></svg>
        Dashboard
      </RouterLink>
      <RouterLink to="/hire-me" class="nav-item" active-class="active">
        <svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
        Hire me
      </RouterLink>

      <div class="label projects-label">Work</div>
      <RouterLink
        v-for="p in projects"
        :key="p.slug"
        :to="`/projects/${p.slug}`"
        class="nav-item"
        active-class="active"
      >
        <img class="logo" :src="p.logo" alt="" aria-hidden="true" />
        {{ p.name }}
      </RouterLink>
    </div>

  </nav>
</template>

<style scoped>
.sidebar {
  width: var(--sidebar-w);
  flex-shrink: 0;
  padding: 20px 12px 16px;
  background: var(--surface);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow-y: auto;
}
.scrim {
  display: none;
}
.group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.label {
  padding: 0 12px 8px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-subtle);
}
.projects-label {
  padding-top: 16px;
}
.nav-item {
  height: 44px;
  padding: 0 12px;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 12px;
}
.nav-item:hover {
  background: var(--hover);
}
.nav-item.active {
  background: var(--active);
  font-weight: 600;
}
.logo {
  width: 26px;
  height: 26px;
  object-fit: contain;
  flex-shrink: 0;
}
.icon {
  margin: 0 3px;
}
@media (max-width: 768px) {
  .sidebar {
    position: absolute;
    inset: 0 auto 0 0;
    width: min(var(--sidebar-w), 82vw);
    z-index: 20;
    transform: translateX(-100%);
    visibility: hidden;
    transition: transform 0.22s ease, visibility 0.22s;
  }
  .sidebar.open {
    transform: none;
    visibility: visible;
    box-shadow: 0 12px 32px rgba(24, 24, 27, 0.12);
  }
  .scrim {
    display: block;
    position: absolute;
    inset: 0;
    z-index: 19;
    background: rgba(24, 24, 27, 0.32);
  }
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.22s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
@media (prefers-reduced-motion: reduce) {
  .sidebar,
  .fade-enter-active,
  .fade-leave-active {
    transition: none;
  }
}
</style>
