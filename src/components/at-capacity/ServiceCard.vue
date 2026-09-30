<script setup>
import { computed } from 'vue'
import { adModes, endpoints, pauseReason } from '@/data/atCapacity'
import { addDays, startOfDay } from '@/utils/dates'

const props = defineProps({
  service: { type: Object, required: true },
  showApi: { type: Boolean, default: false },
})

const RING_R = 34
const RING_LEN = 2 * Math.PI * RING_R

const today = startOfDay(new Date())

const days = computed(() =>
  props.service.days.map(([booked, capacity], i) => {
    const date = addDays(today, i)
    const reason = pauseReason(props.service, booked, capacity)
    return {
      key: i,
      dow: date.toLocaleDateString('en-US', { weekday: 'short' }),
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      booked,
      capacity,
      paused: Boolean(reason),
      tip: reason ?? `Ads running. ${booked} of ${capacity} jobs booked.`,
    }
  }),
)

const percent = computed(() => {
  const booked = props.service.days.reduce((sum, [b]) => sum + b, 0)
  const capacity = props.service.days.reduce((sum, [, c]) => sum + c, 0)
  return capacity ? Math.round((booked / capacity) * 100) : 0
})

const pausedCount = computed(() => days.value.filter((d) => d.paused).length)
const ringOffset = computed(() => RING_LEN * (1 - Math.min(percent.value, 100) / 100))
const adsOff = computed(() => props.service.ads === 'always-off')
const api = computed(() => endpoints(props.service.id))
</script>

<template>
  <section class="card" :class="{ 'show-api': showApi }">
    <header class="top">
      <h2>{{ service.name }}</h2>
      <div class="zone">
      <span v-if="showApi" class="endpoint"><b>GET</b> {{ api.settings }}</span>
      <div class="settings">
        <div class="setting" :class="{ off: adsOff }">
          <svg v-if="adsOff" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6M9 9l6 6" /></svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><path d="m8 12 3 3 5-6" /></svg>
          <div>
            <div class="setting-name">Ads {{ adsOff ? 'Off' : 'On' }}</div>
            <div class="setting-value">{{ adModes[service.ads] }}</div>
          </div>
        </div>
        <div class="setting">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><path d="m8 12 3 3 5-6" /></svg>
          <div>
            <div class="setting-name">Availability On</div>
            <div class="setting-value">{{ service.availabilityHours }} {{ service.availabilityHours === 1 ? 'hour' : 'hours' }}</div>
          </div>
        </div>
      </div>
      </div>
    </header>

    <div class="body">
      <div class="summary zone">
        <span v-if="showApi" class="endpoint">
          <b>GET</b> <template v-for="(part, i) in api.utilization.split('/')" :key="i">{{ i ? '/' : '' }}<wbr />{{ part }}</template>
        </span>
        <div class="ring" :class="{ high: percent >= 90 }">
          <svg viewBox="0 0 80 80" aria-hidden="true">
            <circle class="track" cx="40" cy="40" :r="RING_R" />
            <circle
              class="fill"
              cx="40"
              cy="40"
              :r="RING_R"
              :stroke-dasharray="RING_LEN"
              :stroke-dashoffset="ringOffset"
            />
          </svg>
          <div class="ring-label">
            <strong>{{ percent }}%</strong>
            <span>Booked</span>
          </div>
        </div>
        <div class="paused-count">{{ pausedCount }} of 7 days paused</div>
      </div>

      <div class="days-zone zone">
      <span v-if="showApi" class="endpoint"><b>GET</b> {{ api.capacity }}</span>
      <ol class="days" :aria-label="`${service.name}, next 7 days`">
        <li
          v-for="d in days"
          :key="d.key"
          class="day"
          :class="{ paused: d.paused }"
          tabindex="0"
          :aria-describedby="`${service.id}-tip-${d.key}`"
        >
          <div class="day-main">
            <span class="dow">{{ d.dow }}</span>
            <span class="date">{{ d.date }}</span>
            <span class="count" :aria-label="`${d.booked} booked of ${d.capacity}`">{{ d.booked }} / {{ d.capacity }}</span>
          </div>
          <div class="status">{{ d.paused ? 'Paused' : 'Ads on' }}</div>
          <div :id="`${service.id}-tip-${d.key}`" role="tooltip" class="tip">
            {{ d.tip }}
            <span v-if="showApi" class="tip-endpoint"><b>GET</b> {{ api.pauseReasons }}</span>
          </div>
        </li>
      </ol>
      </div>
    </div>
  </section>
</template>

