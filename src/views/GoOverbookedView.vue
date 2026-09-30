<script setup>
import { computed, ref } from 'vue'
import BookingCalendar from '@/components/go-overbooked/BookingCalendar.vue'
import BookingDrawer from '@/components/go-overbooked/BookingDrawer.vue'
import ChannelSyncPanel from '@/components/go-overbooked/ChannelSyncPanel.vue'
import NewBookingDialog from '@/components/go-overbooked/NewBookingDialog.vue'
import { bookings as demoBookings, rooms } from '@/data/goOverbooked'
import { addDays, startOfDay } from '@/utils/dates'

defineProps({ title: { type: String, required: true } })

const today = startOfDay(new Date())
const weekOffset = ref(0)
const search = ref('')
const selected = ref(null)
const showSync = ref(false)
const showNew = ref(false)

const weekStart = computed(() => addDays(today, weekOffset.value * 7))

const withDates = (b) => ({
  ...b,
  label: b.role ? `${b.guest} ${b.role}` : b.guest,
  checkInDate: addDays(today, b.checkIn),
  checkOutDate: addDays(today, b.checkOut),
})

const bookings = ref(demoBookings.map(withDates))

// A booking from the channel sync demo or the new booking form. Jump to its week so it's visible.
const addBooking = (b) => {
  bookings.value.push(withDates(b))
  weekOffset.value = Math.floor(b.checkIn / 7)
  setTimeout(() => {
    const added = bookings.value.find((x) => x.id === b.id)
    if (added) added.fresh = false
  }, 1500)
}

const visibleBookings = computed(() => {
  const q = search.value.trim().toLowerCase()
  return q ? bookings.value.filter((b) => b.label.toLowerCase().includes(q)) : bookings.value
})

const createBooking = (b) => {
  showNew.value = false
  search.value = ''
  addBooking(b)
}

const selectedRoom = computed(() => rooms.find((r) => r.id === selected.value?.room))
</script>

<template>
  <div class="page">
    <div class="head">
      <div class="crumb">Work / {{ title }}</div>
      <h1>
        {{ title }}
        <a
          href="https://gooverbooked.com"
          target="_blank"
          rel="noopener noreferrer"
          class="site-link"
          aria-label="Visit gooverbooked.com (opens in a new tab)"
          title="gooverbooked.com"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></svg>
        </a>
      </h1>
      <p>
        A property management system I built and sell to small property owners in the Philippines. It replaces the
        whiteboard, so bookings, payments and staff live in one place. The calendar below is a demo. Click a booking to
        see its details, or add your own with New booking.
      </p>
    </div>

    <div class="stack-toolbar">
      <button type="button" role="switch" class="switch" :aria-checked="showSync" @click="showSync = !showSync">
        <span class="knob" aria-hidden="true"></span>
        Show the channel sync
      </button>
      <span class="hint">{{
        showSync
          ? 'Book from an OTA and follow it through my integration into the calendar.'
          : 'See how bookings from Airbnb, Booking.com and others reach the calendar.'
      }}</span>
    </div>

    <Transition name="reveal">
      <ChannelSyncPanel v-if="showSync" :rooms="rooms" :bookings="bookings" @booking="addBooking" />
    </Transition>

    <div class="toolbar">
      <label class="search">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
        <input v-model="search" type="search" placeholder="Search by guest..." aria-label="Search by guest" />
      </label>
      <button type="button" class="new-btn" @click="showNew = true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
        New booking
      </button>
    </div>

    <BookingCalendar
      :week-start="weekStart"
      :rooms="rooms"
      :bookings="visibleBookings"
      :selected-id="selected?.id"
      @select="selected = $event"
      @prev="weekOffset--"
      @next="weekOffset++"
      @today="weekOffset = 0"
    />

    <BookingDrawer :booking="selected" :room="selectedRoom" @close="selected = null" />
    <NewBookingDialog :open="showNew" :rooms="rooms" :bookings="bookings" @close="showNew = false" @create="createBooking" />
  </div>
</template>

<style scoped>
.stack-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.hint {
  font-size: 13px;
  color: var(--on-brand-muted);
}
.switch {
  height: 40px;
  padding: 0 14px 0 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
  color: var(--text);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
}
.switch:hover {
  background: var(--hover);
}
.knob {
  position: relative;
  width: 32px;
  height: 18px;
  border-radius: 999px;
  background: var(--border-dashed);
  transition: background 0.15s;
}
.knob::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--surface);
  transition: transform 0.15s;
}
.switch[aria-checked='true'] .knob {
  background: var(--accent);
}
.switch[aria-checked='true'] .knob::after {
  transform: translateX(14px);
}
.reveal-enter-active,
.reveal-leave-active {
  transition: opacity 0.2s, transform 0.2s ease;
}
.reveal-enter-from,
.reveal-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
/* Fill the whole main area (cancels its padding) with the success green. */
.page {
  margin: calc(-1 * var(--main-pad-y)) calc(-1 * var(--main-pad-x));
  padding: var(--main-pad-y) var(--main-pad-x);
  min-height: calc(100% + 2 * var(--main-pad-y));
  background: var(--status-confirmed);
  color: var(--on-brand);
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.head {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.crumb {
  font-size: 13px;
  color: var(--on-brand-muted);
  font-family: var(--font-mono);
}
h1 {
  margin: 0;
  font-size: 30px;
  font-weight: 600;
  letter-spacing: -0.02em;
  display: flex;
  align-items: center;
  gap: 10px;
}
.site-link {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  color: var(--on-brand-muted);
  display: grid;
  place-items: center;
}
.site-link:hover {
  background: color-mix(in srgb, var(--on-brand) 14%, transparent);
  color: var(--on-brand);
}
p {
  margin: 0;
  font-size: 15px;
  color: var(--on-brand-muted);
}
.site-link:focus-visible,
.switch:focus-visible,
.new-btn:focus-visible {
  outline-color: var(--on-brand);
}
.new-btn {
  margin-left: auto;
  height: 40px;
  padding: 0 16px 0 12px;
  border: 0;
  border-radius: var(--radius-md);
  background: var(--surface);
  color: var(--status-confirmed);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}
.new-btn:hover {
  background: var(--hover);
}
.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
}
.search {
  width: 300px;
  min-width: 0;
  flex-shrink: 1;
  height: 40px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 8px;
}
.search:focus-within {
  border-color: var(--accent);
}
.search input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: 0;
  background: none;
  font: inherit;
  font-size: 14px;
  color: var(--text);
}
</style>
