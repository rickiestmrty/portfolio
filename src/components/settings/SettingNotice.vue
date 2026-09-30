<script setup>
defineProps({
  // warning | danger | success
  tone: { type: String, required: true },
})
</script>

<template>
  <div class="notice" :class="tone" role="status">
    <svg v-if="tone === 'success'" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" />
      <path d="m5.5 8.2 1.7 1.7 3.3-3.6" />
    </svg>
    <svg v-else viewBox="0 0 16 16" aria-hidden="true">
      <path d="M8 1.5 15 14H1L8 1.5Z" />
      <path d="M8 6v3.5M8 11.6v.1" />
    </svg>
    <span class="text"><slot /></span>
    <span v-if="$slots.action" class="action"><slot name="action" /></span>
  </div>
</template>

<style scoped>
.notice {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
}
.text {
  flex: 1;
}
.action {
  flex-shrink: 0;
  margin-left: 8px;
}
svg {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.warning {
  color: var(--warning);
  background: var(--warning-soft);
}
.danger {
  color: var(--danger);
  background: var(--danger-soft);
}
.success {
  color: var(--accent);
  background: var(--accent-soft);
}
</style>
