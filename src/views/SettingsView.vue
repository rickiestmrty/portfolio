<script setup>
import { computed, ref } from 'vue'
import SegmentedControl from '@/components/settings/SegmentedControl.vue'
import RangeSlider from '@/components/settings/RangeSlider.vue'
import ToggleSwitch from '@/components/settings/ToggleSwitch.vue'
import SettingRow from '@/components/settings/SettingRow.vue'
import SettingNotice from '@/components/settings/SettingNotice.vue'
import {
  PHP_PER_USD,
  arrangements,
  baseSalary,
  employmentTypes,
  engagements,
  familyTax,
  lowOfferNotices,
  meetings,
  negotiateFrom,
  nightDifferentialPerHour,
  noticePeriodDays,
  offerRange,
  overlapRange,
  roleFocuses,
  takeHome,
  teamRegions,
  teamSizes,
  weekendPremium,
} from '@/data/settings'
import { profile } from '@/data/profile'
import { addDays } from '@/utils/dates'

// All amounts are PHP per month. USD is a display conversion.
const currency = ref('PHP')
const offer = ref(baseSalary)
const arrangement = ref('remote')
const employmentType = ref('full-time')
const engagement = ref('long-term')
const teamRegion = ref('apac')
const overlapHours = ref(4)
const roleFocus = ref('full-stack')
const teamSize = ref('small')
const meetingsPerWeek = ref(4)
const takeHomeHours = ref(2)
const weekends = ref(false)
const likeFamily = ref(false)

function format(php) {
  if (currency.value === 'USD') return `$${Math.round(php / PHP_PER_USD).toLocaleString('en-US')}`
  return `₱${php.toLocaleString('en-US')}`
}

function formatShort(php) {
  if (currency.value === 'USD') {
    const usd = php / PHP_PER_USD
    return usd >= 1000 ? `$${(usd / 1000).toFixed(1)}k` : `$${Math.round(usd)}`
  }
  return `₱${php / 1000}k`
}

const find = (list, value) => list.find((option) => option.value === value)

// Availability

