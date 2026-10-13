<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { projects } from '@/data/projects'

const emit = defineEmits(['done'])

const COMMAND = 'npm run dev'

// Each line: text, optional tone (ok/info/muted), delay before it prints (ms).
const OUTPUT = [
  { text: '> portfolio@0.1.0 dev', tone: 'muted', delay: 100 },
  { text: '> vite', tone: 'muted', delay: 60 },
  { text: '', delay: 60 },
  { text: '✓ profile loaded', tone: 'ok', delay: 130 },
  { text: `✓ ${projects.length} projects loaded`, tone: 'ok', delay: 110 },
  { text: '', delay: 60 },
  { text: 'Ready. Opening dashboard.', tone: 'info', delay: 140 },
]

const typed = ref('')
const lines = ref([])
const phase = ref('boot') // boot → typing → output → loading → leaving

let timers = []
let cancelled = false
const wait = (ms) =>
  new Promise((resolve) => {
    timers.push(setTimeout(resolve, ms))
  })

const finish = () => {
  if (phase.value === 'leaving') return
  cancelled = true
  timers.forEach(clearTimeout)
  timers = []
  phase.value = 'leaving'
  setTimeout(() => emit('done'), 300)
}

const run = async () => {
  await wait(300)
  phase.value = 'typing'
  for (const ch of COMMAND) {
    if (cancelled) return
    typed.value += ch
    await wait(35 + Math.random() * 35)
  }
  await wait(200)
  if (cancelled) return
  phase.value = 'output'
  for (const line of OUTPUT) {
    await wait(line.delay)
    if (cancelled) return
    lines.value.push(line)
  }
  await wait(300)
  if (cancelled) return
  // Skeleton of the dashboard while the real one settles underneath.
  phase.value = 'loading'
  await wait(900)
  finish()
}

const onKey = (e) => {
  if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') finish()
}

onMounted(() => {
  document.addEventListener('keydown', onKey)
  run()
})
onBeforeUnmount(() => {
  cancelled = true
  timers.forEach(clearTimeout)
  document.removeEventListener('keydown', onKey)
})
</script>

<template>
  <div
    class="intro"
    :class="{ loading: phase === 'loading' || phase === 'leaving', leaving: phase === 'leaving' }"
    role="status"
    aria-label="Loading portfolio"
  >
    <Transition name="swap">
      <div v-if="phase !== 'loading' && phase !== 'leaving'" key="term" class="term">
        <div class="bar">
          <span class="dot" /><span class="dot" /><span class="dot" />
          <span class="title">portfolio — zsh</span>
        </div>
        <div class="screen">
          <div class="row">
            <span class="prompt">~/portfolio</span>
            <span class="caret-sym">$</span>
            <span class="cmd">{{ typed }}</span>
            <span v-if="phase === 'boot' || phase === 'typing'" class="cursor" :class="{ solid: phase === 'typing' }" />
          </div>
          <div v-for="(line, i) in lines" :key="i" class="row out" :class="line.tone">{{ line.text || ' ' }}</div>
          <div v-if="phase === 'output'" class="row"><span class="cursor" /></div>
        </div>
      </div>

      <div v-else key="load" class="skeleton" aria-hidden="true">
        <div class="sk-header">
          <span class="sk sk-brand"></span>
          <span class="sk sk-avatar"></span>
        </div>
        <div class="sk-body">
          <div class="sk-side">
            <span v-for="n in 6" :key="n" class="sk sk-nav"></span>
          </div>
          <div class="sk-main">
            <span class="sk sk-title"></span>
            <span class="sk sk-line"></span>
            <span class="sk sk-line short"></span>
            <span class="sk sk-card grid"></span>
            <div class="sk-cards">
              <span class="sk sk-card"></span>
              <span class="sk sk-card"></span>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <button type="button" class="skip" @click="finish">skip ↵</button>
  </div>
</template>

