<script setup lang="ts">
import { computed, ref } from 'vue'
import { appStore } from '../store'
import type { CategoryId } from '../types'

const selectedCategory = ref<CategoryId | 'general'>(appStore.todayEntries.value.length ? appStore.todayDominantCategory.value : appStore.dominantCategory.value)
const selectedPrayer = computed(() => appStore.prayers.find((p) => p.category === selectedCategory.value) ?? appStore.prayers[0])
</script>

<template>
  <main class="view sub-view">
    <header class="section-header">
      <p class="eyebrow">После бухгалтерии</p>
      <h1>Молитвы</h1>
      <p>Короткие молитвы и духовные формулировки по теме. Это не замена священнику, духовнику или вашей собственной традиции.</p>
    </header>

    <section class="prayer-feature glass-card">
      <div class="prayer-halo">◯</div>
      <small>Рекомендация дня</small>
      <h2>{{ appStore.dailyPrayer.value.title }}</h2>
      <blockquote>{{ appStore.dailyPrayer.value.text }}</blockquote>
      <p>{{ appStore.dailyPrayer.value.note }}</p>
    </section>

    <section class="prayer-filter">
      <button :class="{ active: selectedCategory === 'general' }" @click="selectedCategory = 'general'">Общая</button>
      <button v-for="category in appStore.categories" :key="category.id" :class="{ active: selectedCategory === category.id }" @click="selectedCategory = category.id">
        {{ category.title }}
      </button>
    </section>

    <section class="prayer-paper">
      <div class="prayer-paper__ornament">✦</div>
      <p class="eyebrow">{{ selectedCategory === 'general' ? 'Общая' : appStore.getCategory(selectedCategory).title }}</p>
      <h2>{{ selectedPrayer.title }}</h2>
      <p class="prayer-text">{{ selectedPrayer.text }}</p>
      <small>{{ selectedPrayer.note }}</small>
    </section>
  </main>
</template>
