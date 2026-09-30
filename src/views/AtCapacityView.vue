<script setup>
import { ref } from 'vue'
import ServiceCard from '@/components/at-capacity/ServiceCard.vue'
import SyncStatus from '@/components/at-capacity/SyncStatus.vue'
import { services } from '@/data/atCapacity'

defineProps({ title: { type: String, required: true } })

const showApi = ref(false)
</script>

<template>
  <div class="page">
    <div class="head">
      <div class="crumb">Work / {{ title }}</div>
      <h1>{{ title }}</h1>
      <p>
        An ad automation platform I helped build. It pauses Google Ads when a business is too busy to take new work, so
        no budget goes to leads it can't serve. The cards below are a demo. Hover over a day to see why its ads are paused.
      </p>
    </div>

    <div class="toolbar">
      <button
        type="button"
        role="switch"
        class="switch"
        :aria-checked="showApi"
        @click="showApi = !showApi"
      >
        <span class="knob" aria-hidden="true"></span>
        Show the API
      </button>
      <span class="hint">{{ showApi ? 'Each outlined area shows the endpoint I built to feed it.' : 'See which endpoint powers each part of the screen.' }}</span>
      <SyncStatus class="sync-status" :show-api="showApi" />
    </div>

    <ServiceCard v-for="service in services" :key="service.id" :service="service" :show-api="showApi" />
  </div>
</template>

<style scoped>
/* Fill the whole main area (cancels its padding) with a soft tint of the At Capacity lime.
   Full-strength lime is too bright to read text on. */
.page {
  margin: calc(-1 * var(--main-pad-y)) calc(-1 * var(--main-pad-x));
  padding: var(--main-pad-y) var(--main-pad-x);
  min-height: calc(100% + 2 * var(--main-pad-y));
  background: color-mix(in srgb, var(--brand-at-capacity) 28%, var(--bg));
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
  color: var(--text);
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
  color: var(--text);
}
.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
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
.hint {
  font-size: 13px;
  color: var(--text);
}
.sync-status {
  margin-left: auto;
}
@media (max-width: 640px) {
  .sync-status {
    margin-left: 0;
    width: 100%;
  }
}
</style>
