<script setup>
import { computed } from 'vue'
import { addDays, dayDiff, isSameDay } from '@/utils/dates'

const DAYS = 7

const props = defineProps({
  weekStart: { type: Date, required: true },
  rooms: { type: Array, required: true },
  bookings: { type: Array, required: true },
  selectedId: { type: String, default: null },
})
const emit = defineEmits(['select', 'prev', 'next', 'today'])

const today = new Date()
const days = computed(() => Array.from({ length: DAYS }, (_, i) => addDays(props.weekStart, i)))

const rangeLabel = computed(() => {
  const end = days.value[DAYS - 1]
  const fmt = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${fmt(props.weekStart)} - ${fmt(end)}, ${end.getFullYear()}`
})

// Bars start mid-cell on check-in (afternoon) and end mid-cell on check-out (noon).
const barsByRoom = computed(() => {
  const map = {}
  for (const b of props.bookings) {
    const start = dayDiff(props.weekStart, b.checkInDate) + 0.5
    const end = dayDiff(props.weekStart, b.checkOutDate) + 0.5
    if (end <= 0 || start >= DAYS) continue
    const from = Math.max(start, 0)
    const to = Math.min(end, DAYS)
    ;(map[b.room] ||= []).push({
      booking: b,
      clipStart: start < 0,
      clipEnd: end > DAYS,
      style: {
        left: `calc(${(from / DAYS) * 100}% + 2px)`,
        width: `calc(${((to - from) / DAYS) * 100}% - 4px)`,
      },
    })
  }
  return map
})
</script>

<template>
  <div class="calendar">
    <div class="nav">
      <div class="nav-center">
        <button class="icon-btn" aria-label="Previous week" @click="emit('prev')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6" /></svg>
        </button>
        <h2>{{ rangeLabel }}</h2>
        <button class="icon-btn" aria-label="Next week" @click="emit('next')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6" /></svg>
        </button>
      </div>
      <button class="today-btn" @click="emit('today')">Today</button>
    </div>

    <div class="scroll">
      <div class="grid">
        <div class="row head">
          <div class="room-cell head-cell">Room</div>
          <div class="track days">
            <div
              v-for="d in days"
              :key="d.toISOString()"
              class="day"
              :class="{ today: isSameDay(d, today) }"
            >
              <span class="dow">{{ d.toLocaleDateString('en-US', { weekday: 'short' }) }}</span>
              <span class="date">{{ d.getMonth() + 1 }}/{{ d.getDate() }}</span>
            </div>
          </div>
        </div>

        <div v-for="room in rooms" :key="room.id" class="row">
          <div class="room-cell">
            <span class="room-id">{{ room.id }}</span>
            <span class="room-type">{{ room.type }}</span>
          </div>
          <div class="track">
            <div class="cells">
              <div v-for="d in days" :key="d.toISOString()" :class="{ today: isSameDay(d, today) }"></div>
            </div>
            <button
              v-for="bar in barsByRoom[room.id]"
              :key="bar.booking.id"
              class="bar"
              :class="[
                bar.booking.status,
                {
                  'clip-start': bar.clipStart,
                  'clip-end': bar.clipEnd,
                  selected: bar.booking.id === selectedId,
                  fresh: bar.booking.fresh,
                  brand: bar.booking.brand,
                },
              ]"
              :style="bar.style"
              :title="bar.booking.label"
              @click="emit('select', bar.booking)"
            >
              <span>{{ bar.booking.label }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.calendar {
  background: var(--surface);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}
.nav {
  position: relative;
  height: 64px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  background: var(--surface-muted);
  border-bottom: 1px solid var(--border);
}
.nav-center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 16px;
}
h2 {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.01em;
  white-space: nowrap;
}
.icon-btn,
.today-btn {
  border: 0;
  background: none;
  color: var(--accent);
  cursor: pointer;
  border-radius: var(--radius-sm);
}
.icon-btn {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
}
.today-btn {
  height: 32px;
  padding: 0 10px;
  font-size: 14px;
  font-weight: 500;
}
.icon-btn:hover,
.today-btn:hover {
  background: var(--accent-soft);
}
.scroll {
  overflow-x: auto;
}
.grid {
  min-width: 760px;
}
.row {
  display: grid;
  grid-template-columns: 160px 1fr;
  border-bottom: 1px solid var(--border-soft);
}
.row:last-child {
  border-bottom: 0;
}
.room-cell {
  padding: 12px 16px;
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
}
.room-id {
  font-size: 14px;
  font-weight: 600;
}
.room-type {
  font-size: 12px;
  color: var(--text-muted);
}
.head {
  background: var(--surface-muted);
  border-bottom: 1px solid var(--border);
}
.head-cell {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-muted);
  align-items: center;
}
.days,
.cells {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}
.day {
  padding: 10px 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  border-left: 1px solid var(--border-soft);
}
.day:first-child,
.cells > div:first-child {
  border-left: 0;
}
.dow {
  font-size: 12px;
  color: var(--text-muted);
  font-family: var(--font-mono);
}
.date {
  font-size: 14px;
  font-weight: 500;
}
.day.today .date {
  color: var(--accent);
  font-weight: 700;
}
.today {
  background: var(--today);
}
.track {
  position: relative;
  min-height: 56px;
}
.cells {
  position: absolute;
  inset: 0;
}
.cells > div {
  border-left: 1px solid var(--border-soft);
}
.bar {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  height: 30px;
  padding: 0 14px 0 14px;
  border: 0;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  clip-path: polygon(0 0, calc(100% - 9px) 0, 100% 50%, calc(100% - 9px) 100%, 0 100%, 7px 50%);
  transition: filter 0.15s, transform 0.15s;
}
.bar span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.bar.clip-start {
  padding-left: 10px;
  clip-path: polygon(0 0, calc(100% - 9px) 0, 100% 50%, calc(100% - 9px) 100%, 0 100%);
}
.bar.clip-end {
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%, 7px 50%);
}
.bar.clip-start.clip-end {
  clip-path: none;
}
.bar:hover,
.bar.selected {
  filter: brightness(1.12);
}
.bar.selected {
  transform: translateY(-50%) scaleY(1.08);
}
.bar.checked-in {
  background: var(--status-checked-in);
}
.bar.confirmed {
  background: var(--status-confirmed);
}
.bar.pending {
  background: var(--status-pending);
}
.bar.brand {
  background: var(--brand-go-overbooked);
  color: #fff;
}
/* A booking that just arrived from an OTA. */
.bar.fresh {
  animation: arrive 1.2s ease-out;
}
@keyframes arrive {
  0% {
    opacity: 0;
    filter: brightness(1.6);
  }
  30% {
    opacity: 1;
  }
  100% {
    filter: brightness(1);
  }
}
@media (prefers-reduced-motion: reduce) {
  .bar.fresh {
    animation: none;
  }
}
@media (max-width: 700px) {
  .nav {
    justify-content: space-between;
  }
  .nav-center {
    position: static;
    transform: none;
    gap: 4px;
  }
  h2 {
    font-size: 15px;
  }
  /* Narrow sticky room column so more days fit while swiping. */
  .grid {
    min-width: 600px;
  }
  .row {
    grid-template-columns: 96px 1fr;
  }
  .room-cell {
    position: sticky;
    left: 0;
    z-index: 2;
    padding: 10px 12px;
    background: var(--surface);
  }
  .head .room-cell {
    background: var(--surface-muted);
  }
}
</style>