const availableFrom = addDays(new Date(), noticePeriodDays).toLocaleDateString('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

const fullTimeOnly = employmentTypes.map((option) => ({ ...option, hint: option.disabled ? 'Full-time only' : undefined }))
const longTermOnly = engagements.map((option) => ({ ...option, hint: option.disabled ? 'Long-term only' : undefined }))

// Working hours

const region = computed(() => find(teamRegions, teamRegion.value))
const nightHours = computed(() => Math.max(0, overlapHours.value - region.value.daytimeHours))

// Expected salary

const meetingsOverLimit = computed(() => Math.max(0, meetingsPerWeek.value - meetings.included))

const breakdown = computed(() => {
  const arrangementOption = find(arrangements, arrangement.value)
  const role = find(roleFocuses, roleFocus.value)
  const team = find(teamSizes, teamSize.value)
  const items = [
    { label: `${arrangementOption.label} arrangement`, amount: arrangementOption.premium },
    { label: `Night differential (${nightHours.value}h/day)`, amount: nightHours.value * nightDifferentialPerHour },
    { label: `${role.label} focus`, amount: role.premium },
    { label: team.premiumLabel, amount: team.premium },
    { label: `Meetings past ${meetings.included}/week`, amount: meetingsOverLimit.value * meetings.premiumPerMeeting },
    { label: 'Weekend work', amount: weekends.value ? weekendPremium : 0 },
    { label: '"Like a family" tax', amount: likeFamily.value ? familyTax : 0 },
  ]
  return [{ label: 'Base', amount: baseSalary }, ...items.filter((item) => item.amount > 0)]
})

const expected = computed(() => breakdown.value.reduce((sum, item) => sum + item.amount, 0))

// The same amount in the other currency.
const expectedSecondary = computed(() => {
  if (currency.value === 'USD') return `₱${expected.value.toLocaleString('en-US')}`
  return `≈ $${Math.round(expected.value / PHP_PER_USD).toLocaleString('en-US')}`
})

const offerNotice = computed(() => {
  const low = lowOfferNotices.find((notice) => offer.value < notice.below)
  if (low) return low
  if (offer.value < expected.value) {
    return { tone: 'warning', text: `${format(expected.value - offer.value)} short of my expectation for this setup.` }
  }
  return { tone: 'success', text: 'This offer works for me. Let’s talk.' }
})

const offerMarkers = computed(() => [{ value: expected.value, label: 'My ask', below: true }])

// No button below negotiateFrom.
const offerAction = computed(() => {
  const amount = `${format(offer.value)}/month`
  if (offer.value >= expected.value) {
    return { label: 'Let’s connect', primary: true, subject: `Job offer: ${amount}` }
  }
  if (offer.value >= negotiateFrom) {
    return { label: 'Let’s negotiate', primary: false, subject: `Salary discussion: ${amount}` }
  }
  return null
})

const offerActionHref = computed(
  () => offerAction.value && `mailto:${profile.email}?subject=${encodeURIComponent(offerAction.value.subject)}`,
)
</script>

<template>
  <div class="page">
    <div class="head">
      <div class="crumb">Account / Settings</div>
      <h1>Settings</h1>
      <p>Tell me what the role looks like. My expected salary updates as you go.</p>
    </div>

    <section class="card">
      <h2>Work setup</h2>
      <SettingRow
        title="Work arrangement"
        :description="`Hybrid adds ${formatShort(arrangements[1].premium)}, onsite adds ${formatShort(arrangements[2].premium)}.`"
      >
        <SegmentedControl v-model="arrangement" :options="arrangements" label="Work arrangement" />
      </SettingRow>
      <SettingRow title="Employment type" description="Full-time only.">
        <SegmentedControl v-model="employmentType" :options="fullTimeOnly" label="Employment type" />
      </SettingRow>
      <SettingRow title="Engagement length" description="Long-term only.">
        <SegmentedControl v-model="engagement" :options="longTermOnly" label="Engagement length" />
      </SettingRow>
      <SettingRow title="Notice period" :description="`Available from ${availableFrom}.`">
        <span class="pill">{{ noticePeriodDays }} days</span>
      </SettingRow>
    </section>

    <section class="card">
      <h2>Working hours</h2>
      <SettingRow title="Team timezone" :description="region.note">
        <SegmentedControl v-model="teamRegion" :options="teamRegions" label="Team timezone" />
      </SettingRow>
      <SettingRow
        title="Required overlap"
        :value="`${overlapHours}h / day`"
        description="Hours I need to be online during your team's workday."
      >
        <template #below>
          <RangeSlider
            v-model="overlapHours"
            :min="overlapRange.min"
            :max="overlapRange.max"
            :step="overlapRange.step"
            :tone="nightHours > 0 ? 'warning' : 'accent'"
            label="Required overlap hours"
            :value-text="`${overlapHours} hours per day`"
          />
          <SettingNotice v-if="nightHours > 0" tone="warning">
            {{ nightHours }}h of that is at night for me. Night differential applies.
          </SettingNotice>
        </template>
      </SettingRow>
    </section>

    <section class="card">
      <h2>Role</h2>
      <SettingRow title="Role focus">
        <SegmentedControl v-model="roleFocus" :options="roleFocuses" label="Role focus" />
      </SettingRow>
      <SettingRow title="Team size">
        <SegmentedControl v-model="teamSize" :options="teamSizes" label="Team size" />
      </SettingRow>
    </section>

    <section class="card">
      <h2>Working conditions</h2>
      <SettingRow title="Meetings per week" :value="`${meetingsPerWeek}`">
        <template #below>
          <RangeSlider
            v-model="meetingsPerWeek"
            :min="0"
            :max="meetings.max"
            :tone="meetingsPerWeek > meetings.complaintAbove ? 'danger' : 'accent'"
            label="Meetings per week"
          />
          <SettingNotice v-if="meetingsPerWeek > meetings.complaintAbove" tone="danger">
            My calendar has filed a complaint.
          </SettingNotice>
        </template>
      </SettingRow>
      <SettingRow title="Unpaid take-home test" :value="`${takeHomeHours}h`">
        <template #below>
          <RangeSlider
            v-model="takeHomeHours"
            :min="0"
            :max="takeHome.max"
            :tone="takeHomeHours > takeHome.warnAbove ? 'warning' : 'accent'"
            label="Unpaid take-home test hours"
            :value-text="`${takeHomeHours} hours`"
          />
          <SettingNotice v-if="takeHomeHours > takeHome.warnAbove" tone="warning">
            Anything past {{ takeHome.warnAbove }} hours is free consulting.
          </SettingNotice>
        </template>
      </SettingRow>
      <SettingRow title="Must work weekends" :description="`Adds ${format(weekendPremium)}/month.`">
        <ToggleSwitch v-model="weekends" label="Must work weekends" />
      </SettingRow>
      <SettingRow title="&quot;We're like a family here&quot;">
        <label class="checkbox">
          <input v-model="likeFamily" type="checkbox" />
          That's us
        </label>
        <template #below>
          <SettingNotice v-if="likeFamily" tone="danger">
            Red flag noted. I already have a family. I'm looking for a job.
          </SettingNotice>
        </template>
      </SettingRow>
    </section>

    <section class="card compensation">
      <div class="card-head">
        <h2>Expected salary</h2>
        <SegmentedControl
          v-model="currency"
          :options="[{ value: 'PHP', label: 'PHP' }, { value: 'USD', label: 'USD' }]"
          label="Currency"
          size="sm"
        />
      </div>

      <div class="amount">
        <span class="amount-value">{{ format(expected) }}</span>
        <span class="amount-unit">/ month</span>
        <span class="amount-secondary">{{ expectedSecondary }}</span>
      </div>

      <ul class="breakdown">
        <li v-for="item in breakdown" :key="item.label">
          <span>{{ item.label }}</span>
          <span>{{ item.label === 'Base' ? '' : '+' }}{{ format(item.amount) }}</span>
        </li>
      </ul>

      <SettingRow title="Your offer" :value="`${format(offer)} / month`" description="Before tax. ₱62 = $1.">
        <template #below>
          <RangeSlider
            v-model="offer"
            :min="offerRange.min"
            :max="offerRange.max"
            :step="offerRange.step"
            :tone="offerNotice.tone === 'success' ? 'accent' : offerNotice.tone"
            :markers="offerMarkers"
            label="Your monthly offer"
            :value-text="`${format(offer)} per month`"
          />
          <div class="scale">
            <span>{{ formatShort(offerRange.min) }}</span>
            <span>{{ formatShort(offerRange.max) }}</span>
          </div>
          <SettingNotice :tone="offerNotice.tone">
            {{ offerNotice.text }}
            <template v-if="offerAction" #action>
              <a :href="offerActionHref" class="offer-action" :class="{ primary: offerAction.primary }">
                {{ offerAction.label }}
              </a>
            </template>
          </SettingNotice>
        </template>
      </SettingRow>
    </section>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 760px;
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
.card {
  padding: 24px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
}
h2 {
  margin: 0 0 20px;
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-subtle);
}
.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
}
.card-head h2 {
  margin: 0;
}
.pill {
  padding: 8px 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--active);
  font-family: var(--font-mono);
  font-size: 13px;
}
.checkbox {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text-muted);
  cursor: pointer;
}
.checkbox input {
  width: 16px;
  height: 16px;
  margin: 0;
  accent-color: var(--danger);
  cursor: pointer;
}

.amount {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
}
.amount-value {
  font-size: 40px;
  font-weight: 600;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
}
.amount-unit {
  font-size: 15px;
  color: var(--text-muted);
}
.amount-secondary {
  margin-left: auto;
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--text-subtle);
}
.breakdown {
  list-style: none;
  margin: 16px 0 24px;
  padding: 12px 14px;
  border-radius: var(--radius-md);
  background: var(--surface-muted);
  border: 1px solid var(--border-soft);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.breakdown li {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  font-size: 13px;
  color: var(--text-muted);
}
.breakdown li span:last-child {
  font-family: var(--font-mono);
  color: var(--text);
}
.compensation :deep(.row) {
  border-top: 1px solid var(--border-soft);
  padding-top: 20px;
}
.scale {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-subtle);
}
.offer-action {
  display: inline-flex;
  align-items: center;
  height: 32px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
  color: var(--text);
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  transition: background 0.15s, border-color 0.15s, transform 0.15s;
}
.offer-action:hover {
  background: var(--hover);
  transform: translateY(-1px);
}
.offer-action.primary {
  border-color: var(--text);
  background: var(--text);
  color: var(--on-brand);
}
.offer-action.primary:hover {
  border-color: var(--accent);
  background: var(--accent);
}
</style>
