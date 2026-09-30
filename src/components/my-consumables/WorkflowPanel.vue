<script setup>
import { statuses } from '@/data/myConsumables'

defineProps({
  counts: { type: Object, required: true },
  events: { type: Array, required: true },
})

// What the business asked for at each step, and what I built to answer it.
const stages = [
  {
    key: 'ordered',
    need: 'Special orders lived on paper notes and in people’s heads.',
    built: 'One list for every order, searchable by patient, product or order number.',
  },
  {
    key: 'confirmed',
    need: 'Nobody could tell when stock had actually arrived.',
    built: 'Confirming stamps the received date, so nobody has to type it.',
  },
  {
    key: 'packed',
    need: 'Insulin and biologics can’t sit on a warm shelf.',
    built: 'Cold-chain items are flagged in the row, the details and the driver screen.',
  },
  {
    key: 'dispatched',
    need: 'Participants at home need to know their delivery is on its way.',
    built: 'A route and drive time from the pharmacy. If routing is down, it falls back to an estimate instead of failing.',
  },
]
</script>

<template>
  <section class="workflow" aria-label="How the special orders workflow works">
    <div class="intro">
      <span class="label">The rule</span>
      Every status has exactly one next step, so staff never have to guess what to do with an order.
    </div>

    <div class="stages">
      <template v-for="(s, i) in stages" :key="s.key">
        <div v-if="i" class="arrow" aria-hidden="true"></div>
        <div class="stage">
          <div class="stage-head">
            <span class="step">0{{ i + 1 }}</span>
            <h3>{{ statuses[s.key].label }}</h3>
            <span :key="counts[s.key]" class="count" :style="{ '--c': `var(${statuses[s.key].color})` }">
              {{ counts[s.key] }}
            </span>
          </div>
          <div class="need">
            <span class="label">The need</span>
            <p>{{ s.need }}</p>
          </div>
          <div class="built">
            <span class="label">What I built</span>
            <p>{{ s.built }}</p>
          </div>
        </div>
      </template>
    </div>

    <div class="audit">
      <div class="audit-head">
        <span class="label">Audit trail</span>
        <span class="hint">Pharmacies need to show when each participant’s order moved and who moved it.</span>
      </div>
      <ol v-if="events.length" class="log">
        <li v-for="e in events.slice(0, 5)" :key="e.n" class="row-new">
          <span class="time">{{ e.time }}</span>
          <span class="id">{{ e.id }}</span>
          <span>
            {{ statuses[e.from].label }} → <strong>{{ statuses[e.to].label }}</strong>
            <template v-if="e.driver"> · {{ e.driver }}</template>
          </span>
          <span class="who">by you</span>
        </li>
      </ol>
      <div v-else class="empty">Click an action in the table and it’s logged here.</div>
    </div>
  </section>
</template>

<style scoped>
.workflow {
  padding: 20px;
  border: 1px dashed var(--accent);
  border-radius: var(--radius-lg);
  background: var(--surface);
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.intro {
  font-size: 14px;
  color: var(--text);
  display: flex;
  align-items: baseline;
  gap: 10px;
  flex-wrap: wrap;
}
.label {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.stages {
  display: grid;
  grid-template-columns: 1fr 24px 1fr 24px 1fr 24px 1fr;
  gap: 8px;
}
.stage {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
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
.count {
  margin-left: auto;
  min-width: 24px;
  height: 22px;
  padding: 0 7px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--c) 12%, transparent);
  color: var(--c);
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 600;
  display: grid;
  place-items: center;
  animation: pulse 0.9s ease-out;
}
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--c) 50%, transparent);
  }
  100% {
    box-shadow: 0 0 0 8px transparent;
  }
}
.need,
.built {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.need .label {
  color: var(--text-subtle);
}
.built {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface-muted);
}
p {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-muted);
}
.built p {
  color: var(--text);
}
.arrow {
  position: relative;
  align-self: center;
  height: 1px;
  background: var(--border-dashed);
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
.audit {
  padding-top: 16px;
  border-top: 1px solid var(--border-soft);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.audit-head {
  display: flex;
  align-items: baseline;
  gap: 10px;
  flex-wrap: wrap;
}
.hint {
  font-size: 13px;
  color: var(--text-muted);
}
.log {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.log li {
  padding: 6px 8px;
  border-radius: 6px;
  display: grid;
  grid-template-columns: 72px 72px 1fr auto;
  gap: 12px;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}
.time,
.id,
.who {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-subtle);
}
.id {
  color: var(--text);
}
.row-new {
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
  font-size: 13px;
  color: var(--text-subtle);
}
@media (max-width: 1180px) {
  .stages {
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }
  .arrow {
    display: none;
  }
}
@media (max-width: 640px) {
  .stages {
    grid-template-columns: 1fr;
  }
  .log li {
    grid-template-columns: auto 1fr;
  }
}
@media (prefers-reduced-motion: reduce) {
  .count,
  .row-new {
    animation: none;
  }
}
</style>
