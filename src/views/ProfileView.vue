<script setup>
import { profile } from '@/data/profile'
import { engagementLabel, projects } from '@/data/projects'
import { formatRange } from '@/utils/dates'

// Employment keeps the order from projects.js (main job first). Products I founded get their own
// section so they don't read as a second job. Entries without a start date are left off.
const dated = projects.filter((p) => p.start)
const experience = dated.filter((p) => p.engagement !== 'founder')
const ventures = dated.filter((p) => p.engagement === 'founder')
const workSections = [
  { title: 'Experience', items: experience },
  { title: 'Own product', items: ventures },
].filter((section) => section.items.length)

// Every technology across all work, without duplicates, in first-seen order.
const skills = [...new Set(dated.flatMap((p) => p.stack))]

// Group skills by profile.skillCategories. Anything uncategorized lands in "Other".
const categorized = new Set(profile.skillCategories.flatMap((c) => c.skills))
const uncategorized = skills.filter((s) => !categorized.has(s))
const skillGroups = [
  ...profile.skillCategories,
  ...(uncategorized.length ? [{ name: 'Other', skills: uncategorized }] : []),
]
</script>

<template>
  <div class="page">
    <div class="crumb">Account / Profile</div>

    <section class="hero">
      <div class="banner" aria-hidden="true"></div>
      <div class="hero-body">
        <div class="avatar">
          <img v-if="profile.photo" :src="profile.photo" :alt="profile.name" :style="profile.photoStyle" />
          <span v-else>{{ profile.initials }}</span>
        </div>

        <div class="hero-top">
          <div class="identity">
            <h1>{{ profile.name }}</h1>
            <div class="title">{{ profile.title }}</div>
          </div>
          <a :href="`mailto:${profile.email}`" class="cta">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
            Get in touch
          </a>
        </div>

        <ul class="meta">
          <li>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" /><circle cx="12" cy="10" r="3" /></svg>
            {{ profile.location }}
          </li>
          <li>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /><rect width="20" height="14" x="2" y="6" rx="2" /></svg>
            {{ profile.experience }} experience
          </li>
          <li>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
            <a :href="`mailto:${profile.email}`" class="email">{{ profile.email }}</a>
          </li>
        </ul>

        <p class="summary">{{ profile.summary }}</p>
      </div>
    </section>

    <div class="columns">
      <div class="main">
        <section v-for="section in workSections" :key="section.title" class="card">
          <h2>{{ section.title }}</h2>
          <ol class="timeline">
            <li v-for="p in section.items" :key="p.slug" class="job">
              <div class="logo-tile">
                <img :src="p.logo" alt="" aria-hidden="true" />
              </div>
              <div class="job-body">
                <div class="job-head">
                  <div>
                    <div class="role">{{ p.role }}</div>
                    <RouterLink :to="`/projects/${p.slug}`" class="company">
                      {{ p.name }}
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7" /><path d="M7 7h10v10" /></svg>
                    </RouterLink>
                  </div>
                  <div class="when">
                    <span v-if="engagementLabel(p)" class="tag" :class="p.engagement">{{ engagementLabel(p) }}</span>
                    <span class="dates">{{ formatRange(p.start, p.end, p.since) }}</span>
                  </div>
                </div>
                <p>{{ p.tagline }}</p>
                <ul class="chips">
                  <li v-for="s in p.stack" :key="s">{{ s }}</li>
                </ul>
              </div>
            </li>
          </ol>
        </section>
      </div>

      <div class="side">
        <section class="card">
          <h2>Education</h2>
          <div v-for="e in profile.education" :key="e.degree" class="school">
            <div class="icon-tile">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" /><path d="M22 10v6" /><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" /></svg>
            </div>
            <div>
              <div class="role">{{ e.degree }}</div>
              <div class="school-name">{{ e.school }}</div>
              <div class="dates">Class of {{ e.year }}</div>
            </div>
          </div>
        </section>

        <section class="card">
          <h2>Skills</h2>
          <div class="skill-groups">
            <div v-for="g in skillGroups" :key="g.name" class="skill-group">
              <div class="skill-group-name">{{ g.name }}</div>
              <ul class="chips">
                <li v-for="s in g.skills" :key="s">{{ s }}</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>

    <section class="fun">
      <h2>Fun facts</h2>
      <ul class="hobbies">
        <li v-for="h in profile.hobbies" :key="h.name" class="hobby">
          <div class="icon-tile">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <template v-if="h.icon === 'gamepad'">
                <line x1="6" x2="10" y1="11" y2="11" /><line x1="8" x2="8" y1="9" y2="13" /><line x1="15" x2="15.01" y1="12" y2="12" /><line x1="18" x2="18.01" y1="10" y2="10" />
                <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z" />
              </template>
              <template v-else-if="h.icon === 'paddle'">
                <circle cx="10" cy="10" r="6.5" /><path d="m14.6 14.6 5.4 5.4" /><circle cx="19.5" cy="5" r="1.5" />
              </template>
              <template v-else>
                <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
                <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
                <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
              </template>
            </svg>
          </div>
          <span class="hobby-label">{{ h.label }}</span>
          <span class="hobby-name">{{ h.name }}</span>
          <span class="hobby-note">{{ h.note }}</span>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 24px;
  container-type: inline-size;
}
.crumb {
  font-size: 13px;
  color: var(--text-muted);
  font-family: var(--font-mono);
}
p {
  margin: 0;
  font-size: 15px;
  color: var(--text-muted);
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
.card {
  padding: 24px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
}
.icon-tile {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: var(--radius-md);
  background: var(--accent-soft);
  color: var(--accent);
  display: grid;
  place-items: center;
}

/* Hero */
.hero {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}
.banner {
  height: 120px;
  background:
    radial-gradient(circle at 1px 1px, color-mix(in srgb, var(--on-brand) 22%, transparent) 1px, transparent 0) 0 0 / 18px 18px,
    linear-gradient(120deg, var(--accent), color-mix(in srgb, var(--accent) 55%, var(--brand-at-capacity)));
}
.hero-body {
  padding: 0 32px 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.avatar {
  width: 96px;
  height: 96px;
  margin-top: -48px;
  border-radius: 50%;
  border: 4px solid var(--surface);
  overflow: hidden;
  background: var(--text);
  color: var(--on-brand);
  display: grid;
  place-items: center;
  font-size: 30px;
  font-weight: 600;
  letter-spacing: -0.02em;
  box-shadow: 0 8px 24px -12px var(--border-dashed);
}
.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.hero-top {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.identity {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
h1 {
  margin: 0;
  font-size: 32px;
  font-weight: 600;
  letter-spacing: -0.025em;
  line-height: 1.1;
}
.title {
  font-size: 16px;
  font-weight: 500;
  color: var(--accent);
}
.cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 16px;
  border-radius: var(--radius-md);
  background: var(--text);
  color: var(--on-brand);
  font-size: 14px;
  font-weight: 500;
  transition: background 0.15s, transform 0.15s;
}
.cta:hover {
  background: var(--accent);
  transform: translateY(-1px);
}
.meta {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px 20px;
}
.meta li {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--text-muted);
}
.meta svg {
  color: var(--text-subtle);
}
.email:hover {
  color: var(--accent);
  text-decoration: underline;
}
.summary {
  max-width: 68ch;
  font-size: 16px;
  line-height: 1.65;
  color: var(--text);
}

/* Layout */
.columns {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 16px;
  align-items: start;
}
.main,
.side {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Experience timeline: a line runs through the logo tiles. */
.timeline {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}
.job {
  position: relative;
  display: flex;
  gap: 16px;
  padding-bottom: 28px;
}
.job:last-child {
  padding-bottom: 0;
}
.job:not(:last-child)::before {
  content: '';
  position: absolute;
  top: 48px;
  bottom: 4px;
  left: 21px;
  width: 2px;
  border-radius: 1px;
  background: var(--border-soft);
}
.logo-tile {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: var(--surface);
  display: grid;
  place-items: center;
}
.logo-tile img {
  width: 26px;
  height: 26px;
  object-fit: contain;
}
.job-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
  flex: 1;
  padding-top: 2px;
}
.job-body p {
  font-size: 14px;
  line-height: 1.55;
}
.job-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  flex-wrap: wrap;
}
.role {
  font-size: 15px;
  font-weight: 600;
}
.company {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 14px;
  color: var(--accent);
}
.company svg {
  opacity: 0;
  transform: translate(-2px, 2px);
  transition: opacity 0.15s, transform 0.15s;
}
.company:hover svg,
.company:focus-visible svg {
  opacity: 1;
  transform: none;
}
.when {
  display: flex;
  align-items: center;
  gap: 8px;
}
.tag {
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--active);
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 500;
}
.tag.full-time {
  background: var(--accent-soft);
  color: var(--accent);
}
.dates {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-subtle);
  white-space: nowrap;
}
.chips {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.chips li {
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--surface-muted);
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-muted);
}

/* Education */
.school {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}
.school + .school {
  margin-top: 16px;
}
.school-name {
  margin: 2px 0 6px;
  font-size: 14px;
  color: var(--text-muted);
}

/* Skills */
.skill-groups {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.skill-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.skill-group-name {
  font-size: 13px;
  font-weight: 600;
}

/* Fun facts */
.fun h2 {
  margin-bottom: 12px;
}
.hobbies {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}
.hobby {
  padding: 20px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
}
.hobby:hover {
  border-color: var(--border-dashed);
  box-shadow: 0 8px 24px -14px var(--border-dashed);
  transform: translateY(-2px);
}
.hobby .icon-tile {
  margin-bottom: 12px;
}
.hobby-label {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-subtle);
}
.hobby-name {
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.01em;
}
.hobby-note {
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-muted);
}

@container (max-width: 860px) {
  .columns {
    grid-template-columns: 1fr;
  }
}
@container (max-width: 640px) {
  .hobbies {
    grid-template-columns: 1fr;
  }
  .hero-body {
    padding: 0 20px 24px;
  }
}
</style>
