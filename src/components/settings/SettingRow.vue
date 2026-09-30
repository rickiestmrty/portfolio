<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  // Right-aligned text next to the title, such as a slider's current value.
  value: { type: String, default: '' },
})
</script>

<template>
  <div class="row">
    <div class="head">
      <div class="text">
        <div class="title">
          {{ title }}
          <span v-if="value" class="value">{{ value }}</span>
        </div>
        <div v-if="description" class="description">{{ description }}</div>
      </div>
      <slot />
    </div>
    <slot name="below" />
  </div>
</template>

<style scoped>
.row {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px 0;
}
.row + .row {
  border-top: 1px solid var(--border-soft);
}
.row:first-of-type {
  padding-top: 0;
}
.row:last-child {
  padding-bottom: 0;
}
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.text {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.title {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
}
.value {
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 500;
  color: var(--accent);
}
.description {
  font-size: 13px;
  color: var(--text-muted);
}
</style>
