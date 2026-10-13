<script setup>
import { architecture } from '@/data/goOverbooked'
</script>

<template>
  <section class="card" aria-labelledby="system-title">
    <header class="top">
      <h2 id="system-title">How it’s built</h2>
      <span class="meta">4 repos · Supabase backend · Built and run by me</span>
    </header>

    <div class="map">
      <div v-for="group in architecture" :key="group.name" class="group">
        <h3>{{ group.name }}</h3>
        <ul>
          <li v-for="item in group.items" :key="item.name" class="node">
            <span class="node-name">{{ item.name }}</span>
            <span class="node-what">{{ item.what }}</span>
            <span v-if="item.tech.length" class="node-tech">{{ item.tech.join(' · ') }}</span>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped>
.card {
  background: var(--surface);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
}
.top {
  padding: 14px 20px;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 4px 16px;
  flex-wrap: wrap;
  background: var(--surface-muted);
  border-bottom: 1px solid var(--border);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}
h2 {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.01em;
}
.meta,
.node-tech {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-muted);
}
.map {
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
}
.group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
h3 {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-subtle);
}
ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.node {
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-left: 2px solid var(--accent);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  background: var(--surface-muted);
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.node-name {
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 600;
  color: var(--accent);
  overflow-wrap: anywhere;
}
.node-what {
  font-size: 13px;
  line-height: 1.45;
}
.node-tech {
  font-size: 11px;
}
@media (max-width: 900px) {
  .map {
    grid-template-columns: minmax(0, 1fr);
    padding: 16px;
  }
}
</style>
