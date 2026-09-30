<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { addDays, dayDiff, startOfDay } from '@/utils/dates'

const props = defineProps({
  open: { type: Boolean, default: false },
  rooms: { type: Array, required: true },
  bookings: { type: Array, required: true },
})
const emit = defineEmits(['close', 'create'])

const today = startOfDay(new Date())
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const parse = (s) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}
const peso = (n) => `₱${n.toLocaleString('en-US')}`

const nameInput = ref(null)
const form = ref({})
const submitted = ref(false)
let bookingNo = 20000

const reset = () => {
  submitted.value = false
  form.value = {
    guest: '',
    room: props.rooms[0].id,
    checkIn: iso(today),
    checkOut: iso(addDays(today, 1)),
    guests: 1,
  }
}

const room = computed(() => props.rooms.find((r) => r.id === form.value.room))
const inOffset = computed(() => (form.value.checkIn ? dayDiff(today, parse(form.value.checkIn)) : null))
const outOffset = computed(() => (form.value.checkOut ? dayDiff(today, parse(form.value.checkOut)) : null))
const nights = computed(() => (inOffset.value !== null && outOffset.value !== null ? outOffset.value - inOffset.value : 0))

const clash = computed(() =>
  props.bookings.find(
    (b) => b.room === form.value.room && b.checkIn < outOffset.value && inOffset.value < b.checkOut,
  ),
)

const errors = computed(() => {
  const e = {}
  if (!form.value.guest.trim()) e.guest = 'Enter the guest name.'
  if (inOffset.value === null) e.checkIn = 'Pick a check-in date.'
  else if (inOffset.value < 0) e.checkIn = 'Check-in cannot be in the past.'
  if (outOffset.value === null || nights.value < 1) e.checkOut = 'Check-out must be after check-in.'
  if (!(form.value.guests >= 1)) e.guests = 'At least 1 guest.'
  else if (room.value && form.value.guests > room.value.maxGuests)
    e.guests = `Room ${room.value.id} fits up to ${room.value.maxGuests}.`
  if (!e.checkIn && !e.checkOut && clash.value)
    e.room = `Room ${form.value.room} is booked by ${clash.value.guest} on those nights. That would be an overbooking.`
  return e
})

const submit = () => {
  submitted.value = true
  if (Object.keys(errors.value).length) return
  emit('create', {
    id: `GO-${++bookingNo}`,
    guest: form.value.guest.trim(),
    room: form.value.room,
    checkIn: inOffset.value,
    checkOut: outOffset.value,
    status: 'confirmed',
    source: 'Direct',
    guests: form.value.guests,
    nightlyRate: room.value.nightlyRate,
    fresh: true,
  })
}

const onKey = (e) => {
  if (e.key === 'Escape' && props.open) emit('close')
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

watch(
  () => props.open,
  async (open) => {
    if (open) {
      reset()
      await nextTick()
      nameInput.value?.focus()
    }
  },
)
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="backdrop" @click.self="emit('close')">
        <form class="dialog" role="dialog" aria-modal="true" aria-labelledby="new-booking-title" novalidate @submit.prevent="submit">
          <header class="top">
            <h2 id="new-booking-title">New booking</h2>
            <button type="button" class="close" aria-label="Close" @click="emit('close')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
          </header>

          <div class="body">
            <label class="field">
              <span class="label">Guest name</span>
              <input ref="nameInput" v-model="form.guest" type="text" autocomplete="off" placeholder="e.g. Juan Dela Cruz" />
              <span v-if="submitted && errors.guest" class="error">{{ errors.guest }}</span>
            </label>

            <label class="field">
              <span class="label">Room</span>
              <select v-model="form.room">
                <option v-for="r in rooms" :key="r.id" :value="r.id">{{ r.id }} · {{ r.type }} ({{ peso(r.nightlyRate) }}/night)</option>
              </select>
              <span v-if="errors.room" class="error">{{ errors.room }}</span>
            </label>

            <div class="row">
              <label class="field">
                <span class="label">Check-in</span>
                <input v-model="form.checkIn" type="date" :min="iso(today)" />
                <span v-if="submitted && errors.checkIn" class="error">{{ errors.checkIn }}</span>
              </label>
              <label class="field">
                <span class="label">Check-out</span>
                <input v-model="form.checkOut" type="date" :min="form.checkIn || iso(today)" />
                <span v-if="submitted && errors.checkOut" class="error">{{ errors.checkOut }}</span>
              </label>
            </div>

            <label class="field">
              <span class="label">Guests</span>
              <input v-model.number="form.guests" type="number" min="1" :max="room?.maxGuests" />
              <span v-if="submitted && errors.guests" class="error">{{ errors.guests }}</span>
            </label>

            <div v-if="nights > 0 && room" class="summary">
              <span>{{ peso(room.nightlyRate) }} × {{ nights }} {{ nights === 1 ? 'night' : 'nights' }}</span>
              <strong>{{ peso(room.nightlyRate * nights) }}</strong>
            </div>
          </div>

          <footer class="actions">
            <button type="button" class="btn ghost" @click="emit('close')">Cancel</button>
            <button type="submit" class="btn primary">Create booking</button>
          </footer>
        </form>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  padding: 16px;
  background: rgba(24, 24, 27, 0.28);
  z-index: 50;
  display: grid;
  place-items: center;
}
.dialog {
  width: min(440px, 100%);
  max-height: 100%;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: 0 16px 40px rgba(24, 24, 27, 0.14);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.top {
  height: 60px;
  flex-shrink: 0;
  padding: 0 12px 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border);
}
h2 {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.01em;
}
.close {
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: var(--radius-sm);
  background: none;
  color: var(--text-muted);
  cursor: pointer;
  display: grid;
  place-items: center;
}
.close:hover {
  background: var(--hover);
  color: var(--text);
}
.body {
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}
.label {
  font-size: 12px;
  color: var(--text-muted);
  font-family: var(--font-mono);
}
input,
select {
  height: 40px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
  color: var(--text);
  font: inherit;
  font-size: 14px;
  min-width: 0;
}
input:focus,
select:focus {
  outline: 0;
  border-color: var(--accent);
}
.error {
  font-size: 12px;
  color: var(--danger);
}
.summary {
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface-muted);
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: var(--text-muted);
}
.summary strong {
  color: var(--text);
}
.actions {
  padding: 14px 20px;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.btn {
  height: 38px;
  padding: 0 16px;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
.ghost {
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
}
.ghost:hover {
  background: var(--hover);
}
.primary {
  border: 0;
  background: var(--status-confirmed);
  color: var(--on-brand);
}
.primary:hover {
  filter: brightness(1.1);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
@media (max-width: 420px) {
  .row {
    grid-template-columns: 1fr;
  }
}
</style>
