<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import AppSidebar from './components/AppSidebar.vue'

const route = useRoute()
const navOpen = ref(false)

watch(() => route.fullPath, () => (navOpen.value = false))

const onKey = (e) => {
  if (e.key === 'Escape') navOpen.value = false
}
onMounted(() => document.addEventListener('keydown', onKey))
onBeforeUnmount(() => document.removeEventListener('keydown', onKey))
</script>

<template>
  <div class="shell">
    <AppHeader :nav-open="navOpen" @toggle-nav="navOpen = !navOpen" />
    <div class="body">
      <AppSidebar :open="navOpen" @close="navOpen = false" />
      <main class="main">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
.shell {
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
}
.body {
  flex: 1;
  display: flex;
  min-height: 0;
  position: relative;
}
.main {
  /* Full-bleed pages read these to cancel the padding. */
  --main-pad-y: 32px;
  --main-pad-x: 40px;
  flex: 1;
  min-width: 0;
  overflow: auto;
  padding: var(--main-pad-y) var(--main-pad-x);
}
@media (max-width: 1024px) {
  .main {
    --main-pad-y: 24px;
    --main-pad-x: 24px;
  }
}
@media (max-width: 768px) {
  .main {
    --main-pad-y: 20px;
    --main-pad-x: 16px;
  }
}
</style>
