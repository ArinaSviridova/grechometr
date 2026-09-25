<script setup lang="ts">
import { computed, ref } from 'vue'
import { appStore } from '../store'
import type { CategoryId } from '../types'

const filter = ref<CategoryId | 'all'>('all')
const filtered = computed(() => appStore.entries.value.filter((entry) => filter.value === 'all' || entry.category === filter.value))

function formatDate(value: string) {
  return new Date(value).toLocaleString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <main class="view sub-view">
    <header class="section-header">
      <p class="eyebrow">Летопись</p>
      <h1>История</h1>
      <p>Все записи хранятся только на этом устройстве.</p>
    </header>

    <section class="history-summary glass-card">
      <div><small>Записей</small><strong>{{ appStore.entries.value.length }}</strong></div>
      <div><small>Сырых баллов</small><strong>{{ appStore.formatPoints(appStore.rawScore.value) }}</strong></div>
      <div><small>После искуплений</small><strong>{{ appStore.formatPoints(appStore.totalScore.value) }}</strong></div>
    </section>

    <div class="history-filter">
      <select v-model="filter" class="text-input">
        <option value="all">Все категории</option>
        <option v-for="category in appStore.categories" :key="category.id" :value="category.id">{{ category.title }}</option>
      </select>
    </div>

    <section v-if="filtered.length" class="history-list">
      <article v-for="entry in filtered" :key="entry.id" class="history-row glass-card">
        <img :src="appStore.getCategory(entry.category).icon" alt="" />
        <div class="history-row__copy">
          <strong>{{ entry.sinTitle }}</strong>
          <small>{{ formatDate(entry.createdAt) }}</small>
          <span>{{ appStore.getCategory(entry.category).title }} · тяжесть {{ entry.severity }}/10 · интенсивность {{ entry.intensity }}/5</span>
          <em v-if="entry.redeemedAt">Искуплено: -40% к вкладу</em>
        </div>
        <div class="history-row__score">{{ appStore.formatPoints(appStore.effectivePoints(entry)) }}</div>
        <button class="row-delete" aria-label="Удалить запись" @click="appStore.deleteEntry(entry.id)">×</button>
      </article>
    </section>
    <p v-else class="empty-state glass-card">История пуста. Небеса в замешательстве.</p>
  </main>
</template>
