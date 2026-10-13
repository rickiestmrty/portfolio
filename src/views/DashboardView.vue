<script setup>
import ActivityGrid from '@/components/dashboard/ActivityGrid.vue'
import ProjectCards from '@/components/dashboard/ProjectCards.vue'
import { profile } from '@/data/profile'
import { projects } from '@/data/projects'

// Years and the user count are facts from the resume and Go Overbooked's case study.
// The product counts come from the project list, so they follow it automatically.
const stats = [
  { value: profile.experience, label: 'Experience' },
  { value: String(projects.length), label: 'Products built' },
  { value: profile.stats.users, label: 'Users on my own product' },
  { value: String(projects.filter((p) => p.engagement === 'founder').length), label: 'Product founded' },
]
</script>

<template>
  <div class="page">
    <section class="hero">
      <div class="meta">
        <span>{{ profile.title }}</span>
        <span aria-hidden="true">·</span>
        <span>{{ profile.location }}</span>
      </div>
      <h1>{{ profile.headline }}</h1>
      <p class="summary">{{ profile.summary }}</p>

      <div class="actions">
        <RouterLink to="/hire-me" class="btn primary">Hire me</RouterLink>
        <a :href="profile.resume" :download="profile.resumeFileName" class="btn">Resume</a>
        <span class="status">
          <span class="status-dot" aria-hidden="true"></span>
          {{ profile.availability }}
        </span>
      </div>
    </section>

    <ul class="stats">
      <li v-for="s in stats" :key="s.label">
        <span class="value">{{ s.value }}</span>
        <span class="label">{{ s.label }}</span>
      </li>
    </ul>

    <ProjectCards />
    <ActivityGrid />
  </div>
</template>

<style scoped>
.page {
  max-width: var(--content-max);
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  gap: 32px;
}
.hero {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.meta {
  display: flex;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-subtle);
}
h1 {
  margin: 0;
  max-width: 22ch;
  font-size: 36px;
  font-weight: 600;
  line-height: 1.15;
  letter-spacing: -0.02em;
}
.summary {
  margin: 0;
  max-width: 62ch;
  font-size: 16px;
  line-height: 1.55;
  color: var(--text-muted);
}
.actions {
  margin-top: 8px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px 12px;
}
.btn {
  height: 38px;
  padding: 0 16px;
  border: 1px solid var(--border-dashed);
  border-radius: var(--radius-md);
  background: var(--surface);
  color: var(--text);
  font-size: 14px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  transition: background 0.15s, border-color 0.15s;
}
.btn:hover {
  background: var(--hover);
}
.btn.primary {
  border-color: var(--text);
  background: var(--text);
  color: var(--on-brand);
}
.btn.primary:hover {
  border-color: var(--accent);
  background: var(--accent);
}
.status {
  margin-left: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text-muted);
}
.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--status-confirmed);
  flex-shrink: 0;
}
.stats {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
}
.stats li {
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.stats li + li {
  border-left: 1px solid var(--border-soft);
}
.value {
  font-size: 26px;
  font-weight: 600;
  letter-spacing: -0.02em;
}
.label {
  font-size: 13px;
  color: var(--text-muted);
}
@media (max-width: 768px) {
  h1 {
    font-size: 28px;
  }
  .stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .stats li:nth-child(3) {
    border-left: 0;
  }
  .stats li:nth-child(n + 3) {
    border-top: 1px solid var(--border-soft);
  }
}
</style>
