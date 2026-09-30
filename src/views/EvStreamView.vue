<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import OddsTable from '@/components/evstream/OddsTable.vue'
import BetModal from '@/components/evstream/BetModal.vue'
import PipelinePanel from '@/components/evstream/PipelinePanel.vue'
import { bookies, race, runners } from '@/data/evstream'

defineProps({ title: { type: String, required: true } })

const FLASH_MS = 1400

// Odds move on a ladder: finer steps for favourites, coarser for long shots.
const stepFor = (odds) => (odds < 4 ? 0.05 : odds < 10 ? 0.1 : odds < 20 ? 0.5 : 1)
const snap = (odds) => {
  const step = stepFor(odds)
  return Math.max(1.05, Number((Math.round(odds / step) * step).toFixed(2)))
}
const rand = (min, max) => min + Math.random() * (max - min)

// prices[runnerId][bookieId] = { odds, open, dir, flashId }
const prices = reactive(
  Object.fromEntries(
    runners.map((r) => [
      r.id,
      Object.fromEntries(
        bookies.map((b) => {
          const odds = snap(r.open * rand(0.92, 1.08))
          return [b.id, { odds, open: odds, dir: null, flashId: 0 }]
        }),
      ),
    ]),
  ),
)

const flashTimers = new Map()

// What each scraper service has sent, and the last price event. Feeds the pipeline view.
const scrapers = reactive(Object.fromEntries(bookies.map((b) => [b.id, { count: 0, lastAt: Date.now() }])))
const lastEvent = ref(null)

const moveOne = () => {
  const runner = runners[Math.floor(Math.random() * runners.length)]
  const bookie = bookies[Math.floor(Math.random() * bookies.length)]
  const cell = prices[runner.id][bookie.id]

  // Pull back toward the opening price so the market does not wander off.
  const drift = cell.odds / cell.open
  const upChance = drift > 1.4 ? 0.2 : drift < 0.7 ? 0.8 : 0.5
  const up = Math.random() < upChance
  let next = snap(cell.odds * (up ? 1 + rand(0.02, 0.08) : 1 - rand(0.02, 0.08)))
  if (next === cell.odds) next = snap(cell.odds + (up ? 1 : -1) * stepFor(cell.odds))
  if (next === cell.odds) return

  lastEvent.value = { runner: runner.name, bookie: bookie.id, prev: cell.odds, price: next, id: cell.flashId + 1 }
  scrapers[bookie.id].count++
  scrapers[bookie.id].lastAt = Date.now()

  cell.dir = next > cell.odds ? 'up' : 'down'
  cell.odds = next
  cell.flashId++

  const key = `${runner.id}:${bookie.id}`
  clearTimeout(flashTimers.get(key))
  flashTimers.set(key, setTimeout(() => (cell.dir = null), FLASH_MS))
}

// Yield: best price against the fair price from the bookies' consensus, with their margin removed.
// Positive means the best price pays more than the runner's chance of winning is worth.
const yields = computed(() => {
  const implied = runners.map((r) => bookies.reduce((sum, b) => sum + 1 / prices[r.id][b.id].odds, 0) / bookies.length)
  const book = implied.reduce((a, b) => a + b, 0)
  return Object.fromEntries(
    runners.map((r, i) => {
      const best = Math.max(...bookies.map((b) => prices[r.id][b.id].odds))
      return [r.id, (best * (implied[i] / book) - 1) * 100]
    }),
  )
})

const topPick = computed(() => {
  const runner = runners.reduce((a, b) => (yields.value[b.id] > yields.value[a.id] ? b : a))
  const bookie = bookies.reduce((a, b) => (prices[runner.id][b.id].odds > prices[runner.id][a.id].odds ? b : a))
  return { runner, bookie, odds: prices[runner.id][bookie.id].odds, yield: yields.value[runner.id] }
})

const live = ref(true)
const showStack = ref(false)
const bets = ref([])
let tickTimer = null
const schedule = () => {
  tickTimer = setTimeout(() => {
    if (live.value) moveOne()
    schedule()
  }, rand(250, 1200))
}

const secondsLeft = ref(race.jumpsInSeconds)
let clockTimer = null
const jumpsIn = computed(() => {
  const m = Math.floor(secondsLeft.value / 60)
  const s = String(secondsLeft.value % 60).padStart(2, '0')
  return `${m}:${s}`
})

onMounted(() => {
  schedule()
  clockTimer = setInterval(() => {
    secondsLeft.value = secondsLeft.value > 0 ? secondsLeft.value - 1 : race.jumpsInSeconds
  }, 1000)
})
onBeforeUnmount(() => {
  clearTimeout(tickTimer)
  clearInterval(clockTimer)
  flashTimers.forEach(clearTimeout)
})

// { runner, bookie } for the open bet modal. The price is read live from `prices`.
const selected = ref(null)
const selectedCell = computed(() => selected.value && prices[selected.value.runner.id][selected.value.bookie.id])
</script>

