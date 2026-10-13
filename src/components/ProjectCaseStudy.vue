<script setup>
// The write-up under a project's demo: a rule, a title, then the Problem / What I built / Result block
// and any deeper sections passed in the slot. Tints come from currentColor, like ProjectDemo.
import ProjectFacts from '@/components/ProjectFacts.vue'

defineProps({
  slug: { type: String, required: true },
  title: { type: String, default: 'What I worked on' },
})
</script>

<template>
  <section class="case" aria-labelledby="case-title">
    <header class="head">
      <span class="eyebrow">Case study</span>
      <h2 id="case-title">{{ title }}</h2>
    </header>
    <ProjectFacts :slug="slug" />
    <slot />
  </section>
</template>

<style scoped>
.case {
  margin-top: 16px;
  padding-top: 32px;
  border-top: 1px solid color-mix(in srgb, currentColor 30%, transparent);
  display: flex;
  flex-direction: column;
  gap: 24px;
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
</style>
