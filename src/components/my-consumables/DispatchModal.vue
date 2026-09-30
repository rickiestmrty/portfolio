<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { drivers, pharmacy } from '@/data/myConsumables'

const props = defineProps({
  order: { type: Object, default: null },
  showWorkflow: { type: Boolean, default: false },
})
const emit = defineEmits(['close', 'send'])

const OSRM = 'https://router.project-osrm.org/route/v1/driving'
// Used when the routing service can't be reached: straight-line distance at suburban speed.
const FALLBACK_KMH = 30

const open = computed(() => Boolean(props.order))
const sending = computed(() => props.order?.status === 'packed')
const driverId = ref(drivers[0].id)
const justSent = ref(false)
const assigned = computed(() => drivers.find((d) => d.id === props.order?.driver))

const mapEl = ref(null)
const route = ref(null) // { km, mins, approx }
const loading = ref(false)
let map = null
let routeToken = 0

const pin = (cls, label) =>
  L.divIcon({
    className: '',
    html: `<div class="pin ${cls}"><span>${label}</span></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })

const haversineKm = (a, b) => {
  const rad = (d) => (d * Math.PI) / 180
  const dLat = rad(b.lat - a.lat)
  const dLng = rad(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 12742 * Math.asin(Math.sqrt(h))
}

async function fetchRoute(from, to) {
  const url = `${OSRM}/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Routing failed: ${res.status}`)
  const data = await res.json()
  const r = data.routes?.[0]
  if (!r) throw new Error('No route found')
  return {
    points: r.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
    km: r.distance / 1000,
    mins: Math.max(1, Math.round(r.duration / 60)),
    approx: false,
  }
}

async function drawMap() {
  const to = props.order.address
  map = L.map(mapEl.value, { zoomControl: true, attributionControl: true, scrollWheelZoom: false })
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map)

  L.marker([pharmacy.lat, pharmacy.lng], { icon: pin('from', 'Rx') }).addTo(map)
  L.marker([to.lat, to.lng], { icon: pin('to', props.order.patient[0]) }).addTo(map)
  map.fitBounds([[pharmacy.lat, pharmacy.lng], [to.lat, to.lng]], { padding: [48, 48] })

  const token = ++routeToken
  loading.value = true
  route.value = null
  let result
  try {
    result = await fetchRoute(pharmacy, to)
  } catch {
    const km = haversineKm(pharmacy, to)
    result = { points: [[pharmacy.lat, pharmacy.lng], [to.lat, to.lng]], km, mins: Math.round((km / FALLBACK_KMH) * 60), approx: true }
  }
  if (token !== routeToken || !map) return
  loading.value = false
  route.value = result

  const line = L.polyline(result.points, {
    color: getComputedStyle(mapEl.value).getPropertyValue('--accent').trim(),
    weight: 5,
    opacity: 0.85,
    dashArray: result.approx ? '6 8' : null,
  }).addTo(map)
  map.fitBounds(line.getBounds(), { padding: [48, 48] })
}

function destroyMap() {
  routeToken++
  map?.remove()
  map = null
}

watch(
  () => props.order?.id,
  async (id) => {
    destroyMap()
    if (!id) return
    justSent.value = false
    driverId.value = props.order.driver ?? drivers[0].id
    await nextTick()
    if (mapEl.value) drawMap()
  },
)

const send = () => {
  emit('send', { id: props.order.id, driver: driverId.value })
  justSent.value = true
}

const onKey = (e) => {
  if (e.key === 'Escape' && open.value) emit('close')
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  destroyMap()
})
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="backdrop" @click="emit('close')"></div>
    </Transition>
    <Transition name="pop" @after-enter="map?.invalidateSize()">
      <div v-if="open" class="modal" role="dialog" aria-modal="true" aria-labelledby="dispatch-title">
        <header class="top">
          <div class="crumb">{{ order.id }} · {{ sending && !justSent ? 'Send to driver' : 'Delivery route' }}</div>
          <button class="close" aria-label="Close" @click="emit('close')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </header>

        <div class="layout">
          <div class="map-wrap">
            <div ref="mapEl" class="map"></div>
            <div v-if="loading" class="map-note">Finding the fastest route…</div>
          </div>

          <div class="side">
            <div class="stops">
              <div class="stop">
                <span class="dot from" aria-hidden="true"></span>
                <div>
                  <div class="stop-name">{{ pharmacy.name }}</div>
                  <div class="stop-sub">{{ pharmacy.address }}</div>
                </div>
              </div>
              <div class="stop">
                <span class="dot to" aria-hidden="true"></span>
                <div>
                  <h2 id="dispatch-title" class="stop-name">{{ order.patient }}</h2>
                  <div class="stop-sub">{{ order.address.line }}</div>
                  <div class="stop-sub">{{ order.phone }}</div>
                </div>
              </div>
            </div>

            <dl class="stats">
              <div>
                <dt>Distance</dt>
                <dd>{{ route ? `${route.km.toFixed(1)} km` : '–' }}</dd>
              </div>
              <div>
                <dt>Drive time</dt>
                <dd>{{ route ? `${route.mins} min` : '–' }}</dd>
              </div>
              <div>
                <dt>Items</dt>
                <dd>{{ order.items.length }}</dd>
              </div>
            </dl>
            <p v-if="route?.approx" class="fine">Routing is offline, so this is a straight-line estimate.</p>
            <div v-if="showWorkflow" class="tag">Road route from OSRM · falls back to an estimate</div>

            <p v-if="order.items.some((i) => i.cold)" class="notice">Contains cold-chain items. Pack with an ice brick.</p>

            <template v-if="sending && !justSent">
              <fieldset class="drivers">
                <legend class="label">Driver</legend>
                <label v-for="d in drivers" :key="d.id" class="driver" :class="{ on: driverId === d.id }">
                  <input v-model="driverId" type="radio" name="driver" :value="d.id" />
                  <span class="driver-name">{{ d.name }}</span>
                  <span class="driver-sub">{{ d.vehicle }}</span>
                </label>
              </fieldset>
              <button type="button" class="primary" @click="send">Send to driver</button>
            </template>

            <template v-else>
              <div v-if="justSent" class="sent" role="status">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
                Sent to {{ assigned?.name }}
              </div>
              <div v-else-if="assigned" class="assigned">
                <span class="label">Driver</span>
                <span class="driver-name">{{ assigned.name }}</span>
                <span class="driver-sub">{{ assigned.vehicle }}</span>
              </div>
              <button type="button" class="primary" @click="emit('close')">Done</button>
            </template>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(24, 24, 27, 0.28);
  z-index: 1000;
}
.modal {
  /* Teleported to body, so it doesn't inherit the page's navy accent. Set it here too. */
  --accent: var(--brand-myconsumables);
  --accent-soft: color-mix(in srgb, var(--brand-myconsumables) 10%, var(--surface));
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: min(880px, calc(100vw - 32px));
  max-height: calc(100vh - 32px);
  display: flex;
  flex-direction: column;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: 0 20px 48px rgba(24, 24, 27, 0.14);
  z-index: 1001;
  overflow: hidden;
}
.top {
  height: 52px;
  flex: none;
  padding: 0 10px 0 20px;
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
  width: 32px;
  height: 32px;
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
.layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  min-height: 0;
  overflow: auto;
}
.map-wrap {
  position: relative;
  min-height: 460px;
  border-right: 1px solid var(--border);
}
.map {
  position: absolute;
  inset: 0;
  background: var(--surface-muted);
}
.map-note {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 500;
  padding: 6px 12px;
  border-radius: 999px;
  background: var(--surface);
  border: 1px solid var(--border);
  font-size: 12px;
  color: var(--text-muted);
}
.side {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.stops {
  display: flex;
  flex-direction: column;
  gap: 14px;
  position: relative;
}
.stops::before {
  content: '';
  position: absolute;
  left: 5px;
  top: 14px;
  bottom: 30px;
  border-left: 2px dashed var(--border-dashed);
}
.stop {
  display: grid;
  grid-template-columns: 12px 1fr;
  gap: 12px;
}
.dot {
  width: 12px;
  height: 12px;
  margin-top: 4px;
  border-radius: 50%;
  position: relative;
}
.dot.from {
  background: var(--text);
}
.dot.to {
  background: var(--accent);
}
.stop-name {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.01em;
}
.stop-sub {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.5;
}
.stats {
  margin: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
}
.stats div {
  padding: 10px 12px;
}
.stats div + div {
  border-left: 1px solid var(--border-soft);
}
dt,
.label {
  font-size: 11px;
  color: var(--text-muted);
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
dd {
  margin: 2px 0 0;
  font-size: 16px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.fine {
  margin: -8px 0 0;
  font-size: 12px;
  color: var(--text-subtle);
}
.notice {
  margin: 0;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  background: var(--today);
  color: var(--status-pending);
  font-size: 13px;
  line-height: 1.5;
}
.drivers {
  margin: 0;
  padding: 0;
  border: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.drivers legend {
  margin-bottom: 8px;
}
.driver {
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  display: grid;
  grid-template-columns: auto 1fr;
  column-gap: 10px;
  cursor: pointer;
}
.driver:hover {
  background: var(--hover);
}
.driver.on {
  border-color: var(--accent);
  background: var(--accent-soft);
}
.driver input {
  grid-row: span 2;
  margin: 3px 0 0;
  accent-color: var(--accent);
}
.driver-name {
  font-size: 14px;
  font-weight: 500;
}
.driver-sub {
  font-size: 12px;
  color: var(--text-muted);
}
.assigned {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.sent {
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--status-confirmed) 12%, transparent);
  color: var(--status-confirmed);
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}
.primary {
  margin-top: auto;
  height: 44px;
  border: 0;
  border-radius: var(--radius-md);
  background: var(--accent);
  color: var(--surface);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
.primary:hover {
  background: color-mix(in srgb, var(--accent) 88%, var(--text));
}

.tag {
  align-self: flex-start;
  margin-top: -8px;
  padding: 1px 8px;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent);
  font-family: var(--font-mono);
  font-size: 11px;
}

/* Leaflet builds the tiles and markers outside Vue, so they need :deep. */
.map :deep(.leaflet-tile-pane) {
  filter: grayscale(0.7) contrast(0.95) brightness(1.03);
}
.map :deep(.pin) {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 3px solid var(--surface);
  box-shadow: 0 2px 6px rgba(24, 24, 27, 0.3);
  display: grid;
  place-items: center;
  color: var(--surface);
  font-family: var(--font);
  font-size: 11px;
  font-weight: 700;
}
.map :deep(.pin.from) {
  background: var(--text);
}
.map :deep(.pin.to) {
  background: var(--accent);
}

@media (max-width: 720px) {
  .layout {
    grid-template-columns: 1fr;
  }
  .map-wrap {
    min-height: 280px;
    border-right: 0;
    border-bottom: 1px solid var(--border);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.pop-enter-active,
.pop-leave-active {
  transition: opacity 0.2s, transform 0.2s ease;
}
.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: translate(-50%, -48%) scale(0.98);
}
</style>
