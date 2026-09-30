<script setup>
import { computed } from 'vue'
import PlaceholderPage from '@/components/PlaceholderPage.vue'
import GoOverbookedView from '@/views/GoOverbookedView.vue'
import AtCapacityView from '@/views/AtCapacityView.vue'
import EvStreamView from '@/views/EvStreamView.vue'
import MyConsumablesView from '@/views/MyConsumablesView.vue'
import { findProject } from '@/data/projects'

const props = defineProps({ slug: { type: String, required: true } })
const project = computed(() => findProject(props.slug))
</script>

<template>
  <GoOverbookedView v-if="project?.slug === 'go-overbooked'" :title="project.name" />
  <AtCapacityView v-else-if="project?.slug === 'at-capacity'" :title="project.name" />
  <EvStreamView v-else-if="project?.slug === 'evstream'" :title="project.name" />
  <MyConsumablesView v-else-if="project?.slug === 'myconsumables'" :title="project.name" />
  <PlaceholderPage v-else-if="project" section="Work" :title="project.name" />
  <PlaceholderPage v-else section="Work" title="Not found">
    <div>This page does not exist.</div>
  </PlaceholderPage>
</template>
