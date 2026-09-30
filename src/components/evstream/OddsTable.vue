<script setup>
import { computed } from 'vue'
import { fmtOdds } from './odds'

const props = defineProps({
  runners: { type: Array, required: true },
  bookies: { type: Array, required: true },
  prices: { type: Object, required: true },
  yields: { type: Object, required: true },
  selected: { type: Object, default: null },
  showStack: { type: Boolean, default: false },
})
const emit = defineEmits(['select'])

const bestFor = (runnerId) => Math.max(...props.bookies.map((b) => props.prices[runnerId][b.id].odds))

// Market percentage: the book's total implied probability. Over 100% is the bookie's margin.
const markets = computed(() =>
  props.bookies.map((b) => props.runners.reduce((sum, r) => sum + 100 / props.prices[r.id][b.id].odds, 0).toFixed(1)),
)

const change = (cell) => {
  const pct = ((cell.odds - cell.open) / cell.open) * 100
  if (Math.abs(pct) < 0.05) return '0.0%'
  return `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%`
}

const fmtYield = (y) => `${y > 0 ? '+' : ''}${y.toFixed(1)}%`

const isSelected = (r, b) => props.selected?.runner.id === r.id && props.selected?.bookie.id === b.id
</script>

<template>
  <div class="scroll" :class="{ stack: showStack }">
    <table>
      <thead>
        <tr>
          <th class="runner-col" scope="col">Runner</th>
          <th scope="col" class="num">Open</th>
          <th scope="col" class="num">
            Best
            <span v-if="showStack" class="tag">processor</span>
          </th>
          <th scope="col" class="num" title="Best price against the fair price, with the bookies' margin removed">
            Yield
            <span v-if="showStack" class="tag">processor</span>
          </th>
          <th v-for="b in bookies" :key="b.id" scope="col" class="num">
            <span class="bookie">
              <span class="badge" :style="{ '--c': `var(${b.color})` }" aria-hidden="true">{{ b.initials }}</span>
              {{ b.name }}
            </span>
            <span v-if="showStack" class="tag">scraper-{{ b.id }}</span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in runners" :key="r.id">
          <th scope="row" class="runner-col">
            <div class="runner">
              <span
                class="silk"
                :style="{ '--a': `var(${r.silk[0]})`, '--b': `var(${r.silk[1]})` }"
                aria-hidden="true"
              ></span>
              <span class="no">{{ r.number }}</span>
              <span class="who">
                <span class="name">{{ r.name }}</span>
                <span class="sub">{{ r.jockey }} · B{{ r.barrier }}</span>
              </span>
            </div>
          </th>
          <td class="num static">{{ fmtOdds(r.open) }}</td>
          <td class="num static best-val">{{ fmtOdds(bestFor(r.id)) }}</td>
          <td class="num yield" :class="{ pos: yields[r.id] > 0 }">{{ fmtYield(yields[r.id]) }}</td>
          <td v-for="b in bookies" :key="b.id" class="cell-td">
            <button
              type="button"
              class="cell"
              :class="[
                prices[r.id][b.id].dir,
                { best: prices[r.id][b.id].odds === bestFor(r.id), selected: isSelected(r, b) },
              ]"
              :aria-label="`Bet ${r.name} at ${fmtOdds(prices[r.id][b.id].odds)} with ${b.name}`"
              @click="emit('select', { runner: r, bookie: b })"
            >
              <span :key="prices[r.id][b.id].flashId" class="flash" aria-hidden="true"></span>
              <span class="odds">
                {{ fmtOdds(prices[r.id][b.id].odds) }}
                <span v-if="prices[r.id][b.id].dir" class="arrow" aria-hidden="true">{{
                  prices[r.id][b.id].dir === 'up' ? '▲' : '▼'
                }}</span>
              </span>
              <span class="delta">{{ change(prices[r.id][b.id]) }}</span>
            </button>
          </td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <th scope="row" class="runner-col foot-label">Market</th>
          <td></td>
          <td></td>
          <td></td>
          <td v-for="(m, i) in markets" :key="bookies[i].id" class="num market">{{ m }}%</td>
        </tr>
      </tfoot>
    </table>
  </div>
</template>

<style scoped>
.scroll {
  overflow-x: auto;
}
table {
  width: 100%;
  background: var(--ev-surface);
  min-width: 840px;
  border-collapse: collapse;
  font-size: 14px;
}
th,
td {
  padding: 6px 8px;
  text-align: left;
}
thead th {
  padding: 12px 8px;
  font-size: 11px;
  font-weight: 600;
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-subtle);
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}
thead th:first-child,
tbody th,
tfoot th {
  padding-left: 20px;
}
thead th:last-child,
tbody td:last-child,
tfoot td:last-child {
  padding-right: 20px;
}
.num {
  text-align: center;
}
tbody tr + tr {
  border-top: 1px solid var(--border-soft);
}
.bookie {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  text-transform: none;
  letter-spacing: 0;
  font-family: var(--font);
  font-size: 13px;
  color: var(--text);
}
.badge {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  background: var(--c);
  color: var(--surface);
  font-size: 11px;
  font-weight: 700;
  display: grid;
  place-items: center;
}
.runner-col {
  width: 240px;
  font-weight: 400;
}
.runner {
  display: flex;
  align-items: center;
  gap: 10px;
}
.silk {
  width: 26px;
  height: 26px;
  flex-shrink: 0;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: conic-gradient(var(--a) 0 25%, var(--b) 0 50%, var(--a) 0 75%, var(--b) 0);
}
.no {
  width: 22px;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-muted);
  text-align: right;
}
.who {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.name {
  font-weight: 600;
  white-space: nowrap;
}
.sub {
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
}
.static {
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}
.yield {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-subtle);
}
.yield.pos {
  color: var(--status-confirmed);
  font-weight: 600;
}
.tag {
  display: block;
  width: max-content;
  margin: 4px auto 0;
  padding: 1px 6px;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 10px;
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0;
}
.stack thead th {
  vertical-align: top;
}
.best-val {
  color: var(--text);
  font-weight: 600;
}
.cell-td {
  padding: 4px;
}
.cell {
  position: relative;
  width: 100%;
  min-width: 88px;
  height: 48px;
  padding: 0 8px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--ev-text);
  cursor: pointer;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  transition: border-color 0.2s;
}
.cell:hover {
  background: var(--hover);
  border-color: var(--border-dashed);
}
.cell.best {
  border-color: color-mix(in srgb, var(--accent) 45%, transparent);
}
.cell.selected {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px var(--accent-soft);
}
.flash {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0;
}
.cell.up .flash {
  background: var(--status-confirmed);
  animation: flash 1.4s ease-out;
}
.cell.down .flash {
  background: var(--danger);
  animation: flash 1.4s ease-out;
}
@keyframes flash {
  0% {
    opacity: 0.28;
  }
  100% {
    opacity: 0;
  }
}
.odds {
  position: relative;
  font-size: 15px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.cell.up .odds,
.cell.up .delta {
  color: var(--status-confirmed);
}
.cell.down .odds,
.cell.down .delta {
  color: var(--danger);
}
.arrow {
  font-size: 9px;
}
.delta {
  position: relative;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-subtle);
}
tfoot tr {
  border-top: 1px solid var(--border);
  background: var(--surface-muted);
}
tfoot th,
tfoot td {
  padding-top: 12px;
  padding-bottom: 12px;
}
.foot-label {
  font-size: 11px;
  font-weight: 600;
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-subtle);
}
.market {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-muted);
}
@media (prefers-reduced-motion: reduce) {
  .cell.up .flash,
  .cell.down .flash {
    animation: none;
  }
}
</style>