<template>
  <div class="page">
    <div class="head">
      <div class="crumb">Work / {{ title }}</div>
      <h1>{{ title }}</h1>
      <p>
        A betting intelligence app I built with the product owner. It watches Australian bookmakers in real time so
        punters can find the best price. The board below is a live demo. Click any price to place a pretend bet.
      </p>
    </div>

    <div class="stack-toolbar">
      <button type="button" role="switch" class="switch big" :aria-checked="showStack" @click="showStack = !showStack">
        <span class="knob" aria-hidden="true"></span>
        Show the pipeline
      </button>
      <span class="hint">{{
        showStack
          ? 'Every price below travels through these services. Watch them light up as the odds move.'
          : 'See the services I built behind each number.'
      }}</span>
    </div>

    <Transition name="reveal">
      <PipelinePanel
        v-if="showStack"
        :bookies="bookies"
        :scrapers="scrapers"
        :last-event="lastEvent"
        :top-pick="topPick"
        :bets="bets"
      />
    </Transition>

    <section class="race">
      <div class="race-top">
        <div class="race-title">
          <h2>{{ race.name }}</h2>
          <span class="jump" :aria-label="`Jumps in ${jumpsIn}`">{{ jumpsIn }}</span>
        </div>
        <div class="race-meta">Win {{ race.win }} · Place {{ race.place }} · {{ runners.length }} runners</div>
      </div>

      <div class="toolbar">
        <div class="legend">
          <span class="legend-label">Movements</span>
          <span class="chip up">Longer</span>
          <span class="chip down">Shorter</span>
        </div>
        <button type="button" role="switch" class="switch" :aria-checked="live" @click="live = !live">
          <span class="knob" aria-hidden="true"></span>
          Live
        </button>
      </div>

      <OddsTable
        :runners="runners"
        :bookies="bookies"
        :prices="prices"
        :yields="yields"
        :selected="selected"
        :show-stack="showStack"
        @select="selected = $event"
      />
    </section>

    <BetModal
      :runner="selected?.runner"
      :bookie="selected?.bookie"
      :cell="selectedCell"
      :race-name="race.name"
      :show-stack="showStack"
      @place="bets.push($event)"
      @close="selected = null"
    />
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.head {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.crumb {
  font-size: 13px;
  color: var(--text-muted);
  font-family: var(--font-mono);
}
h1 {
  margin: 0;
  font-size: 30px;
  font-weight: 600;
  letter-spacing: -0.02em;
}
p {
  margin: 0;
  font-size: 15px;
  color: var(--text-muted);
}
.stack-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.hint {
  font-size: 13px;
  color: var(--text-muted);
}
.switch.big {
  height: 40px;
  padding: 0 14px 0 10px;
  border-radius: var(--radius-md);
  font-size: 14px;
  gap: 10px;
}
.reveal-enter-active,
.reveal-leave-active {
  transition: opacity 0.2s, transform 0.2s ease;
}
.reveal-enter-from,
.reveal-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
.race {
  /* The board is the EVStream app itself, so it runs on its own dark palette. */
  --text: var(--ev-text);
  --text-muted: var(--ev-text-muted);
  --text-subtle: var(--ev-text-subtle);
  --border: var(--ev-border);
  --border-soft: var(--ev-border-soft);
  --border-dashed: var(--ev-border-strong);
  --surface-muted: var(--ev-surface);
  --hover: var(--ev-hover);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--ev-bg);
  color: var(--text);
  overflow: hidden;
}
.race-top {
  padding: 20px 20px 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.race-title {
  display: flex;
  align-items: center;
  gap: 10px;
}
h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.01em;
}
.jump {
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent);
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.race-meta {
  font-size: 12px;
  color: var(--text-muted);
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.toolbar {
  padding: 10px 20px;
  border-top: 1px solid var(--border-soft);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
.legend {
  display: flex;
  align-items: center;
  gap: 8px;
}
.legend-label {
  font-size: 11px;
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-subtle);
}
.chip {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}
.chip.up {
  color: var(--status-confirmed);
  background: color-mix(in srgb, var(--status-confirmed) 14%, transparent);
}
.chip.down {
  color: var(--danger);
  background: color-mix(in srgb, var(--danger) 12%, transparent);
}
.switch {
  height: 32px;
  padding: 0 12px 0 8px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--text);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}
.race .switch {
  background: transparent;
}
.switch:hover {
  background: var(--hover);
}
.knob {
  position: relative;
  width: 28px;
  height: 16px;
  border-radius: 999px;
  background: var(--border-dashed);
  transition: background 0.15s;
}
.knob::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--surface);
  transition: transform 0.15s;
}
.switch[aria-checked='true'] .knob {
  background: var(--accent);
}
.switch[aria-checked='true'] .knob::after {
  transform: translateX(12px);
}
</style>
