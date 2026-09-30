<script setup>
defineProps({
  section: { type: String, required: true },
  title: { type: String, required: true },
})
</script>

<template>
  <div class="page">
    <div class="head">
      <div class="crumb">{{ section }} / {{ title }}</div>
      <h1>{{ title }}</h1>
      <p>[Placeholder: short description for {{ title }}]</p>
    </div>

    <div class="metrics">
      <div v-for="n in 3" :key="n" class="card">
        <div class="card-label">[Metric {{ n }}]</div>
        <div class="skeleton"></div>
      </div>
    </div>

    <div class="content">
      <slot>
        <div class="content-title">{{ title }} content</div>
        <div class="content-sub">Placeholder. Content comes later.</div>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.page {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.head {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.crumb {
  font-size: 13px;
  color: var(--text-muted);
  font-family: var(--font-mono);
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
  color: var(--text-muted);
}
.metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}
.card {
  height: 120px;
  padding: 20px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.card-label {
  font-size: 13px;
  color: var(--text-muted);
}
.skeleton {
  width: 96px;
  height: 24px;
  border-radius: 6px;
  background: var(--border-soft);
}
.content {
  flex: 1;
  min-height: 360px;
  border: 1.5px dashed var(--border-dashed);
  border-radius: var(--radius-lg);
  background: var(--surface-muted);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.content-title {
  font-size: 15px;
  font-weight: 600;
  color: #3f3e39;
}
.content-sub {
  font-size: 13px;
  color: var(--text-muted);
}
@media (max-width: 900px) {
  .metrics {
    grid-template-columns: 1fr;
  }
}
</style>
