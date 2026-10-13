<script setup>
import { computed } from 'vue'
import { findProject } from '@/data/projects'

const props = defineProps({ slug: { type: String, required: true } })

const study = computed(() => findProject(props.slug)?.study ?? null)
const rows = computed(() =>
  study.value
    ? [
        { label: 'Problem', text: study.value.problem },
        { label: 'What I built', text: study.value.built },
        { label: 'Result', text: study.value.result },
      ]
    : [],
)
const isTodo = (text) => text.startsWith('TODO')
</script>

<template>
  <section v-if="study" class="facts" aria-label="Project summary">
    <dl>
      <div v-for="row in rows" :key="row.label" class="row">
        <dt>{{ row.label }}</dt>
        <dd :class="{ todo: isTodo(row.text) }">{{ row.text }}</dd>
      </div>
    </dl>
    <a v-if="study.repo" :href="study.repo" target="_blank" rel="noopener noreferrer" class="code">
      View code
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7" /><path d="M7 7h10v10" /></svg>
    </a>
  </section>
</template>

<style scoped>
/* Own surface and text color, because the project pages behind it are green, lime, navy or plain. */
.facts {
  padding: 20px 24px;
  background: var(--surface);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  gap: 16px;
}
dl {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.row {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr);
  gap: 16px;
}
dt {
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-subtle);
  padding-top: 2px;
}
dd {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
}
dd.todo {
  justify-self: start;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  background: var(--warning-soft);
  color: var(--warning);
}
.code {
  align-self: flex-start;
  height: 36px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
}
.code:hover {
  background: var(--hover);
}
@media (max-width: 640px) {
  .row {
    grid-template-columns: 1fr;
    gap: 2px;
  }
}
</style>
