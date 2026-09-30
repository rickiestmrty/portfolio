<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { projects } from '@/data/projects'

const emit = defineEmits(['done'])

const COMMAND = 'nestor run dev'

// Each line: text, optional tone (ok/info/warn/muted), delay before it prints (ms).
const OUTPUT = [
  { text: '> portfolio@0.1.0 dev', tone: 'muted', delay: 180 },
  { text: '> vite --host nestor', tone: 'muted', delay: 90 },
  { text: '', delay: 120 },
  { text: 'building for development...', tone: 'info', delay: 220 },
  { text: '✓ resolved dependencies', tone: 'ok', delay: 260 },
  { text: `✓ compiled ${projects.length} projects`, tone: 'ok', delay: 200 },
  { text: '✓ loaded profile.js', tone: 'ok', delay: 160 },
  { text: '⚠ coffee level low, continuing anyway', tone: 'warn', delay: 240 },
  { text: '✓ transformed 128 modules', tone: 'ok', delay: 200 },
  { text: '', delay: 100 },
  { text: 'ready in 1.24s  ➜  opening dashboard', tone: 'info', delay: 260 },
]

const typed = ref('')
const lines = ref([])
const phase = ref('boot') // boot → typing → output → loading → leaving
const progress = ref(0)

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
  setTimeout(() => emit('done'), 350)
}

const run = async () => {
  await wait(700)
  phase.value = 'typing'
  for (const ch of COMMAND) {
    if (cancelled) return
    typed.value += ch
    await wait(55 + Math.random() * 70)
  }
  await wait(350)
  if (cancelled) return
  phase.value = 'output'
  for (const line of OUTPUT) {
    await wait(line.delay)
    if (cancelled) return
    lines.value.push(line)
  }
  await wait(450)
  if (cancelled) return
  phase.value = 'loading'
  // Fill the bar in uneven steps so it feels like real work.
  for (const step of [18, 41, 57, 76, 92, 100]) {
    await wait(110 + Math.random() * 90)
    if (cancelled) return
    progress.value = step
  }
  await wait(250)
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
  <div class="intro" :class="{ leaving: phase === 'leaving' }" role="status" aria-label="Loading portfolio">
    <Transition name="swap">
      <div v-if="phase !== 'loading' && phase !== 'leaving'" key="term" class="term">
        <div class="bar">
          <span class="dot" /><span class="dot" /><span class="dot" />
          <span class="title">nestor — zsh</span>
        </div>
        <div class="screen">
          <div class="row">
            <span class="prompt">~/portfolio</span>
            <span class="caret-sym">$</span>
            <span class="cmd">{{ typed }}</span>
            <span v-if="phase === 'boot' || phase === 'typing'" class="cursor" :class="{ solid: phase === 'typing' }" />
          </div>
          <div v-for="(line, i) in lines" :key="i" class="row out" :class="line.tone">{{ line.text || ' ' }}</div>
          <div v-if="phase === 'output'" class="row"><span class="cursor" /></div>
        </div>
      </div>

      <div v-else key="load" class="loader">
        <div class="brand">nestor<span class="blink">_</span></div>
        <div class="track"><div class="fill" :style="{ width: progress + '%' }" /></div>
        <div class="pct">{{ progress }}%</div>
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
  transition: opacity 0.35s ease;
}
.intro.leaving {
  opacity: 0;
  pointer-events: none;
}

.term,
.loader {
  /* Share one grid cell so the terminal and loader crossfade in place. */
  grid-area: 1 / 1;
}
.term {
  width: min(680px, 100%);
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
  min-height: 320px;
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
.out.warn {
  color: var(--term-warn);
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

.loader {
  width: min(320px, 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}
.brand {
  font-family: var(--font);
  font-size: 28px;
  font-weight: 600;
  letter-spacing: -0.02em;
}
.blink {
  color: var(--term-ok);
  animation: blink 1s steps(1) infinite;
}
.track {
  width: 100%;
  height: 4px;
  border-radius: 999px;
  background: var(--ev-border);
  overflow: hidden;
}
.fill {
  height: 100%;
  background: var(--term-ok);
  transition: width 0.18s ease-out;
}
.pct {
  font-size: 12px;
  color: var(--ev-text-subtle);
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

.swap-enter-active,
.swap-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.swap-enter-from {
  opacity: 0;
  transform: scale(0.98);
}
.swap-leave-to {
  opacity: 0;
  transform: scale(1.02);
}

@media (max-width: 768px) {
  .screen {
    font-size: 12.5px;
    padding: 14px 14px 18px;
    min-height: 280px;
  }
}
</style>
