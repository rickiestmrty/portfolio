<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { statuses } from '@/data/goOverbooked'
import { dayDiff } from '@/utils/dates'

const props = defineProps({
  booking: { type: Object, default: null },
  room: { type: Object, default: null },
})
const emit = defineEmits(['close'])

const closeBtn = ref(null)

const nights = computed(() => (props.booking ? dayDiff(props.booking.checkInDate, props.booking.checkOutDate) : 0))
const peso = (n) => `₱${n.toLocaleString('en-US')}`
const fmtDate = (d) => d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })

const onKey = (e) => {
  if (e.key === 'Escape' && props.booking) emit('close')
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

watch(
  () => props.booking,
  async (b) => {
    if (b) {
      await nextTick()
      closeBtn.value?.focus()
    }
  },
)
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="booking" class="backdrop" @click="emit('close')"></div>
    </Transition>
    <Transition name="slide">
      <aside v-if="booking" class="drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
        <header class="top">
          <div class="crumb">Booking {{ booking.id }}</div>
          <button ref="closeBtn" class="close" aria-label="Close details" @click="emit('close')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </header>

        <div class="body">
          <div class="guest">
            <span class="status" :class="booking.status">{{ statuses[booking.status] }}</span>
            <h2 id="drawer-title">{{ booking.guest }}</h2>
            <p v-if="booking.role" class="role">{{ booking.role }}</p>
          </div>

          <section class="stay">
            <div>
              <div class="label">Check-in</div>
              <div class="value">{{ fmtDate(booking.checkInDate) }}</div>
              <div class="hint">From 2:00 PM</div>
            </div>
            <div class="nights">{{ nights }} {{ nights === 1 ? 'night' : 'nights' }}</div>
            <div>
              <div class="label">Check-out</div>
              <div class="value">{{ fmtDate(booking.checkOutDate) }}</div>
              <div class="hint">Until 12:00 PM</div>
            </div>
          </section>

          <section v-if="booking.notes">
            <h3>Notes</h3>
            <p class="notes">{{ booking.notes }}</p>
          </section>

          <section>
            <h3>Details</h3>
            <dl>
              <dt>Room</dt>
              <dd>{{ booking.room }} · {{ room?.type }}</dd>
              <dt>Guests</dt>
              <dd>{{ booking.guests }}</dd>
              <dt>Source</dt>
              <dd>{{ booking.source }}</dd>
              <template v-if="booking.revision">
                <dt>Channel revision</dt>
                <dd class="mono">{{ booking.revision }}</dd>
              </template>
            </dl>
          </section>

          <section>
            <h3>Payment</h3>
            <dl>
              <dt>{{ peso(booking.nightlyRate) }} × {{ nights }} {{ nights === 1 ? 'night' : 'nights' }}</dt>
              <dd>{{ peso(booking.nightlyRate * nights) }}</dd>
              <dt class="total">Total</dt>
              <dd class="total">{{ peso(booking.nightlyRate * nights) }}</dd>
            </dl>
          </section>
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(24, 24, 27, 0.28);
  z-index: 50;
}
.drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: min(420px, 100vw);
  background: var(--surface);
  border-left: 1px solid var(--border);
  box-shadow: -12px 0 32px rgba(24, 24, 27, 0.08);
  z-index: 51;
  display: flex;
  flex-direction: column;
}
.top {
  height: var(--header-h);
  flex-shrink: 0;
  padding: 0 16px 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border);
}
.crumb {
  font-size: 13px;
  color: var(--text-muted);
  font-family: var(--font-mono);
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
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.guest {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
}
h2 {
  margin: 4px 0 0;
  font-size: 22px;
  font-weight: 600;
  letter-spacing: -0.02em;
}
.role {
  margin: 0;
  font-size: 15px;
  color: var(--text-muted);
}
.status {
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}
.status.checked-in {
  color: var(--status-checked-in);
  background: color-mix(in srgb, var(--status-checked-in) 12%, transparent);
}
.status.confirmed {
  color: var(--status-confirmed);
  background: color-mix(in srgb, var(--status-confirmed) 12%, transparent);
}
.status.pending {
  color: var(--status-pending);
  background: color-mix(in srgb, var(--status-pending) 12%, transparent);
}
.stay {
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--surface-muted);
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 12px;
}
.stay > div:last-child {
  text-align: right;
}
.nights {
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}
.label {
  font-size: 12px;
  color: var(--text-muted);
  font-family: var(--font-mono);
}
.value {
  margin-top: 4px;
  font-size: 14px;
  font-weight: 600;
}
.hint {
  margin-top: 2px;
  font-size: 12px;
  color: var(--text-muted);
}
h3 {
  margin: 0 0 10px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-subtle);
}
.notes {
  margin: 0;
  padding: 14px 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--surface-muted);
  font-size: 14px;
  line-height: 1.6;
  color: var(--text);
}
dl {
  margin: 0;
  display: grid;
  grid-template-columns: 1fr auto;
  row-gap: 10px;
  font-size: 14px;
}
dt {
  color: var(--text-muted);
}
dd {
  margin: 0;
  font-weight: 500;
  text-align: right;
}
.total {
  padding-top: 10px;
  border-top: 1px solid var(--border-soft);
  color: var(--text);
  font-weight: 600;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.25s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
.mono {
  font-family: var(--font-mono);
  font-size: 12px;
}
</style>
