<script setup>
import { computed, reactive, ref, watch } from 'vue'
import DispatchModal from '@/components/my-consumables/DispatchModal.vue'
import WorkflowPanel from '@/components/my-consumables/WorkflowPanel.vue'
import { drivers, orders as seed, statuses } from '@/data/myConsumables'

defineProps({ title: { type: String, required: true } })

const PAGE_SIZE = 10
const TODAY = '2026-09-30'

const orders = reactive(seed.map((o) => ({ ...o })))
const query = ref('')
const statusFilter = ref('all')
const page = ref(1)
const expanded = ref(new Set())
const dispatching = ref(null)
const showWorkflow = ref(false)
const events = ref([])

const counts = computed(() => Object.fromEntries(Object.keys(statuses).map((k) => [k, orders.filter((o) => o.status === k).length])))

// Newest first. Feeds the audit trail in the workflow panel.
const log = (order, to, driver = null) => {
  const time = new Date().toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
  events.value.unshift({ n: events.value.length, time, id: order.id, from: order.status, to, driver })
}

const tabs = computed(() => [
  { key: 'all', label: 'All', count: orders.length },
  ...Object.entries(statuses).map(([key, s]) => ({
    key,
    label: s.label,
    count: orders.filter((o) => o.status === key).length,
  })),
])

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return orders.filter((o) => {
    if (statusFilter.value !== 'all' && o.status !== statusFilter.value) return false
    if (!q) return true
    return [o.id, o.patient, o.phone, o.supplier, ...o.items.map((i) => i.name)].some((v) => v.toLowerCase().includes(q))
  })
})

const pageCount = computed(() => Math.max(1, Math.ceil(filtered.value.length / PAGE_SIZE)))
const rows = computed(() => filtered.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE))
const rangeLabel = computed(() => {
  if (!filtered.value.length) return '0 orders'
  const start = (page.value - 1) * PAGE_SIZE + 1
  const end = Math.min(page.value * PAGE_SIZE, filtered.value.length)
  return `${start}–${end} of ${filtered.value.length}`
})

watch([query, statusFilter], () => (page.value = 1))
// Advancing an order can drop it out of the current filter and empty the last page.
watch(pageCount, (n) => {
  if (page.value > n) page.value = n
})

const initials = (name) =>
  name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

// Stable avatar tint per patient, picked from the status palette.
const TINTS = ['--status-checked-in', '--status-confirmed', '--status-pending', '--accent', '--danger']
const tint = (name) => TINTS[[...name].reduce((sum, c) => sum + c.charCodeAt(0), 0) % TINTS.length]

