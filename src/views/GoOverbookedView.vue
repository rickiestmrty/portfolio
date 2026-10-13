<script setup>
import { computed, ref } from 'vue'
import BookingCalendar from '@/components/go-overbooked/BookingCalendar.vue'
import BookingDrawer from '@/components/go-overbooked/BookingDrawer.vue'
import ChannelSyncPanel from '@/components/go-overbooked/ChannelSyncPanel.vue'
import NewBookingDialog from '@/components/go-overbooked/NewBookingDialog.vue'
import EngineeringHighlights from '@/components/go-overbooked/EngineeringHighlights.vue'
import SystemMap from '@/components/go-overbooked/SystemMap.vue'
import ProductScope from '@/components/go-overbooked/ProductScope.vue'
import ProjectDemo from '@/components/ProjectDemo.vue'
import ProjectCaseStudy from '@/components/ProjectCaseStudy.vue'
import { bookings as demoBookings, links, rooms, traction } from '@/data/goOverbooked'
import { addDays, startOfDay } from '@/utils/dates'

defineProps({ title: { type: String, required: true } })

const today = startOfDay(new Date())
const weekOffset = ref(0)
const search = ref('')
const selected = ref(null)
const showSync = ref(false)
const showNew = ref(false)
// The story is clamped to its opening lines until the visitor asks for the rest.
const storyOpen = ref(false)

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
          :href="links.landing"
          target="_blank"
          rel="noopener noreferrer"
          class="site-link"
          aria-label="Visit gooverbooked.com (opens in a new tab)"
          title="gooverbooked.com"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></svg>
        </a>
      </h1>
      <div id="story" class="story" :class="{ open: storyOpen }">
        <p>
          During Holy Week 2023, two families showed up at my family’s 9-room guesthouse on Bantayan Island for the same
          room. Both had paid and both had confirmations. We were tracking Booking.com, Agoda, walk-ins and Facebook
          Messenger by hand, and every PMS on the market was built for 200-room hotels and cost more per month than we
          charged for a night. So I built one.
        </p>
        <p v-show="storyOpen">
          Go Overbooked puts every booking on one calendar and handles payments, receipts, finances and guest messages for
          properties with 3 to 20 rooms. I’ve built it since June 2025, from the Vue front end to the Postgres database, and
          I run the business too. It still runs every booking at our guesthouse.
        </p>
      </div>
      <button type="button" class="more" aria-controls="story" :aria-expanded="storyOpen" @click="storyOpen = !storyOpen">
        {{ storyOpen ? 'Show less' : 'Read more' }}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
      </button>
    </div>

    <div class="actions">
      <a :href="links.app" target="_blank" rel="noopener noreferrer" class="btn primary">
        Try the live app
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7" /><path d="M7 7h10v10" /></svg>
      </a>
      <a :href="links.founderStory" target="_blank" rel="noopener noreferrer" class="btn">Founder story</a>
      <a :href="links.exampleSite" target="_blank" rel="noopener noreferrer" class="btn">A hotel site built with it</a>
      <span class="hint">No signup. The live app has a demo mode with sample data and a guided tour.</span>
    </div>

    <section class="traction" aria-label="Traction">
      <ul class="stats">
        <li v-for="s in traction.stats" :key="s.label">
          <span class="value">{{ s.value }}</span>
          <span class="label">{{ s.label }}</span>
        </li>
      </ul>
      <p class="as-of">In production as of {{ traction.asOf }}</p>
    </section>

    <ProjectDemo
      title="Try the booking calendar"
      intro="A small demo made for this page. Click a booking to see its details, or add your own with New booking."
    >
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
    </ProjectDemo>

    <BookingDrawer :booking="selected" :room="selectedRoom" @close="selected = null" />
    <NewBookingDialog :open="showNew" :rooms="rooms" :bookings="bookings" @close="showNew = false" @create="createBooking" />

    <ProjectCaseStudy slug="go-overbooked" title="How I built it">
      <EngineeringHighlights />
      <SystemMap />
      <ProductScope />
    </ProjectCaseStudy>
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
.head p {
  max-width: 76ch;
  line-height: 1.55;
}
.head p + p {
  margin-top: 6px;
}
.story:not(.open) p:first-child {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
}
.more {
  align-self: flex-start;
  padding: 2px 0;
  border: 0;
  background: none;
  color: var(--on-brand);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.more:hover {
  text-decoration: underline;
}
.more svg {
  transition: transform 0.15s;
}
.more[aria-expanded='true'] svg {
  transform: rotate(180deg);
}
.actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.btn {
  height: 40px;
  padding: 0 14px;
  border: 1px solid color-mix(in srgb, var(--on-brand) 45%, transparent);
  border-radius: var(--radius-md);
  color: var(--on-brand);
  font-size: 14px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}
.btn:hover {
  background: color-mix(in srgb, var(--on-brand) 14%, transparent);
}
.btn.primary {
  border-color: var(--surface);
  background: var(--surface);
  color: var(--status-confirmed);
  font-weight: 600;
}
.btn.primary:hover {
  background: var(--hover);
}
.traction {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.stats {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  background: var(--surface);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
}
.stats li {
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.stats li + li {
  border-left: 1px solid var(--border-soft);
}
.value {
  font-size: 26px;
  font-weight: 600;
  letter-spacing: -0.02em;
}
.label {
  font-size: 13px;
  line-height: 1.4;
  color: var(--text-muted);
}
.as-of {
  font-family: var(--font-mono);
  font-size: 12px;
}
.site-link:focus-visible,
.switch:focus-visible,
.new-btn:focus-visible,
.btn:focus-visible,
.more:focus-visible {
  outline-color: var(--on-brand);
}
@media (max-width: 768px) {
  .story:not(.open) p:first-child {
    -webkit-line-clamp: 3;
    line-clamp: 3;
  }
  .stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .stats li:nth-child(3) {
    border-left: 0;
  }
  .stats li:nth-child(n + 3) {
    border-top: 1px solid var(--border-soft);
  }
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
