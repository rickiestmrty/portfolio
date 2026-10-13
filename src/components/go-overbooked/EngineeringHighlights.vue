<script setup>
import { computed, ref } from 'vue'
import { highlights } from '@/data/goOverbooked'

const selectedId = ref(highlights[0].id)
const current = computed(() => highlights.find((h) => h.id === selectedId.value))
</script>

<template>
  <section class="card" aria-labelledby="highlights-title">
    <header class="top">
      <h2 id="highlights-title">Engineering highlights</h2>
      <span class="meta">Pick one to see how it works</span>
    </header>

    <div class="body">
      <ul class="list">
        <li v-for="(h, i) in highlights" :key="h.id">
          <button
            type="button"
            class="item"
            :class="{ active: h.id === selectedId }"
            :aria-pressed="h.id === selectedId"
            aria-controls="highlight-detail"
            @click="selectedId = h.id"
          >
            <span class="num">{{ String(i + 1).padStart(2, '0') }}</span>
            <span class="item-text">
              <span class="name">{{ h.name }}</span>
              <span class="title">{{ h.title }}</span>
            </span>
          </button>
        </li>
      </ul>

      <div id="highlight-detail" class="detail" aria-live="polite">
        <h3>{{ current.name }}</h3>
        <p class="summary">{{ current.summary }}</p>
        <div class="label">How it works</div>
        <ul class="points">
          <li v-for="pt in current.points" :key="pt">{{ pt }}</li>
        </ul>
        <div class="foot">
          <span class="tech">{{ current.tech.join(' · ') }}</span>
          <a v-if="current.link" :href="current.link.href" target="_blank" rel="noopener noreferrer" class="try">
            {{ current.link.label }}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7" /><path d="M7 7h10v10" /></svg>
          </a>
        </div>
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
.tech,
.num,
.label {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-muted);
}

/* List of highlights on the left, the selected one on the right. */
.body {
  display: grid;
  grid-template-columns: minmax(240px, 320px) minmax(0, 1fr);
}
.list {
  margin: 0;
  padding: 12px;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 2px;
  border-right: 1px solid var(--border);
}
.item {
  width: 100%;
  padding: 10px 12px;
  border: 0;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text);
  text-align: left;
  cursor: pointer;
  display: flex;
  gap: 12px;
}
.item:hover {
  background: var(--hover);
}
.item.active {
  background: var(--active);
}
.num {
  padding-top: 1px;
  font-size: 11px;
  color: var(--text-subtle);
}
.item-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.name {
  font-size: 14px;
  font-weight: 500;
}
.item.active .name,
.item.active .num {
  color: var(--accent);
  font-weight: 600;
}
.title {
  font-size: 13px;
  line-height: 1.4;
  color: var(--text-muted);
}

.detail {
  padding: 20px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
}
.summary {
  margin: 0;
  font-size: 18px;
  line-height: 1.4;
  letter-spacing: -0.01em;
}
.label {
  margin-top: 4px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-subtle);
}
.points {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.points li {
  position: relative;
  padding-left: 18px;
  font-size: 14px;
  line-height: 1.5;
}
.points li::before {
  content: '';
  position: absolute;
  left: 2px;
  top: 0.6em;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
}
.foot {
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid var(--border-soft);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px 16px;
  flex-wrap: wrap;
}
.try {
  height: 34px;
  padding: 0 12px;
  border-radius: var(--radius-md);
  background: var(--accent);
  color: var(--on-brand);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
}
.try:hover {
  background: color-mix(in srgb, var(--accent) 85%, var(--text));
}

@media (max-width: 768px) {
  .body {
    grid-template-columns: minmax(0, 1fr);
  }
  .list {
    border-right: 0;
    border-bottom: 1px solid var(--border);
  }
  .detail {
    padding: 16px;
  }
  .summary {
    font-size: 16px;
  }
}
</style>