<style scoped>
.intro {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: var(--ev-bg);
  color: var(--ev-text);
  font-family: var(--font-mono);
  display: grid;
  place-items: center;
  padding: 16px;
  transition: opacity 0.3s ease, background-color 0.25s ease;
}
/* The skeleton uses the app's own light palette, so the hand-off to the real page is quiet. */
.intro.loading {
  background: var(--bg);
}
.intro.leaving {
  opacity: 0;
  pointer-events: none;
}

.term {
  /* Share one grid cell with the skeleton so they crossfade in place. */
  grid-area: 1 / 1;
  width: min(640px, 100%);
  background: var(--ev-surface);
  border: 1px solid var(--ev-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}
.bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--ev-border-soft);
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--ev-border-strong);
}
.title {
  flex: 1;
  text-align: center;
  margin-right: 42px;
  font-size: 12px;
  color: var(--ev-text-subtle);
}
.screen {
  padding: 18px 20px 22px;
  min-height: 200px;
  font-size: 14px;
  line-height: 1.7;
}
.row {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: pre-wrap;
  word-break: break-word;
}
.prompt {
  color: var(--term-info);
}
.caret-sym {
  color: var(--ev-text-subtle);
}
.out {
  display: block;
  color: var(--ev-text);
}
.out.muted {
  color: var(--ev-text-subtle);
}
.out.ok {
  color: var(--term-ok);
}
.out.info {
  color: var(--term-info);
}

.cursor {
  display: inline-block;
  width: 9px;
  height: 18px;
  background: var(--ev-text);
  animation: blink 1s steps(1) infinite;
}
.cursor.solid {
  animation: none;
}
@keyframes blink {
  50% {
    opacity: 0;
  }
}

/* Skeleton of the dashboard: header, sidebar, heading, text, grid card, two cards. */
.skeleton {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: var(--bg);
}
.sk {
  display: block;
  border-radius: 6px;
  background: linear-gradient(90deg, var(--border-soft) 0%, var(--border) 50%, var(--border-soft) 100%);
  background-size: 200% 100%;
  animation: shimmer 1.4s linear infinite;
}
@keyframes shimmer {
  from {
    background-position: 200% 0;
  }
  to {
    background-position: -200% 0;
  }
}
.sk-header {
  height: var(--header-h);
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
}
.sk-brand {
  width: 160px;
  height: 18px;
}
.sk-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
}
.sk-body {
  flex: 1;
  display: flex;
  min-height: 0;
}
.sk-side {
  width: var(--sidebar-w);
  flex-shrink: 0;
  padding: 20px 12px;
  background: var(--surface);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.sk-nav {
  height: 36px;
}
.sk-main {
  flex: 1;
  min-width: 0;
  max-width: 1160px;
  padding: 32px 40px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.sk-title {
  width: min(280px, 70%);
  height: 30px;
}
.sk-line {
  width: min(640px, 100%);
  height: 14px;
}
.sk-line.short {
  width: min(420px, 70%);
}
.sk-card {
  height: 180px;
  border-radius: var(--radius-lg);
}
.sk-card.grid {
  margin-top: 20px;
  height: 200px;
}
.sk-cards {
  margin-top: 8px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.skip {
  position: absolute;
  right: 20px;
  bottom: 20px;
  padding: 6px 10px;
  border: 1px solid var(--ev-border);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--ev-text-subtle);
  font-family: var(--font-mono);
  font-size: 12px;
  cursor: pointer;
}
.skip:hover {
  color: var(--ev-text);
  background: var(--ev-hover);
}
.intro.loading .skip {
  border-color: var(--border);
  color: var(--text-muted);
}
.intro.loading .skip:hover {
  color: var(--text);
  background: var(--hover);
}

.swap-enter-active,
.swap-leave-active {
  transition: opacity 0.25s ease;
}
.swap-leave-active {
  position: absolute;
}
.swap-enter-from,
.swap-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .screen {
    font-size: 12.5px;
    padding: 14px 14px 18px;
  }
  .sk-header {
    padding: 0 16px;
  }
  .sk-side {
    display: none;
  }
  .sk-main {
    padding: 20px 16px;
  }
  .sk-cards {
    grid-template-columns: 1fr;
  }
}
@media (prefers-reduced-motion: reduce) {
  .sk {
    animation: none;
  }
}
</style>
