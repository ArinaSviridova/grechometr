<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { appStore } from './store'
import type { ViewId } from './types'
import AddSinModal from './components/AddSinModal.vue'
import BottomNav from './components/BottomNav.vue'
import HellCompleteModal from './components/HellCompleteModal.vue'
import HellView from './components/HellView.vue'
import HistoryView from './components/HistoryView.vue'
import HomeView from './components/HomeView.vue'
import OnboardingModal from './components/OnboardingModal.vue'
import PrayersView from './components/PrayersView.vue'
import RedeemModal from './components/RedeemModal.vue'
import SettingsView from './components/SettingsView.vue'

const currentView = ref<ViewId>('home')
const showAddSin = ref(false)
const showRedeem = ref(false)
const showHellComplete = ref(false)

const themeClass = computed(() => `theme-level-${appStore.currentLevel.value}`)

function navigate(view: ViewId) {
  currentView.value = view
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(async () => {
  await appStore.init()
  if (appStore.hellReached.value && !appStore.settings.hellRewardSeen) showHellComplete.value = true
})

watch(() => appStore.hellReached.value, (reached, wasReached) => {
  if (reached && !wasReached && !appStore.settings.hellRewardSeen) showHellComplete.value = true
})
</script>

<template>
  <div v-if="!appStore.initialized.value" class="app-loading">
    <div class="loading-halo"></div>
    <strong>Грехометр</strong>
    <span>Поднимаем локальную бухгалтерию...</span>
  </div>

  <div v-else class="app-shell" :class="themeClass">
    <div class="world-bg" :style="{ backgroundImage: `url(${appStore.backgroundPath.value})` }"></div>
    <div class="world-overlay"></div>
    <img v-if="appStore.currentLevel.value <= 3" class="ambient ambient--rays" src="/assets/decor/decor-rays.webp" alt="" />
    <img v-if="appStore.currentLevel.value >= 7" class="ambient ambient--fire" src="/assets/decor/decor-fire-02.webp" alt="" />

    <div class="app-content">
      <HomeView v-if="currentView === 'home'" @add-sin="showAddSin = true" @redeem="showRedeem = true" @navigate="navigate" />
      <HellView v-else-if="currentView === 'hell'" />
      <PrayersView v-else-if="currentView === 'prayers'" />
      <HistoryView v-else-if="currentView === 'history'" />
      <SettingsView v-else />
    </div>

    <BottomNav :current="currentView" @change="navigate" />

    <Transition name="toast">
      <div v-if="appStore.toast.value" class="toast">{{ appStore.toast.value }}</div>
    </Transition>

    <OnboardingModal v-if="!appStore.settings.onboardingDone" @done="navigate('home')" />
    <AddSinModal v-if="showAddSin" @close="showAddSin = false" />
    <RedeemModal v-if="showRedeem" @close="showRedeem = false" />
    <HellCompleteModal v-if="showHellComplete" @close="showHellComplete = false" />
  </div>
</template>
