<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { dollars, fmtOdds } from './odds'

const props = defineProps({
  runner: { type: Object, default: null },
  bookie: { type: Object, default: null },
  cell: { type: Object, default: null },
  raceName: { type: String, required: true },
  showStack: { type: Boolean, default: false },
})
const emit = defineEmits(['close', 'place'])

const QUICK_STAKES = [5, 10, 25, 50]

const open = computed(() => Boolean(props.runner && props.cell))
const stake = ref(10)
const placedAt = ref(null)
const stakeInput = ref(null)

// Price at the moment the modal opened, so we can tell the user if it moved.
const openedAt = ref(null)
const odds = computed(() => placedAt.value ?? props.cell?.odds ?? 0)
const moved = computed(() => !placedAt.value && openedAt.value !== null && props.cell?.odds !== openedAt.value)
const validStake = computed(() => Number.isFinite(stake.value) && stake.value > 0)
const returns = computed(() => (validStake.value ? stake.value * odds.value : 0))

const place = () => {
  if (!validStake.value) return
  placedAt.value = props.cell.odds
  emit('place', { runner: props.runner.name, bookie: props.bookie.id, odds: placedAt.value, stake: stake.value })
}

const onKey = (e) => {
  if (e.key === 'Escape' && open.value) emit('close')
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

watch(
  () => [props.runner?.id, props.bookie?.id],
  async () => {
    placedAt.value = null
    stake.value = 10
    openedAt.value = props.cell?.odds ?? null
    if (open.value) {
      await nextTick()
      stakeInput.value?.focus()
      stakeInput.value?.select()
    }
  },
)
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="backdrop" @click="emit('close')"></div>
    </Transition>
    <Transition name="pop">
      <div v-if="open" class="modal" role="dialog" aria-modal="true" aria-labelledby="bet-title">
        <header class="top">
          <div class="crumb">{{ raceName }} · Win</div>
          <button class="close" aria-label="Close" @click="emit('close')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </header>

        <div v-if="!placedAt" class="body">
          <div class="pick">
            <div>
              <h2 id="bet-title">{{ runner.number }}. {{ runner.name }}</h2>
              <div class="sub">{{ runner.jockey }} · Barrier {{ runner.barrier }}</div>
            </div>
            <div class="price" :class="cell.dir">
              <span class="price-val">{{ fmtOdds(cell.odds) }}</span>
              <span class="bookie">
                <span class="badge" :style="{ '--c': `var(${bookie.color})` }" aria-hidden="true">{{ bookie.initials }}</span>
                {{ bookie.name }}
              </span>
            </div>
          </div>

          <p v-if="moved" class="notice" role="status">
            Price moved from {{ fmtOdds(openedAt) }} to {{ fmtOdds(cell.odds) }}. You will get the price at the moment you place.
          </p>

          <form class="form" @submit.prevent="place">
            <label class="label" for="stake">Stake</label>
            <div class="stake">
              <span class="prefix">$</span>
              <input
                id="stake"
                ref="stakeInput"
                v-model.number="stake"
                type="number"
                min="1"
                step="1"
                inputmode="decimal"
              />
            </div>
            <div class="quick">
              <button
                v-for="q in QUICK_STAKES"
                :key="q"
                type="button"
                :class="{ on: stake === q }"
                @click="stake = q"
              >
                ${{ q }}
              </button>
            </div>

            <dl>
              <dt>Odds</dt>
              <dd>{{ fmtOdds(odds) }}</dd>
              <dt class="total">Potential return</dt>
              <dd class="total">{{ dollars(returns) }}</dd>
            </dl>

            <button type="submit" class="primary" :disabled="!validStake">
              Place bet · {{ dollars(validStake ? stake : 0) }}
            </button>
            <div class="fine">Demo only. No real money is used.</div>
            <div v-if="showStack" class="tag">mutation placeBet → Supabase public.bets</div>
          </form>
        </div>

        <div v-else class="body done">
          <div class="check" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
          </div>
          <h2 id="bet-title">Bet placed</h2>
          <p class="summary">
            {{ dollars(stake) }} on <strong>{{ runner.name }}</strong> at {{ fmtOdds(placedAt) }} with {{ bookie.name }}.
            Returns {{ dollars(returns) }} if it wins.
          </p>
          <button type="button" class="primary" @click="emit('close')">Done</button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(24, 24, 27, 0.28);
  z-index: 50;
}
.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: min(420px, calc(100vw - 32px));
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: 0 20px 48px rgba(24, 24, 27, 0.14);
  z-index: 51;
}
.top {
  height: 52px;
  padding: 0 10px 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border);
}
.crumb {
  font-size: 13px;
  color: var(--text-muted);
  font-family: var(--font-mono);
}
.close {
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: var(--radius-sm);
  background: none;
  color: var(--text-muted);
  cursor: pointer;
  display: grid;
  place-items: center;
}
.close:hover {
  background: var(--hover);
  color: var(--text);
}
.body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.pick {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}
h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.02em;
}
.sub {
  margin-top: 2px;
  font-size: 13px;
  color: var(--text-muted);
}
.price {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}
.price-val {
  font-size: 26px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
  transition: color 0.3s;
}
.price.up .price-val {
  color: var(--status-confirmed);
}
.price.down .price-val {
  color: var(--danger);
}
.bookie {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text-muted);
}
.badge {
  width: 18px;
  height: 18px;
  border-radius: 5px;
  background: var(--c);
  color: var(--surface);
  font-size: 10px;
  font-weight: 700;
  display: grid;
  place-items: center;
}
.notice {
  margin: 0;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  background: var(--today);
  color: var(--status-pending);
  font-size: 13px;
  line-height: 1.5;
}
.form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.label {
  font-size: 12px;
  color: var(--text-muted);
  font-family: var(--font-mono);
}
.stake {
  height: 44px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  gap: 6px;
}
.stake:focus-within {
  border-color: var(--accent);
}
.prefix {
  color: var(--text-muted);
}
.stake input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: 0;
  background: none;
  font: inherit;
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
}
.quick {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}
.quick button {
  height: 34px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--text);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}
.quick button:hover {
  background: var(--hover);
}
.quick button.on {
  border-color: var(--accent);
  background: var(--accent-soft);
  color: var(--accent);
}
dl {
  margin: 6px 0 4px;
  display: grid;
  grid-template-columns: 1fr auto;
  row-gap: 8px;
  font-size: 14px;
}
dt {
  color: var(--text-muted);
}
dd {
  margin: 0;
  font-weight: 500;
  text-align: right;
  font-variant-numeric: tabular-nums;
}
.total {
  padding-top: 8px;
  border-top: 1px solid var(--border-soft);
  color: var(--text);
  font-weight: 600;
}
.primary {
  height: 44px;
  border: 0;
  border-radius: var(--radius-md);
  background: var(--accent);
  color: var(--surface);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
.primary:hover {
  background: color-mix(in srgb, var(--accent) 88%, var(--text));
}
.primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.fine {
  font-size: 12px;
  color: var(--text-subtle);
  text-align: center;
}
.tag {
  align-self: center;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent);
  font-family: var(--font-mono);
  font-size: 11px;
}
.done {
  align-items: center;
  text-align: center;
}
.check {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--status-confirmed) 14%, transparent);
  color: var(--status-confirmed);
  display: grid;
  place-items: center;
}
.summary {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-muted);
}
.summary strong {
  color: var(--text);
}
.done .primary {
  width: 100%;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.pop-enter-active,
.pop-leave-active {
  transition: opacity 0.2s, transform 0.2s ease;
}
.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: translate(-50%, -48%) scale(0.98);
}
</style>
