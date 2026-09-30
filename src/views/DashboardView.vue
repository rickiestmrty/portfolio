<script setup>
import ActivityGrid from '@/components/dashboard/ActivityGrid.vue'
import ProjectCards from '@/components/dashboard/ProjectCards.vue'
import { profile } from '@/data/profile'
</script>

<template>
  <div class="page">
    <div class="head">
      <h1>Hi, I'm {{ profile.firstName }}.</h1>
      <p>{{ profile.summary }}</p>
      <div class="pills">
        <span class="pill">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
          {{ profile.title }} · {{ profile.experience }}
        </span>
        <span class="pill">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
          {{ profile.location }}
        </span>
      </div>
    </div>

    <ActivityGrid />
    <ProjectCards />
  </div>
</template>

<style scoped>
.page {
  max-width: 1080px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}
.head {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
h1 {
  margin: 0;
  font-size: 30px;
  font-weight: 600;
  letter-spacing: -0.02em;
}
p {
  margin: 0;
  font-size: 15px;
  line-height: 1.5;
  color: var(--text-muted);
}
.pills {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.pill {
  padding: 5px 10px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--surface);
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text-muted);
}
</style>
