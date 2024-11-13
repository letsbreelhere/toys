<script setup lang="ts">
import { ref } from 'vue'
import p5 from 'p5'
(window as any).p5 = p5;
import("p5/lib/addons/p5.sound");

import OneD from '../1d.ts'
import TwoD from '../2d.ts'
import Piano from '../Piano.ts'

const tabs = [
  {
    id: '1d',
    name: '1D',
    sketch: OneD,
  },
  {
    id: '2d',
    name: '2D',
    sketch: TwoD,
  },
  {
    id: 'piano',
    name: 'Piano',
    sketch: Piano,
  },
]

const selectedTab = ref('1d')
const activeSketch = ref(null)

const selectTab = (tabId: string) => {
  selectedTab.value = tabId
  const tab = tabs.find((tab) => tab.id === tabId)

  // Stop sounds?

  activeSketch.value?.remove()

  if (tab) {
    activeSketch.value = new p5(tab.sketch, 'tab-content')
  }
}

</script>

<template>
  <div class="tabbed_container">
    <div class="tab_header">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="[selectedTab === tab.id ? 'active' : '', 'tab_button']"
        :data-tab="tab.id"
        @click="selectTab(tab.id)"
      >
        {{ tab.name }}
      </button>
    </div>

    <div class="tab-content" />
  </div>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
