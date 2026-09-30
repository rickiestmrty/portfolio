<script setup>
import { computed } from 'vue'

const props = defineProps({
  // [{ value, label, disabled?, hint? }]
  options: { type: Array, required: true },
  label: { type: String, required: true },
  size: { type: String, default: 'md' },
})

const model = defineModel({ required: true })

const activeIndex = computed(() => props.options.findIndex((option) => option.value === model.value))
</script>

<template>
  <div
    class="segmented"
    :class="size"
    role="radiogroup"
    :aria-label="label"
    :style="{ '--count': options.length }"
  >
    <span class="thumb" :style="{ transform: `translateX(${activeIndex * 100}%)` }"></span>
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      role="radio"
      class="segment"
      :class="{ active: model === option.value }"
      :aria-checked="model === option.value"
      :disabled="option.disabled"
      :title="option.hint"
      @click="model = option.value"
    >
      <svg v-if="option.disabled" class="lock" viewBox="0 0 16 16" aria-hidden="true">
        <rect x="3" y="7" width="10" height="7" rx="1.5" />
        <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
      </svg>
      {{ option.label }}
    </button>
  </div>
</template>

<style scoped>
.segmented {
  position: relative;
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  padding: 4px;
  background: var(--active);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  isolation: isolate;
}
.thumb {
  position: absolute;
  top: 4px;
  bottom: 4px;
  left: 4px;
  width: calc((100% - 8px) / var(--count));
  background: var(--surface);
  border-radius: var(--radius-sm);
  box-shadow: 0 1px 2px rgba(24, 24, 27, 0.08), 0 0 0 1px var(--border);
  transition: transform 0.25s cubic-bezier(0.3, 0.7, 0.2, 1);
  z-index: -1;
}
.segment {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 96px;
  padding: 8px 14px;
  border: 0;
  background: transparent;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  color: var(--text-muted);
  white-space: nowrap;
  cursor: pointer;
  transition: color 0.2s;
}
.sm .segment {
  min-width: 64px;
  padding: 6px 12px;
  font-family: var(--font-mono);
  font-size: 12px;
}
.segment:hover:not(:disabled),
.segment.active {
  color: var(--text);
}
.segment:disabled {
  color: var(--text-subtle);
  opacity: 0.55;
  cursor: not-allowed;
}
.lock {
  width: 13px;
  height: 13px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.5;
  stroke-linecap: round;
}
@media (max-width: 600px) {
  .segmented {
    width: 100%;
  }
  .segment {
    min-width: 0;
    padding: 8px 6px;
  }
}
</style>
