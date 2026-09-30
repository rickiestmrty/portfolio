<script setup>
import { computed, ref } from 'vue'
import { engagementLabel, engagements, projects } from '@/data/projects'
import { addDays, dayDiff, formatRange, parseIso, startOfDay } from '@/utils/dates'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const WEEKDAYS = ['', 'Mon', '', 'Wed', '', 'Fri', '']

const today = startOfDay(new Date())

// Only work with dates shows up on the grid.
const ranges = projects
  .filter((p) => p.start)
  .map((p) => ({ ...p, from: parseIso(p.start), to: p.end ? parseIso(p.end) : today }))

const rank = (p) => engagements[p.engagement]?.rank ?? 0

const firstYear = Math.min(...ranges.map((r) => r.from.getFullYear()))
const years = Array.from({ length: today.getFullYear() - firstYear + 1 }, (_, i) => today.getFullYear() - i)
const year = ref(years[0])

// Main job first, so active[0] is the primary work that day.
const activeOn = (day) =>
  ranges
    .filter((r) => dayDiff(r.from, day) >= 0 && dayDiff(day, r.to) >= 0)
    .sort((a, b) => rank(a) - rank(b))

// A square takes the color of the primary work that day. Contract work and own products
// alongside the main job are listed in the tooltip rather than splitting the square.
const fill = (active) => (active.length ? `var(${active[0].color})` : null)

const describe = (p) => (engagementLabel(p) ? `${p.name} (${engagementLabel(p).toLowerCase()})` : p.name)

// Weeks start on Sunday, like GitHub. Days outside the year are blanks.
const weeks = computed(() => {
  const jan1 = new Date(year.value, 0, 1)
  const dec31 = new Date(year.value, 11, 31)
  const gridStart = addDays(jan1, -jan1.getDay())
  const count = Math.ceil((dayDiff(gridStart, dec31) + 1) / 7)

  return Array.from({ length: count }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const day = addDays(gridStart, w * 7 + d)
      if (day.getFullYear() !== year.value) return { key: `${w}-${d}`, blank: true }
      const future = dayDiff(today, day) > 0
      const active = future ? [] : activeOn(day)
      return { key: `${w}-${d}`, day, future, active, background: fill(active) }
    }),
  )
})

// Month label sits above the first week that contains the 1st of that month.
const monthLabels = computed(() =>
  weeks.value.map((week) => {
    const first = week.find((c) => !c.blank && c.day.getDate() === 1)
    return first ? MONTHS[first.day.getMonth()] : ''
  }),
)

const activeDays = computed(() => weeks.value.flat().filter((c) => c.active?.length).length)

const formatDay = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

const tooltip = ref(null)
const showTip = (cell, event) => {
  if (cell.blank || cell.future) return
  const box = event.currentTarget.getBoundingClientRect()
  const wrap = event.currentTarget.closest('.card').getBoundingClientRect()
  tooltip.value = {
    x: box.left - wrap.left + box.width / 2,
    y: box.top - wrap.top,
    date: formatDay(cell.day),
    label: cell.active.length ? cell.active[0].name : 'No work logged',
    also: cell.active.slice(1).map(describe).join(', '),
  }
}
</script>