const fmtDate = (iso) => {
  if (!iso) return '–'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

const toggle = (id) => {
  const next = new Set(expanded.value)
  next.has(id) ? next.delete(id) : next.add(id)
  expanded.value = next
}

const act = (order) => {
  if (order.status === 'packed' || order.status === 'dispatched') {
    dispatching.value = order
    return
  }
  if (order.status === 'ordered') order.received = TODAY
  const next = statuses[order.status].next
  log(order, next)
  order.status = next
}

const onSend = ({ id, driver }) => {
  const order = orders.find((o) => o.id === id)
  log(order, 'dispatched', drivers.find((d) => d.id === driver).name)
  order.driver = driver
  order.status = 'dispatched'
}
</script>

<template>
  <div class="page">
    <div class="head">
      <div class="crumb">Work / {{ title }}</div>
      <h1>{{ title }}</h1>
      <p>
        A healthcare platform for pharmacies that serve NDIS and Support at Home participants. I worked with a
        cross-functional team to turn the pharmacy’s daily routine into software that is simple to use and hard to
        break. Below is a demo of special orders. Confirm an order, pack it, then send it to a driver.
      </p>
    </div>

    <div class="stack-toolbar">
      <button type="button" role="switch" class="switch" :aria-checked="showWorkflow" @click="showWorkflow = !showWorkflow">
        <span class="knob" aria-hidden="true"></span>
        Show the workflow
      </button>
      <span class="hint">{{
        showWorkflow
          ? 'Each step answers a real need from the pharmacy. Move an order and watch it land in the audit trail.'
          : 'See the business need behind each step, and what I built for it.'
      }}</span>
    </div>

    <Transition name="reveal">
      <WorkflowPanel v-if="showWorkflow" :counts="counts" :events="events" />
    </Transition>

    <div class="toolbar">
      <label class="search">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
        <input v-model="query" type="search" placeholder="Search by order number, patient, product or supplier" aria-label="Search orders" />
      </label>
      <div class="tabs" role="tablist" aria-label="Filter by status">
        <button
          v-for="t in tabs"
          :key="t.key"
          type="button"
          role="tab"
          :aria-selected="statusFilter === t.key"
          :class="{ on: statusFilter === t.key }"
          @click="statusFilter = t.key"
        >
          {{ t.label }}
          <span class="count">{{ t.count }}</span>
        </button>
      </div>
    </div>

    <div class="card">
      <div class="scroll">
        <table>
          <thead>
            <tr>
              <th>Patient</th>
              <th>Item</th>
              <th>Supplier</th>
              <th>Expected</th>
              <th>Received</th>
              <th>Status</th>
              <th class="right">
                Action
                <span v-if="showWorkflow" class="tag">one next step</span>
              </th>
              <th class="chev-col"><span class="sr">Details</span></th>
            </tr>
          </thead>
          <tbody>
            <template v-for="o in rows" :key="o.id">
              <tr class="order" :class="{ open: expanded.has(o.id) }">
                <td class="c-patient">
                  <div class="patient">
                    <span class="avatar" :style="{ '--c': `var(${tint(o.patient)})` }" aria-hidden="true">{{ initials(o.patient) }}</span>
                    <div class="stack">
                      <span class="strong ellipsis">{{ o.patient }}</span>
                      <span class="muted">{{ o.phone }}</span>
                    </div>
                  </div>
                </td>
                <td class="c-item">
                  <div class="stack">
                    <span class="strong ellipsis item">
                      <svg v-if="o.items[0].cold" class="cold" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-label="Cold chain"><path d="M12 2v20M4.9 7l14.2 10M4.9 17 19.1 7" /></svg>
                      {{ o.items[0].name }}
                    </span>
                    <span class="muted">
                      <button v-if="o.items.length > 1" type="button" class="more" @click="toggle(o.id)">+{{ o.items.length - 1 }} more</button>
                      <template v-if="o.items.length > 1"> · </template>{{ o.id }} · {{ o.items[0].qty }}
                    </span>
                  </div>
                </td>
                <td class="c-supplier strong ellipsis" data-label="Supplier">{{ o.supplier }}</td>
                <td class="c-expected num" data-label="Expected">{{ fmtDate(o.expected) }}</td>
                <td class="c-received num muted" data-label="Received">{{ fmtDate(o.received) }}</td>
                <td class="c-status">
                  <span class="status" :style="{ '--c': `var(${statuses[o.status].color})` }">{{ statuses[o.status].label }}</span>
                </td>
                <td class="c-action right">
                  <button type="button" class="action" :class="{ ghost: o.status === 'dispatched' }" @click="act(o)">
                    {{ statuses[o.status].action }}
                  </button>
                </td>
                <td class="c-chev chev-col">
                  <button type="button" class="chev" :aria-expanded="expanded.has(o.id)" :aria-label="`Details for ${o.id}`" @click="toggle(o.id)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                  </button>
                </td>
              </tr>
              <tr v-if="expanded.has(o.id)" class="detail">
                <td colspan="8">
                  <div class="detail-grid">
                    <div>
                      <div class="label">Items</div>
                      <ul>
                        <li v-for="i in o.items" :key="i.name">
                          <span>{{ i.name }}<span v-if="i.cold" class="cold-tag">Cold chain</span></span>
                          <span class="num">× {{ i.qty }}</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <div class="label">Deliver to</div>
                      <div>{{ o.address.line }}</div>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
            <tr v-if="!rows.length">
              <td colspan="8" class="empty">No orders match your search.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <footer class="pager">
        <span class="muted">{{ rangeLabel }}</span>
        <nav class="pages" aria-label="Pagination">
          <button type="button" class="pg" :disabled="page === 1" aria-label="Previous page" @click="page--">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <button
            v-for="n in pageCount"
            :key="n"
            type="button"
            class="pg"
            :class="{ on: page === n }"
            :aria-current="page === n ? 'page' : undefined"
            @click="page = n"
          >
            {{ n }}
          </button>
          <button type="button" class="pg" :disabled="page === pageCount" aria-label="Next page" @click="page++">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6" /></svg>
          </button>
        </nav>
      </footer>
    </div>

    <DispatchModal :order="dispatching" :show-workflow="showWorkflow" @close="dispatching = null" @send="onSend" />
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
.tag {
  margin-left: 6px;
  padding: 1px 6px;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 10px;
  font-weight: 500;
}
/* Fill the whole main area (cancels its padding) with the MyConsumables navy. */
.page {
  margin: calc(-1 * var(--main-pad-y)) calc(-1 * var(--main-pad-x));
  padding: var(--main-pad-y) var(--main-pad-x);
  min-height: calc(100% + 2 * var(--main-pad-y));
  background: var(--brand-myconsumables);
  color: var(--on-brand);
  /* Buttons, tabs and highlights on this page use the navy instead of the default green. */
  --accent: var(--brand-myconsumables);
  --accent-soft: color-mix(in srgb, var(--brand-myconsumables) 10%, var(--surface));
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
}
p {
  margin: 0;
  font-size: 15px;
  color: var(--on-brand-muted);
}
.switch:focus-visible,
.tabs button:focus-visible {
  outline-color: var(--on-brand);
}
.toolbar {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.search {
  height: 44px;
  padding: 0 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 10px;
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
.tabs {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.tabs button {
  height: 32px;
  padding: 0 10px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--surface);
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.tabs button:hover {
  background: var(--hover);
}
.tabs button.on {
  border-color: var(--accent);
  background: var(--accent-soft);
  color: var(--accent);
}
.count {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-subtle);
}
.tabs button.on .count {
  color: var(--accent);
}
.card {
  color: var(--text);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}
.scroll {
  overflow-x: auto;
}
table {
  width: 100%;
  min-width: 920px;
  border-collapse: collapse;
  font-size: 14px;
}
th {
  height: 44px;
  padding: 0 12px;
  text-align: left;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
  font-family: var(--font-mono);
  border-bottom: 1px solid var(--border);
  background: var(--surface-muted);
  white-space: nowrap;
}
td {
  height: 68px;
  padding: 0 12px;
  border-bottom: 1px solid var(--border-soft);
  vertical-align: middle;
}
tbody tr:not(.detail):hover {
  background: var(--surface-muted);
}
tr.open td {
  border-bottom-color: transparent;
}
.right {
  text-align: right;
}
.patient {
  display: flex;
  align-items: center;
  gap: 12px;
}
.avatar {
  width: 36px;
  height: 36px;
  flex: none;
  border-radius: 50%;
  background: var(--c);
  color: var(--surface);
  font-size: 12px;
  font-weight: 600;
  display: grid;
  place-items: center;
}
.stack {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.strong {
  font-weight: 500;
  color: var(--text);
}
.muted {
  font-size: 13px;
  color: var(--text-muted);
}
.ellipsis {
  max-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.item {
  display: flex;
  align-items: center;
  gap: 6px;
}
.cold {
  flex: none;
  color: var(--accent);
}
.more {
  padding: 0;
  border: 0;
  background: none;
  color: var(--accent);
  font: inherit;
  font-weight: 500;
  cursor: pointer;
}
.more:hover {
  text-decoration: underline;
}
.num {
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--c) 12%, transparent);
  color: var(--c);
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}
.status::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}
.action {
  min-width: 120px;
  height: 34px;
  padding: 0 14px;
  border: 0;
  border-radius: var(--radius-sm);
  background: var(--accent);
  color: var(--surface);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}
.action:hover {
  background: color-mix(in srgb, var(--accent) 88%, var(--text));
}
.action.ghost {
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
}
.action.ghost:hover {
  background: var(--hover);
}
.chev-col {
  width: 48px;
  padding: 0 8px 0 0;
}
.chev {
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
.chev:hover {
  background: var(--hover);
  color: var(--text);
}
.chev svg {
  transition: transform 0.15s;
}
.chev[aria-expanded='true'] svg {
  transform: rotate(180deg);
}
.detail td {
  height: auto;
  padding: 0 16px 16px 64px;
  background: var(--surface);
}
.detail-grid {
  padding: 14px 16px;
  border-radius: var(--radius-md);
  background: var(--surface-muted);
  border: 1px solid var(--border-soft);
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 24px;
  font-size: 13px;
}
.label {
  margin-bottom: 6px;
  font-size: 11px;
  color: var(--text-muted);
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
li {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}
.cold-tag {
  margin-left: 8px;
  padding: 1px 6px;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 11px;
  font-weight: 500;
}
.empty {
  height: 120px;
  text-align: center;
  color: var(--text-muted);
}
.pager {
  height: 56px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.pages {
  display: flex;
  gap: 4px;
}
.pg {
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--text);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  display: grid;
  place-items: center;
}
.pg:hover:not(:disabled) {
  background: var(--hover);
}
.pg.on {
  border-color: var(--accent);
  background: var(--accent-soft);
  color: var(--accent);
}
.pg:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
/* Phones: each order becomes a card instead of a 920px-wide row. */
@media (max-width: 768px) {
  .scroll {
    overflow-x: visible;
  }
  table {
    min-width: 0;
  }
  table,
  tbody,
  tr,
  td {
    display: block;
  }
  thead {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
  }
  tr.order {
    padding: 14px 12px 14px 16px;
    border-bottom: 1px solid var(--border-soft);
    display: grid;
    grid-template-columns: 1fr 1fr auto;
    grid-template-areas:
      'patient patient chev'
      'item item item'
      'supplier supplier supplier'
      'expected received received'
      'status action action';
    align-items: center;
    gap: 12px;
  }
  tr.order.open {
    border-bottom-color: transparent;
  }
  tr.order td {
    height: auto;
    padding: 0;
    border: 0;
  }
  .c-patient {
    grid-area: patient;
  }
  .c-item {
    grid-area: item;
  }
  .c-supplier {
    grid-area: supplier;
  }
  .c-expected {
    grid-area: expected;
  }
  .c-received {
    grid-area: received;
  }
  .c-status {
    grid-area: status;
  }
  .c-action {
    grid-area: action;
  }
  .c-chev {
    grid-area: chev;
    width: auto;
  }
  td[data-label]::before {
    content: attr(data-label);
    display: block;
    margin-bottom: 2px;
    font-size: 11px;
    font-weight: 400;
    color: var(--text-muted);
    font-family: var(--font-mono);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .ellipsis {
    max-width: none;
  }
  .action {
    min-width: 0;
    height: 40px;
  }
  .detail {
    border-bottom: 1px solid var(--border-soft);
  }
  .detail td {
    padding: 0 12px 14px 16px;
  }
  .detail-grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }
  .pager {
    height: auto;
    padding: 12px 16px;
    flex-wrap: wrap;
    gap: 10px;
  }
  .pages {
    flex-wrap: wrap;
  }
}
.sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}
</style>
