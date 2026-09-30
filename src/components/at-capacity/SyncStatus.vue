<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { services, sync } from '@/data/atCapacity'

defineProps({ showApi: { type: Boolean, default: false } })

const MIN_MS = 60 * 1000
// How long the demo sync takes. The real one waits on the Google Ads API.
const RUN_MS = 1800

const lastSyncedAt = ref(Date.now() - sync.lastSyncedMinutesAgo * MIN_MS)
const syncing = ref(false)
const justSynced = ref(false)
const now = ref(Date.now())
let clock = null
let runTimer = null
let doneTimer = null

onMounted(() => (clock = setInterval(() => (now.value = Date.now()), 15 * 1000)))
onBeforeUnmount(() => {
  clearInterval(clock)
  clearTimeout(runTimer)
  clearTimeout(doneTimer)
})

const minsAgo = computed(() => Math.floor((now.value - lastSyncedAt.value) / MIN_MS))
const lastLabel = computed(() => (minsAgo.value < 1 ? 'just now' : `${minsAgo.value} min ago`))
const exact = computed(() =>
  new Date(lastSyncedAt.value).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
)

const run = () => {
  if (syncing.value) return
  syncing.value = true
  justSynced.value = false
  runTimer = setTimeout(() => {
    lastSyncedAt.value = now.value = Date.now()
    syncing.value = false
    justSynced.value = true
    doneTimer = setTimeout(() => (justSynced.value = false), 2500)
  }, RUN_MS)
}
</script>

<template>
  <div class="zone" :class="{ 'show-api': showApi }">
    <div v-if="showApi" class="endpoints">
      <span class="endpoint"><b>GET</b> {{ sync.status }}</span>
      <span class="endpoint"><b>POST</b> {{ sync.run }}</span>
    </div>
    <div class="sync">
      <span class="dot" :class="{ busy: syncing }" aria-hidden="true"></span>
      <div class="text" role="status">
        <template v-if="syncing">Syncing {{ services.length }} services with Google Ads…</template>
        <template v-else-if="justSynced">Synced with Google Ads just now</template>
        <template v-else>
          Google Ads synced <time :title="exact">{{ lastLabel }}</time>
        </template>
        <span class="sub">· auto every {{ sync.everyMinutes }} min</span>
      </div>
      <button type="button" class="btn" :disabled="syncing" @click="run">
        <svg :class="{ spin: syncing }" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 0 1-15.5 6.2L3 16" /><path d="M3 12a9 9 0 0 1 15.5-6.2L21 8" /><path d="M21 3v5h-5" /><path d="M3 21v-5h5" /></svg>
        {{ syncing ? 'Syncing' : 'Sync now' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.zone {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  border-radius: var(--radius-sm);
  outline: 1px dashed transparent;
  outline-offset: 6px;
  transition: outline-color 0.15s;
}
.zone.show-api {
  outline-color: var(--accent);
}
.endpoints {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: flex-end;
}
.endpoint {
  padding: 2px 8px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--accent);
  background: var(--accent-soft);
  border-radius: 999px;
  white-space: nowrap;
}
.endpoint b {
  font-weight: 700;
}
.sync {
  display: flex;
  align-items: center;
  gap: 12px;
}
.dot {
  width: 8px;
  height: 8px;
  flex: none;
  border-radius: 50%;
  background: var(--status-confirmed);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--status-confirmed) 18%, transparent);
}
.dot.busy {
  background: var(--status-pending);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--status-pending) 18%, transparent);
}
.text {
  display: flex;
  align-items: baseline;
  gap: 6px;
  white-space: nowrap;
  font-size: 13px;
  font-weight: 500;
  color: var(--text);
  text-align: right;
}
time {
  color: var(--text);
}
.sub {
  font-size: 12px;
  font-weight: 400;
  color: var(--text-muted);
  font-family: var(--font-mono);
}
.btn {
  height: 40px;
  padding: 0 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
  color: var(--text);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}
.btn:hover:not(:disabled) {
  background: var(--hover);
}
.btn:disabled {
  color: var(--text-muted);
  cursor: progress;
}
.spin {
  animation: spin 0.9s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
@media (max-width: 640px) {
  .zone {
    align-items: flex-start;
    max-width: 100%;
  }
  .endpoints {
    justify-content: flex-start;
  }
  .sync {
    width: 100%;
  }
  .text {
    flex: 1;
    min-width: 0;
    flex-wrap: wrap;
    row-gap: 2px;
    white-space: normal;
    text-align: left;
  }
  .sub {
    white-space: nowrap;
  }
  .btn {
    flex: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .spin {
    animation: none;
  }
}
</style>
