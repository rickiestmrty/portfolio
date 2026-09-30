<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { channels, demoGuests } from '@/data/goOverbooked'
import { addDays, startOfDay } from '@/utils/dates'

const props = defineProps({
  rooms: { type: Array, required: true },
  bookings: { type: Array, required: true },
})
const emit = defineEmits(['booking'])

const STEP_MS = 380
const DAYS_AHEAD = 6

const today = startOfDay(new Date())
const iso = (offset) => {
  const d = addDays(today, offset)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
const shortDate = (offset) => addDays(today, offset).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
const rand = (n) => Math.floor(Math.random() * n)
const revision = () => `rev_${Math.random().toString(16).slice(2, 10)}`

const overlaps = (b, room, from, to) => b.room === room && b.checkIn < to && from < b.checkOut
const isFree = (room, from, to) => !props.bookings.some((b) => overlaps(b, room, from, to))

// Rooms of this type still free on every night in [from, to).
const freeOfType = (type, from, to) => props.rooms.filter((r) => r.type === type && isFree(r.id, from, to)).length

// Find a stay the channel could really have sold: a room type with a free room for those nights.
function pickStay() {
  const types = [...new Set(props.rooms.map((r) => r.type))]
  for (let tries = 0; tries < 40; tries++) {
    const checkIn = rand(DAYS_AHEAD - 1)
    const checkOut = Math.min(DAYS_AHEAD, checkIn + 1 + rand(3))
    const type = types[rand(types.length)]
    const room = props.rooms.find((r) => r.type === type && isFree(r.id, checkIn, checkOut))
    if (room) return { checkIn, checkOut, type, room }
  }
  return null
}

const last = ref(null) // the webhook being processed
const shown = ref(0) // how many processing steps have appeared
const seen = new Set() // revision ids already saved, for idempotency
const pulses = ref({}) // channel id -> { kind: 'in' | 'out', n }
const soldOut = ref(false)
let timers = []
let bookingNo = 10260

const clearTimers = () => {
  timers.forEach(clearTimeout)
  timers = []
}

function play(steps, onDone) {
  clearTimers()
  shown.value = 0
  steps.forEach((_, i) => timers.push(setTimeout(() => (shown.value = i + 1), STEP_MS * (i + 1))))
  timers.push(setTimeout(onDone, STEP_MS * steps.length))
}

const pulse = (id, kind) => (pulses.value = { ...pulses.value, [id]: { kind, n: (pulses.value[id]?.n ?? 0) + 1 } })

function receive(channel) {
  const stay = pickStay()
  if (!stay) {
    soldOut.value = true
    return
  }
  soldOut.value = false
  pulse(channel.id, 'in')

  const guest = demoGuests[rand(demoGuests.length)]
  const id = `GO-${++bookingNo}`
  const leftAfter = freeOfType(stay.type, stay.checkIn, stay.checkOut) - 1
  last.value = {
    duplicate: false,
    channel,
    stay,
    guest,
    id,
    leftAfter,
    payload: {
      event: 'booking_new',
      revision_id: revision(),
      ota: channel.name,
      room_type: stay.type,
      arrival: iso(stay.checkIn),
      departure: iso(stay.checkOut),
      guest: guest.name,
      guests: guest.count,
    },
  }
  play(steps.value, () => {
    seen.add(last.value.payload.revision_id)
    emit('booking', {
      id,
      guest: guest.name,
      room: stay.room.id,
      checkIn: stay.checkIn,
      checkOut: stay.checkOut,
      status: 'confirmed',
      source: channel.name,
      guests: guest.count,
      nightlyRate: channel.rate[stay.type],
      revision: last.value.payload.revision_id,
      fresh: true,
    })
    channels.filter((c) => c.id !== channel.id).forEach((c) => pulse(c.id, 'out'))
  })
}

// Channel managers retry webhooks. The same revision must never create a second booking.
function replay() {
  if (!last.value || !seen.has(last.value.payload.revision_id)) return
  last.value = { ...last.value, duplicate: true }
  play(steps.value, () => {})
}

const steps = computed(() => {
  const w = last.value
  if (!w) return []
  if (w.duplicate) {
    return [
      { ok: true, text: 'Signature verified' },
      { ok: false, text: `Revision ${w.payload.revision_id} already saved. Ignored, no second booking.` },
      { ok: true, text: 'Acknowledged, so the channel manager stops retrying' },
    ]
  }
  const range = `${shortDate(w.stay.checkIn)}–${shortDate(w.stay.checkOut)}`
  return [
    { ok: true, text: 'Signature verified' },
    { ok: true, text: 'New revision, not a retry' },
    { ok: true, text: `${w.stay.type} mapped to room ${w.stay.room.id}` },
    { ok: true, text: `Saved as ${w.id}` },
    {
      ok: true,
      text:
        w.leftAfter > 0
          ? `Availability pushed: ${w.leftAfter} ${w.stay.type} left for ${range}`
          : `Sold out for ${range}. Stop-sell pushed to every channel`,
    },
    { ok: true, text: 'Revision acknowledged' },
  ]
})

const payloadText = computed(() => (last.value ? JSON.stringify(last.value.payload, null, 2) : '// waiting for a booking…'))
const done = computed(() => last.value && shown.value === steps.value.length)
const canReplay = computed(() => done.value && !last.value.duplicate)

onBeforeUnmount(clearTimers)
</script>

<template>
  <section class="sync" aria-label="How Go Overbooked syncs with the OTAs">
    <div class="stage">
      <div class="stage-head">
        <span class="step">01</span>
        <h3>OTAs</h3>
      </div>
      <p>Guests book wherever they browse. Send a booking from any channel.</p>
      <ul class="channels">
        <li v-for="c in channels" :key="c.id">
          <span
            :key="pulses[c.id]?.n ?? 0"
            class="dot"
            :class="{ pulse: pulses[c.id] }"
            :style="{ '--c': `var(${c.color})` }"
            aria-hidden="true"
          ></span>
          <span class="name">{{ c.name }}</span>
          <span v-if="pulses[c.id]" :key="`m${pulses[c.id].n}`" class="meta">
            {{ pulses[c.id].kind === 'in' ? 'booked' : 'synced' }}
          </span>
          <button type="button" class="book" @click="receive(c)">Book</button>
        </li>
      </ul>
      <p v-if="soldOut" class="warn" role="status">Every room is taken this week, so no channel can sell another night.</p>
    </div>

    <div class="arrow" aria-hidden="true">
      <span v-if="last" :key="`in${last.payload.revision_id}${last.duplicate}`" class="packet"></span>
      <span v-if="done && !last.duplicate" :key="`out${last.payload.revision_id}`" class="packet back"></span>
    </div>

    <div class="stage">
      <div class="stage-head">
        <span class="step">02</span>
        <h3>Channel manager</h3>
        <span class="chip">white-label</span>
      </div>
      <p>A white-label channel manager under our brand. It turns every OTA into one booking format and one webhook.</p>
      <div class="code">
        <div class="code-label">POST /webhooks/channel-manager</div>
        <pre :key="last?.payload.revision_id" class="payload">{{ payloadText }}</pre>
      </div>
    </div>

    <div class="arrow" aria-hidden="true">
      <span v-if="last" :key="`in2${last.payload.revision_id}${last.duplicate}`" class="packet late"></span>
      <span v-if="done && !last.duplicate" :key="`out2${last.payload.revision_id}`" class="packet back"></span>
    </div>

    <div class="stage">
      <div class="stage-head">
        <span class="step">03</span>
        <h3>Go Overbooked</h3>
      </div>
      <p>What I built. It checks the webhook, saves the booking once, then pushes availability back out.</p>
      <div class="code">
        <div class="code-label">webhook handler</div>
        <ol v-if="last" class="steps">
          <li v-for="(s, i) in steps.slice(0, shown)" :key="`${last.payload.revision_id}${last.duplicate}${i}`" :class="{ skip: !s.ok }">
            <svg v-if="s.ok" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
            <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M8 12h8" /></svg>
            <span>{{ s.text }}</span>
          </li>
        </ol>
        <div v-else class="empty">Book from an OTA to see it arrive.</div>
      </div>
      <button v-if="canReplay" type="button" class="replay" @click="replay">Resend the same webhook</button>
    </div>
  </section>
</template>

<style scoped>
.sync {
  padding: 20px;
  border: 1px dashed var(--accent);
  border-radius: var(--radius-lg);
  background: var(--surface);
  display: grid;
  color: var(--text);
  grid-template-columns: 1fr 32px 1.1fr 32px 1.2fr;
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
.chip {
  padding: 1px 7px;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent);
  font-family: var(--font-mono);
  font-size: 10px;
}
p {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-muted);
}
.channels {
  margin: 4px 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.channels li {
  height: 36px;
  padding: 0 6px 0 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}
.dot {
  width: 8px;
  height: 8px;
  flex: none;
  border-radius: 50%;
  background: var(--c);
}
.dot.pulse {
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
.name {
  font-weight: 500;
  white-space: nowrap;
}
.meta {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--text-subtle);
  animation: blink 1.6s ease-out;
}
.book {
  margin-left: auto;
  height: 26px;
  padding: 0 10px;
  border: 0;
  border-radius: 6px;
  background: var(--accent);
  color: var(--surface);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}
.book:hover {
  background: color-mix(in srgb, var(--accent) 88%, var(--text));
}
.warn {
  color: var(--status-pending);
}
.arrow {
  position: relative;
  align-self: center;
  height: 1px;
  background: var(--border-dashed);
}
.arrow::before,
.arrow::after {
  content: '';
  position: absolute;
  top: -3px;
  border: 3.5px solid transparent;
}
.arrow::after {
  right: 0;
  border-left: 5px solid var(--border-dashed);
  border-right: 0;
}
.arrow::before {
  left: 0;
  border-right: 5px solid var(--border-dashed);
  border-left: 0;
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
.packet.back {
  left: auto;
  right: 0;
  background: var(--status-checked-in);
  animation-name: travel-back;
}
@keyframes travel {
  0% {
    opacity: 1;
    transform: translateX(0);
  }
  100% {
    opacity: 0;
    transform: translateX(26px);
  }
}
@keyframes travel-back {
  0% {
    opacity: 1;
    transform: translateX(0);
  }
  100% {
    opacity: 0;
    transform: translateX(-26px);
  }
}
.code {
  flex: 1;
  margin-top: 4px;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface-muted);
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}
.code-label {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-subtle);
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
.steps {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.steps li {
  padding: 3px 6px;
  border-radius: 6px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 12px;
  line-height: 1.45;
  animation: blink 1.2s ease-out;
}
.steps svg {
  flex: none;
  margin-top: 2px;
  color: var(--status-confirmed);
}
.steps li.skip svg,
.steps li.skip {
  color: var(--status-pending);
}
.empty {
  font-size: 12px;
  color: var(--text-subtle);
}
.replay {
  align-self: flex-start;
  height: 30px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--text);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
}
.replay:hover {
  background: var(--hover);
}
@keyframes blink {
  0% {
    background: var(--accent-soft);
  }
  100% {
    background: transparent;
  }
}
@media (max-width: 1100px) {
  .sync {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  .arrow {
    display: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .dot.pulse,
  .packet,
  .payload,
  .steps li,
  .meta {
    animation: none;
  }
}
</style>
