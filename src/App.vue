<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import AppSidebar from './components/AppSidebar.vue'
import IntroSequence from './components/IntroSequence.vue'

const route = useRoute()
const navOpen = ref(false)

// Terminal intro plays once per browser session and is skipped for reduced motion.
const INTRO_KEY = 'intro-seen'
const readSeen = () => {
  try {
    return sessionStorage.getItem(INTRO_KEY) === '1'
  } catch {
    return false
  }
}
const showIntro = ref(!readSeen() && !window.matchMedia('(prefers-reduced-motion: reduce)').matches)
const onIntroDone = () => {
  showIntro.value = false
  try {
    sessionStorage.setItem(INTRO_KEY, '1')
  } catch {}
}

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
  <IntroSequence v-if="showIntro" @done="onIntroDone" />
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
