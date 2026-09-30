<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { profile } from '@/data/profile'

const router = useRouter()
const open = ref(false)
const root = ref(null)

const close = () => (open.value = false)
const toggle = () => (open.value = !open.value)

const goProfile = () => {
  close()
  router.push({ name: 'profile' })
}

const logout = () => {
  close()
  // TODO: replace with real sign-out logic
  router.push('/')
}

const onDocClick = (e) => {
  if (root.value && !root.value.contains(e.target)) close()
}
const onKey = (e) => {
  if (e.key === 'Escape') close()
}

onMounted(() => {
  document.addEventListener('click', onDocClick)
  document.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick)
  document.removeEventListener('keydown', onKey)
})
</script>

<template>
  <div ref="root" class="profile">
    <button
      type="button"
      class="avatar"
      aria-label="Open profile menu"
      aria-haspopup="menu"
      :aria-expanded="open"
      @click="toggle"
    >
      <img v-if="profile.photo" :src="profile.photo" :alt="profile.name" :style="profile.photoStyle" />
      <span v-else>{{ profile.initials }}</span>
    </button>

    <Transition name="pop">
      <div v-if="open" class="menu" role="menu">
        <div class="who">
          <div class="who-name">{{ profile.name }}</div>
          <div class="who-email">{{ profile.email }}</div>
        </div>
        <button type="button" role="menuitem" class="item" @click="goProfile">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></svg>
          Profile
        </button>
        <button type="button" role="menuitem" class="item danger" @click="logout">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></svg>
          Logout
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.profile {
  position: relative;
}
.avatar {
  width: 44px;
  height: 44px;
  padding: 0;
  border-radius: 999px;
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px #d9d8d2;
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: grid;
  place-items: center;
  overflow: hidden;
}
.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.menu {
  position: absolute;
  top: 54px;
  right: 0;
  width: 220px;
  padding: 6px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: 0 12px 32px rgba(24, 24, 27, 0.12);
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.who {
  padding: 10px 10px 8px;
  margin-bottom: 4px;
  border-bottom: 1px solid var(--border-soft);
}
.who-name {
  font-size: 14px;
  font-weight: 600;
}
.who-email {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 2px;
}
.item {
  height: 40px;
  padding: 0 10px;
  border: 0;
  border-radius: var(--radius-sm);
  background: transparent;
  font-size: 14px;
  color: var(--text);
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
}
.item:hover {
  background: var(--hover);
}
.item.danger {
  color: var(--danger);
}
.pop-enter-active,
.pop-leave-active {
  transition: opacity 0.12s ease, transform 0.12s ease;
}
.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