<template>
  <section class="card">
    <div class="top">
      <div>
        <h2>{{ activeDays }} days building in {{ year }}</h2>
        <p>Every square is a day of work, colored by my main role that day.</p>
      </div>
      <div class="years" role="tablist" aria-label="Year">
        <button
          v-for="y in years"
          :key="y"
          type="button"
          role="tab"
          class="year"
          :class="{ selected: y === year }"
          :aria-selected="y === year"
          @click="year = y"
        >
          {{ y }}
        </button>
      </div>
    </div>

    <div class="scroll">
      <div class="grid" @mouseleave="tooltip = null">
        <div class="weekdays" aria-hidden="true">
          <span v-for="(d, i) in WEEKDAYS" :key="i">{{ d }}</span>
        </div>
        <div class="columns">
          <div class="months" aria-hidden="true">
            <span v-for="(m, i) in monthLabels" :key="i">{{ m }}</span>
          </div>
          <div class="weeks">
            <div v-for="(week, w) in weeks" :key="w" class="week">
              <span
                v-for="cell in week"
                :key="cell.key"
                class="cell"
                :class="{ blank: cell.blank, future: cell.future }"
                :style="cell.background ? { background: cell.background } : null"
                @mouseenter="showTip(cell, $event)"
              ></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="tooltip" class="tooltip" :style="{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }">
      <strong>{{ tooltip.label }}</strong> · {{ tooltip.date }}
      <div v-if="tooltip.also" class="tooltip-also">Also: {{ tooltip.also }}</div>
    </div>

    <ul class="legend">
      <li v-for="p in projects" :key="p.slug">
        <RouterLink :to="`/projects/${p.slug}`" class="legend-item">
          <span class="swatch" :style="{ background: `var(${p.color})` }"></span>
          <span class="legend-name">{{ p.name }}</span>
          <span v-if="engagementLabel(p)" class="legend-tag">{{ engagementLabel(p) }}</span>
          <span class="legend-meta">{{ p.start ? formatRange(p.start, p.end) : 'Dates TBD' }}</span>
        </RouterLink>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.card {
  position: relative;
  padding: 24px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}
.top p {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--text-muted);
}
.years {
  display: flex;
  gap: 4px;
  padding: 3px;
  background: var(--surface-muted);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
}
.year {
  padding: 4px 10px;
  border: 0;
  border-radius: 6px;
  background: none;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-muted);
  cursor: pointer;
}
.year:hover {
  background: var(--hover);
}
.year.selected {
  background: var(--surface);
  color: var(--text);
  box-shadow: 0 0 0 1px var(--border);
}
.scroll {
  overflow-x: auto;
}
.grid {
  --cell: 12px;
  --gap: 3px;
  display: flex;
  gap: 8px;
  width: max-content;
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--text-subtle);
}
.weekdays {
  display: grid;
  grid-template-rows: repeat(7, var(--cell));
  gap: var(--gap);
  padding-top: 20px;
}
.weekdays span {
  line-height: var(--cell);
}
.months {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: calc(var(--cell) + var(--gap));
  height: 20px;
}
.months span {
  white-space: nowrap;
}
.weeks {
  display: flex;
  gap: var(--gap);
}
.week {
  display: grid;
  grid-template-rows: repeat(7, var(--cell));
  gap: var(--gap);
}
.cell {
  width: var(--cell);
  height: var(--cell);
  border-radius: 3px;
  background: var(--border-soft);
}
.cell:not(.blank):not(.future):hover {
  outline: 1.5px solid var(--text);
  outline-offset: 1px;
}
.cell.blank {
  visibility: hidden;
}
.cell.future {
  background: var(--surface-muted);
  box-shadow: inset 0 0 0 1px var(--border-soft);
}
.tooltip {
  position: absolute;
  transform: translate(-50%, calc(-100% - 8px));
  padding: 6px 10px;
  border-radius: 6px;
  background: var(--text);
  color: var(--on-brand);
  font-size: 12px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 5;
}
.legend {
  margin: 0;
  padding: 16px 0 0;
  list-style: none;
  border-top: 1px solid var(--border-soft);
  display: flex;
  flex-wrap: wrap;
  gap: 8px 24px;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}
.legend-item:hover .legend-name {
  text-decoration: underline;
}
.swatch {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}
.legend-name {
  font-weight: 500;
}
.tooltip-also {
  margin-top: 2px;
  color: var(--on-brand-muted);
}
.legend-tag {
  padding: 1px 6px;
  border-radius: 999px;
  background: var(--active);
  font-size: 11px;
  color: var(--text-muted);
}
.legend-meta {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-subtle);
  white-space: nowrap;
}
.legend-tag,
.legend-name {
  white-space: nowrap;
}

/* Stack one project per row, with the dates under the name, so nothing wraps mid-range. */
@media (max-width: 768px) {
  .legend {
    flex-direction: column;
    gap: 12px;
  }
  .legend-item {
    flex-wrap: wrap;
    row-gap: 2px;
  }
  .legend-meta {
    flex-basis: 100%;
    padding-left: 20px;
  }
}
</style>
