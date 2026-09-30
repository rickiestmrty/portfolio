<script setup>
defineProps({
  label: { type: String, required: true },
})

const model = defineModel({ type: Boolean, required: true })
</script>

<template>
  <button
    type="button"
    role="switch"
    class="switch"
    :class="{ on: model }"
    :aria-checked="model"
    :aria-label="label"
    @click="model = !model"
  >
    <span class="knob"></span>
  </button>
</template>

<style scoped>
.switch {
  position: relative;
  flex-shrink: 0;
  width: 44px;
  height: 26px;
  padding: 0;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--active);
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}
.switch.on {
  background: var(--accent);
  border-color: var(--accent);
}
.knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--surface);
  box-shadow: 0 1px 2px rgba(24, 24, 27, 0.2);
  transition: transform 0.25s cubic-bezier(0.3, 0.7, 0.2, 1);
}
.switch.on .knob {
  transform: translateX(18px);
}
</style>
