<script setup>
import { engagementLabel, projects } from '@/data/projects'
import { formatRange } from '@/utils/dates'
</script>

<template>
  <section class="section">
    <h2>Work</h2>
    <div class="cards">
      <RouterLink
        v-for="p in projects"
        :key="p.slug"
        :to="`/projects/${p.slug}`"
        class="card"
      >
        <div class="top">
          <img class="logo" :src="p.logo" alt="" aria-hidden="true" />
          <span v-if="engagementLabel(p)" class="role">{{ engagementLabel(p) }}</span>
        </div>

        <div class="text">
          <div class="name">{{ p.name }}</div>
          <div v-if="p.role" class="position">{{ p.role }}</div>
          <p>{{ p.tagline }}</p>
        </div>

        <ul v-if="p.stack.length" class="stack">
          <li v-for="s in p.stack" :key="s">{{ s }}</li>
        </ul>

        <div class="foot">
          <span class="meta">{{ p.start ? formatRange(p.start, p.end) : 'Dates TBD' }}</span>
          <span class="open">
            View demo
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>
          </span>
        </div>
      </RouterLink>
    </div>
  </section>
</template>

<style scoped>
.section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}
.cards {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}
.card {
  padding: 20px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  gap: 14px;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.card:hover {
  border-color: var(--border-dashed);
  box-shadow: 0 4px 16px -8px var(--border-dashed);
}
.top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.logo {
  width: 36px;
  height: 36px;
  object-fit: contain;
}
.role {
  padding: 3px 8px;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
}
.text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.name {
  font-size: 16px;
  font-weight: 600;
}
.position {
  margin-bottom: 4px;
  font-size: 13px;
  font-weight: 500;
  color: var(--accent);
}
p {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-muted);
}
.stack {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.stack li {
  padding: 3px 8px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface-muted);
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-muted);
}
.foot {
  margin-top: auto;
  padding-top: 14px;
  border-top: 1px solid var(--border-soft);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 13px;
}
.meta {
  color: var(--text-subtle);
}
.open {
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
  white-space: nowrap;
}
.card:hover .open svg {
  transform: translateX(2px);
}
.open svg {
  transition: transform 0.15s;
}
@media (max-width: 900px) {
  .cards {
    grid-template-columns: 1fr;
  }
}
</style>
