<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { dollars, fmtOdds } from './odds'

const props = defineProps({
  bookies: { type: Array, required: true },
  scrapers: { type: Object, required: true },
  lastEvent: { type: Object, default: null },
  topPick: { type: Object, required: true },
  bets: { type: Array, required: true },
})

const now = ref(Date.now())
let timer = null
onMounted(() => (timer = setInterval(() => (now.value = Date.now()), 250)))
onBeforeUnmount(() => clearInterval(timer))

const ago = (at) => `${Math.max(0, (now.value - at) / 1000).toFixed(1)}s ago`
const fmtYield = (y) => `${y > 0 ? '+' : ''}${y.toFixed(1)}%`

const payload = computed(() => {
  const e = props.lastEvent
  if (!e) return '// waiting for the first price…'
  return JSON.stringify({ runner: e.runner, bookie: e.bookie, prev: e.prev, price: e.price }, null, 2)
})

const lastBet = computed(() => props.bets[props.bets.length - 1])
</script>

<template>
  <section class="pipeline" aria-label="How EVStream works">
    <div class="stage">
      <div class="stage-head">
        <span class="step">01</span>
        <h3>Scrapers</h3>
      </div>
      <p>One microservice per bookmaker. Each one pulls prices and publishes every move.</p>
      <ul class="scrapers">
        <li v-for="b in bookies" :key="b.id">
          <span :key="scrapers[b.id].count" class="pulse" :style="{ '--c': `var(${b.color})` }" aria-hidden="true"></span>
          <span class="svc">scraper-{{ b.id }}</span>
          <span class="meta">{{ scrapers[b.id].count }} · {{ ago(scrapers[b.id].lastAt) }}</span>
        </li>
      </ul>
    </div>

    <div class="arrow" aria-hidden="true"><span :key="lastEvent?.id" class="packet"></span></div>

    <div class="stage">
      <div class="stage-head">
        <span class="step">02</span>
        <h3>Odds processor</h3>
      </div>
      <p>Merges the feeds, finds the best price for each runner and scores its yield.</p>
      <div class="pick">
        <div class="pick-label">Best value right now</div>
        <div class="pick-name">{{ topPick.runner.name }}</div>
        <div class="pick-line">
          {{ fmtOdds(topPick.odds) }} at {{ topPick.bookie.name }}
          <span class="yield" :class="{ pos: topPick.yield > 0 }">{{ fmtYield(topPick.yield) }}</span>
        </div>
      </div>
    </div>

    <div class="arrow" aria-hidden="true"><span :key="lastEvent?.id" class="packet late"></span></div>

    <div class="stage">
      <div class="stage-head">
        <span class="step">03</span>
        <h3>GraphQL API</h3>
      </div>
      <p>Pushes each change to the app over a subscription, so the board never refreshes.</p>
      <div class="code">
        <div class="code-label">subscription oddsMoved</div>
        <pre :key="lastEvent?.id" class="payload">{{ payload }}</pre>
      </div>
    </div>

    <div class="arrow" aria-hidden="true"></div>

    <div class="stage">
      <div class="stage-head">
        <span class="step">04</span>
        <h3>Supabase</h3>
      </div>
      <p>Keeps users, saved state and bets. Place a bet on the board and it lands here.</p>
      <div class="table-box">
        <div class="code-label">public.bets · {{ bets.length }} {{ bets.length === 1 ? 'row' : 'rows' }}</div>
        <div v-if="lastBet" :key="bets.length" class="row-new">
          {{ lastBet.runner }} · {{ fmtOdds(lastBet.odds) }} · {{ dollars(lastBet.stake) }}
        </div>
        <div v-else class="empty">No bets yet</div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.pipeline {
  padding: 20px;
  border: 1px dashed var(--accent);
  border-radius: var(--radius-lg);
  background: var(--surface);
  display: grid;
  grid-template-columns: 1.15fr 24px 1fr 24px 1fr 24px 1fr;
  align-items: stretch;
  gap: 8px;
}
.stage {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.stage-head {
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.step {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--accent);
}
h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
}
p {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-muted);
}
.scrapers {
  margin: 4px 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.scrapers li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 11px;
}
.pulse {
  width: 8px;
  height: 8px;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--c);
  animation: pulse 0.9s ease-out;
}
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--c) 60%, transparent);
  }
  100% {
    box-shadow: 0 0 0 8px transparent;
  }
}
.svc {
  color: var(--text);
  white-space: nowrap;
}
.meta {
  margin-left: auto;
  color: var(--text-subtle);
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.arrow {
  position: relative;
  align-self: center;
  height: 1px;
  background: var(--border-dashed);
  overflow: visible;
}
.arrow::after {
  content: '';
  position: absolute;
  right: 0;
  top: -3px;
  border: 3.5px solid transparent;
  border-left: 5px solid var(--border-dashed);
  border-right: 0;
}
.packet {
  position: absolute;
  top: -2.5px;
  left: 0;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  opacity: 0;
  animation: travel 0.5s ease-in;
}
.packet.late {
  animation-delay: 0.25s;
}
@keyframes travel {
  0% {
    opacity: 1;
    transform: translateX(0);
  }
  100% {
    opacity: 0;
    transform: translateX(18px);
  }
}
.pick,
.code,
.table-box {
  margin-top: 4px;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface-muted);
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.pick-label,
.code-label {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-subtle);
}
.pick-name {
  font-size: 14px;
  font-weight: 600;
}
.pick-line {
  font-size: 13px;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}
.yield {
  margin-left: 4px;
  font-weight: 600;
  color: var(--text-muted);
}
.yield.pos {
  color: var(--status-confirmed);
}
.payload {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 11px;
  line-height: 1.5;
  color: var(--text);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  animation: blink 0.8s ease-out;
}
.row-new {
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  padding: 4px 6px;
  border-radius: 6px;
  animation: blink 1.6s ease-out;
}
@keyframes blink {
  0% {
    background: var(--accent-soft);
  }
  100% {
    background: transparent;
  }
}
.empty {
  font-size: 12px;
  color: var(--text-subtle);
}
@media (max-width: 1180px) {
  .pipeline {
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }
  .arrow {
    display: none;
  }
}
@media (max-width: 640px) {
  .pipeline {
    grid-template-columns: 1fr;
  }
}
@media (prefers-reduced-motion: reduce) {
  .pulse,
  .packet,
  .payload,
  .row-new {
    animation: none;
  }
}
</style>
