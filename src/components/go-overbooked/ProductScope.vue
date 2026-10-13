<script setup>
import { business, features } from '@/data/goOverbooked'
</script>

<template>
  <section class="card" aria-labelledby="product-title">
    <header class="top">
      <h2 id="product-title">Product and business</h2>
      <span class="meta">Freemium · Philippines and Southeast Asia</span>
    </header>

    <div class="cols">
      <div class="col">
        <h3>In the product</h3>
        <ul class="chips">
          <li v-for="f in features" :key="f">{{ f }}</li>
        </ul>
      </div>

      <div class="col">
        <h3>Pricing</h3>
        <dl class="plans">
          <div v-for="p in business.plans" :key="p.name" class="plan">
            <dt>{{ p.name }}</dt>
            <dd>
              <span v-if="p.price" class="price">{{ p.price }}</span>
              <span v-if="p.what">{{ p.what }}</span>
            </dd>
          </div>
        </dl>

        <h3>Beyond the code</h3>
        <ul class="work">
          <li v-for="w in business.work" :key="w">{{ w }}</li>
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
.meta {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-muted);
}
.cols {
  display: grid;
  grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
}
.col {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.col + .col {
  border-left: 1px solid var(--border);
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
h3:not(:first-child) {
  margin-top: 10px;
}
.chips {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.chips li {
  padding: 4px 10px;
  border: 1px solid var(--border);
  border-radius: 999px;
  font-size: 13px;
  color: var(--text-muted);
}
.plans {
  margin: 0;
  display: flex;
  flex-direction: column;
}
.plan {
  padding: 8px 0;
  display: grid;
  grid-template-columns: 130px minmax(0, 1fr);
  gap: 12px;
  font-size: 14px;
}
.plan + .plan {
  border-top: 1px solid var(--border-soft);
}
dt {
  font-weight: 600;
}
dd {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  color: var(--text-muted);
}
.price {
  font-weight: 500;
  color: var(--text);
}
.work {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.work li {
  position: relative;
  padding-left: 18px;
  font-size: 14px;
  line-height: 1.45;
}
.work li::before {
  content: '';
  position: absolute;
  left: 2px;
  top: 0.55em;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
}
@media (max-width: 900px) {
  .cols {
    grid-template-columns: minmax(0, 1fr);
  }
  .col {
    padding: 16px;
  }
  .col + .col {
    border-left: 0;
    border-top: 1px solid var(--border);
  }
}
@media (max-width: 480px) {
  .plan {
    grid-template-columns: minmax(0, 1fr);
    gap: 2px;
  }
}
</style>
