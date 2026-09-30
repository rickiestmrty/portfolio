<script setup>
import { computed } from 'vue'

const props = defineProps({
  min: { type: Number, required: true },
  max: { type: Number, required: true },
  step: { type: Number, default: 1 },
  label: { type: String, required: true },
  valueText: { type: String, default: undefined },
  // accent | warning | danger
  tone: { type: String, default: 'accent' },
  // [{ value, label, below? }]. below puts the label under the track.
  markers: { type: Array, default: () => [] },
})

const model = defineModel({ type: Number, required: true })

const toPercent = (value) => ((value - props.min) / (props.max - props.min)) * 100

const percent = computed(() => toPercent(model.value))
</script>

<template>
  <div class="slider" :class="[tone, { 'has-above': markers.some((m) => !m.below) }]" :style="{ '--pct': `${percent}%` }">
    <input
      v-model.number="model"
      type="range"
      :min="min"
      :max="max"
      :step="step"
      :aria-label="label"
      :aria-valuetext="valueText"
    />
    <span
      v-for="marker in markers"
      :key="marker.label"
      class="marker"
      :class="{ reached: model >= marker.value, below: marker.below }"
      :style="{ left: `${toPercent(marker.value)}%` }"
    >
      <span class="marker-label">{{ marker.label }}</span>
    </span>
  </div>
</template>

<style scoped>
.slider {
  --fill: var(--accent);
  position: relative;
  height: 20px;
}
.slider.has-above {
  margin-top: 18px;
}
.slider.warning {
  --fill: var(--warning);
}
.slider.danger {
  --fill: var(--danger);
}
input {
  position: absolute;
  inset: 0;
  width: 100%;
  margin: 0;
  background: transparent;
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
  z-index: 1;
}
input::-webkit-slider-runnable-track {
  height: 6px;
  border-radius: 999px;
  background: linear-gradient(to right, var(--fill) var(--pct), var(--border) var(--pct));
}
input::-moz-range-track {
  height: 6px;
  border-radius: 999px;
  background: linear-gradient(to right, var(--fill) var(--pct), var(--border) var(--pct));
}
input::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  margin-top: -7px;
  border-radius: 50%;
  background: var(--surface);
  border: 2px solid var(--fill);
  box-shadow: 0 1px 3px rgba(24, 24, 27, 0.15);
  transition: transform 0.15s;
}
input::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--surface);
  border: 2px solid var(--fill);
  box-shadow: 0 1px 3px rgba(24, 24, 27, 0.15);
}
input:active::-webkit-slider-thumb {
  transform: scale(1.15);
}
input:focus-visible {
  outline: none;
}
input:focus-visible::-webkit-slider-thumb {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
.marker {
  position: absolute;
  top: 50%;
  width: 2px;
  height: 12px;
  margin-left: -1px;
  transform: translateY(-50%);
  border-radius: 1px;
  background: var(--border-dashed);
  pointer-events: none;
}
.marker.reached {
  background: var(--surface);
  opacity: 0.8;
}
.marker-label {
  position: absolute;
  bottom: 18px;
  left: 50%;
  transform: translateX(-50%);
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-subtle);
  white-space: nowrap;
}
.marker.below .marker-label {
  top: 18px;
  bottom: auto;
  color: var(--text);
}
</style>