<style scoped>
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
}
.top {
  padding: 14px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
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
.settings {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}
.setting {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--accent);
}
.setting.off {
  color: var(--text-subtle);
}
.setting-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}
.setting.off .setting-name {
  color: var(--text-subtle);
}
.setting-value {
  font-size: 12px;
  color: var(--text-muted);
  font-family: var(--font-mono);
}
.body {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 24px;
}
.summary {
  flex: none;
  width: 150px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.ring {
  position: relative;
  width: 96px;
  height: 96px;
}
.ring svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}
.ring circle {
  fill: none;
  stroke-width: 7;
}
.ring .track {
  stroke: var(--border-soft);
}
.ring .fill {
  stroke: var(--accent);
  stroke-linecap: round;
}
.ring.high .fill {
  stroke: var(--status-pending);
}
.ring-label {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.ring-label strong {
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.02em;
}
.ring-label span {
  font-size: 11px;
  color: var(--text-muted);
  font-family: var(--font-mono);
}
.paused-count {
  font-size: 12px;
  color: var(--text-muted);
  text-align: center;
}
.zone {
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-radius: var(--radius-sm);
  transition: outline-color 0.15s;
  outline: 1px dashed transparent;
  outline-offset: 6px;
}
.show-api .zone {
  outline-color: var(--accent);
}
.endpoint {
  align-self: flex-start;
  max-width: 100%;
  padding: 2px 8px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--accent);
  background: var(--accent-soft);
  border-radius: 999px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.endpoint b,
.tip-endpoint b {
  font-weight: 700;
}
.summary .endpoint {
  align-self: center;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  text-align: center;
  white-space: normal;
  overflow-wrap: anywhere;
}
.tip-endpoint {
  display: block;
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px solid var(--text-muted);
  font-family: var(--font-mono);
  font-size: 11px;
  word-break: break-all;
}
.days-zone {
  flex: 1;
  min-width: 0;
}
.days {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 10px;
}
.day {
  position: relative;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  cursor: default;
}
.day.paused {
  background: var(--hover);
  border-style: dashed;
  border-color: var(--border-dashed);
}
.day.paused .dow,
.day.paused .count {
  color: var(--text-muted);
}
.day-main {
  padding: 10px 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}
.dow {
  font-size: 13px;
  font-weight: 500;
}
.date {
  font-size: 12px;
  color: var(--text-muted);
  font-family: var(--font-mono);
}
.count {
  margin-top: 4px;
  font-size: 17px;
  font-weight: 600;
  white-space: nowrap;
}
.status {
  padding: 5px 4px;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  color: var(--surface);
  background: var(--accent);
  border-radius: 0 0 calc(var(--radius-sm) - 1px) calc(var(--radius-sm) - 1px);
}
.day.paused .status {
  color: var(--text-muted);
  background: var(--border);
}
.tip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  z-index: 10;
  width: 200px;
  padding: 8px 10px;
  font-size: 12px;
  line-height: 1.4;
  color: var(--surface);
  background: var(--text);
  border-radius: var(--radius-sm);
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  transform: translate(-50%, 4px);
  transition: opacity 0.15s, transform 0.15s, visibility 0.15s;
}
.day:first-child .tip {
  left: 0;
  transform: translate(0, 4px);
}
.day:last-child .tip {
  left: auto;
  right: 0;
  transform: translate(0, 4px);
}
.day:hover .tip,
.day:focus-visible .tip {
  opacity: 1;
  visibility: visible;
  transform: translate(-50%, 0);
}
.day:first-child:hover .tip,
.day:first-child:focus-visible .tip,
.day:last-child:hover .tip,
.day:last-child:focus-visible .tip {
  transform: none;
}
@media (max-width: 900px) {
  .body {
    flex-direction: column;
    align-items: stretch;
  }
  .summary {
    width: auto;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    gap: 16px;
  }
  .days {
    grid-template-columns: repeat(auto-fill, minmax(84px, 1fr));
  }
  .day .tip,
  .day:first-child .tip,
  .day:last-child .tip {
    left: 50%;
    right: auto;
    transform: translate(-50%, 4px);
  }
  .day:hover .tip,
  .day:focus-visible .tip,
  .day:first-child:hover .tip,
  .day:first-child:focus-visible .tip,
  .day:last-child:hover .tip,
  .day:last-child:focus-visible .tip {
    transform: translate(-50%, 0);
  }
}
/* Fixed 3 columns so tips on the outer columns can anchor to the card edge. */
@media (max-width: 640px) {
  .days {
    grid-template-columns: repeat(3, 1fr);
  }
  .day:nth-child(3n + 1) .tip {
    left: 0;
    transform: translate(0, 4px);
  }
  .day:nth-child(3n) .tip {
    left: auto;
    right: 0;
    transform: translate(0, 4px);
  }
  .day:nth-child(3n + 1):hover .tip,
  .day:nth-child(3n + 1):focus-visible .tip,
  .day:nth-child(3n):hover .tip,
  .day:nth-child(3n):focus-visible .tip {
    transform: none;
  }
}
</style>
