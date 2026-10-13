<script setup>
import { computed, ref } from 'vue'
import { shipped } from '@/data/atCapacity'

const parse = (ym) => ym.split('-').map(Number)
const [fromY, fromM] = parse(shipped.from)
// Months since the start of the range, so '2025-12' is 1 when the range starts in Nov 2025.
const monthIndex = (ym) => {
  const [y, m] = parse(ym)
  return (y - fromY) * 12 + (m - fromM)
}
const span = monthIndex(shipped.to) + 1

const monthDate = (i) => new Date(fromY, fromM - 1 + i, 1)
// Year shown under the first month and under every January.
const months = Array.from({ length: span }, (_, i) => {
  const d = monthDate(i)
  return {
    key: i,
    label: d.toLocaleDateString('en-US', { month: 'short' }),
    year: i === 0 || d.getMonth() === 0 ? String(d.getFullYear()) : '',
  }
})

const short = (ym) => monthDate(monthIndex(ym)).toLocaleDateString('en-US', { month: 'short' })
const year = (ym) => parse(ym)[0]
const period = (item) =>
  year(item.start) === year(item.end)
    ? `${short(item.start)} – ${short(item.end)} ${year(item.end)}`
    : `${short(item.start)} ${year(item.start)} – ${short(item.end)} ${year(item.end)}`
const range = period({ start: shipped.from, end: shipped.to })

const bars = shipped.items.map((item) => {
  const start = monthIndex(item.start)
  const months = monthIndex(item.end) - start + 1
  return { ...item, left: `${(start / span) * 100}%`, width: `${(months / span) * 100}%` }
})

const selectedId = ref(bars[0].id)
const current = computed(() => bars.find((b) => b.id === selectedId.value))
</script>

<template>
  <section class="card" aria-labelledby="shipped-title">
    <header class="top">
      <h2 id="shipped-title">What I shipped</h2>
      <span class="meta">{{ shipped.commits }} · {{ range }}</span>
    </header>

    <div class="chart">
      <div class="axis" aria-hidden="true">
        <span class="hint">Pick a row</span>
        <div class="months" :style="{ '--span': span }">
          <span v-for="m in months" :key="m.key" class="month">
            {{ m.label }}<small v-if="m.year">{{ m.year }}</small>
          </span>
        </div>
      </div>

      <button
        v-for="bar in bars"
        :key="bar.id"
        type="button"
        class="lane"
        :class="{ active: bar.id === selectedId }"
        :aria-pressed="bar.id === selectedId"
        aria-controls="shipped-detail"
        @click="selectedId = bar.id"
      >
        <span class="name">
          {{ bar.name }}
          <span v-if="bar.status" class="tag">{{ bar.status }}</span>
        </span>
        <span class="track" :style="{ '--span': span }">
          <span class="bar" :class="{ ongoing: bar.status }" :style="{ left: bar.left, width: bar.width }">
            <span class="sr-only">{{ period(bar) }}</span>
          </span>
        </span>
      </button>
    </div>

    <div id="shipped-detail" class="detail" aria-live="polite">
      <div class="detail-head">
        <h3>{{ current.title }}</h3>
        <span class="period">{{ period(current) }}</span>
      </div>
      <p class="result">{{ current.result }}</p>
      <ul class="chips" aria-label="Highlights">
        <li v-for="h in current.highlights" :key="h">{{ h }}</li>
      </ul>
      <div class="tech">{{ current.tech.join(' · ') }}</div>
    </div>

    <footer class="also">
      <span class="also-label">Also shipped</span>
      <ul class="chips small">
        <li v-for="a in shipped.also" :key="a">{{ a }}</li>
      </ul>
    </footer>
  </section>
</template>

<style scoped>
.card {
  --label-w: 190px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
}
.top {
  padding: 14px 20px;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 4px 16px;
  flex-wrap: wrap;
  background: var(--surface-muted);
  border-bottom: 1px solid var(--border);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}
h2 {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.01em;
}
.meta,
.hint,
.month,
.period,
.tech,
.also-label {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-muted);
}

/* Chart: a label column, then a track split into one column per month. */
.chart {
  padding: 16px 20px 8px;
  display: flex;
  flex-direction: column;
}
.axis,
.lane {
  display: grid;
  grid-template-columns: var(--label-w) minmax(0, 1fr);
  align-items: center;
  gap: 16px;
}
.axis {
  padding: 0 8px 8px;
}
.hint {
  font-size: 11px;
  color: var(--text-subtle);
}
.months {
  display: grid;
  grid-template-columns: repeat(var(--span), minmax(0, 1fr));
}
.month {
  display: flex;
  flex-direction: column;
  font-size: 11px;
  line-height: 1.3;
}
.month small {
  font-size: 10px;
  color: var(--text-subtle);
}
.lane {
  width: 100%;
  padding: 8px;
  border: 0;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text);
  text-align: left;
  cursor: pointer;
}
.lane:hover {
  background: var(--hover);
}
.lane.active {
  background: var(--active);
}
.name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
}
.lane.active .name {
  color: var(--accent);
  font-weight: 600;
}
.tag {
  padding: 1px 6px;
  border-radius: 999px;
  background: var(--warning-soft);
  color: var(--warning);
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 500;
}
.track {
  position: relative;
  height: 22px;
  /* Faint line at the start of every month. */
  background-image: linear-gradient(to right, var(--border-soft) 1px, transparent 1px);
  background-size: calc(100% / var(--span)) 100%;
}
.bar {
  position: absolute;
  top: 3px;
  bottom: 3px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--accent) 35%, var(--surface));
  transition: background 0.15s;
}
.lane:hover .bar {
  background: color-mix(in srgb, var(--accent) 55%, var(--surface));
}
.lane.active .bar {
  background: var(--accent);
}
/* Unreleased work: striped and open-ended. */
.bar.ongoing,
.lane:hover .bar.ongoing {
  background: repeating-linear-gradient(
    -45deg,
    color-mix(in srgb, var(--accent) 35%, var(--surface)) 0 5px,
    var(--surface) 5px 10px
  );
  outline: 1px dashed var(--accent);
  outline-offset: -1px;
}
.lane.active .bar.ongoing {
  background: repeating-linear-gradient(-45deg, var(--accent) 0 5px, color-mix(in srgb, var(--accent) 55%, var(--surface)) 5px 10px);
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

/* Detail for the selected row. */
.detail {
  margin: 8px 20px 0;
  padding: 16px 0 20px;
  border-top: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.detail-head {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 4px 12px;
}
h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
}
.result {
  margin: 0;
  font-size: 18px;
  line-height: 1.4;
  letter-spacing: -0.01em;
}
.chips {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.chips li {
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 13px;
  font-weight: 500;
}
.chips.small li {
  padding: 3px 9px;
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-muted);
  font-size: 12px;
}

.also {
  padding: 14px 20px;
  display: flex;
  align-items: baseline;
  gap: 8px 16px;
  background: var(--surface-muted);
  border-top: 1px solid var(--border);
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
}
.also-label {
  flex: none;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-size: 11px;
}

@media (max-width: 640px) {
  .chart {
    padding: 12px 12px 4px;
  }
  /* Label sits above its bar. */
  .axis,
  .lane {
    grid-template-columns: minmax(0, 1fr);
    gap: 6px;
  }
  .hint {
    display: none;
  }
  /* Every other month, so the labels fit. */
  .month:nth-child(even) {
    visibility: hidden;
  }
  .detail {
    margin: 4px 12px 0;
  }
  .result {
    font-size: 16px;
  }
  .also {
    flex-direction: column;
    padding: 14px 12px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .bar {
    transition: none;
  }
}
</style>
