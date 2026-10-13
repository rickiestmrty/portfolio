<script setup>
// Frames a project's interactive demo so it doesn't read as part of the case study below it.
// Tints come from currentColor, so the frame works on every project page background.
defineProps({
  title: { type: String, required: true },
  intro: { type: String, default: '' },
  label: { type: String, default: 'Interactive demo · sample data' },
})
</script>

<template>
  <section class="demo" aria-labelledby="demo-title">
    <header class="head">
      <span class="eyebrow">{{ label }}</span>
      <h2 id="demo-title">{{ title }}</h2>
      <p v-if="intro">{{ intro }}</p>
    </header>
    <slot />
  </section>
</template>

<style scoped>
.demo {
  padding: 20px;
  border: 1px dashed color-mix(in srgb, currentColor 45%, transparent);
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, currentColor 5%, transparent);
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.head {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.eyebrow {
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: color-mix(in srgb, currentColor 75%, transparent);
}
h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  letter-spacing: -0.01em;
}
p {
  margin: 0;
  font-size: 15px;
  color: color-mix(in srgb, currentColor 85%, transparent);
}
@media (max-width: 768px) {
  .demo {
    padding: 12px;
  }
}
</style>
