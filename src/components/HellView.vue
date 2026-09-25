<script setup lang="ts">
import { computed } from 'vue'
import { appStore } from '../store'

const maxCircleScore = computed(() => Math.max(1, ...appStore.circles.map((circle) => appStore.circleScore(circle.number))))

function circlePercent(number: number) {
  return Math.round((appStore.circleScore(number) / maxCircleScore.value) * 100)
}
</script>

<template>
  <main class="view sub-view">
    <header class="section-header">
      <p class="eyebrow">Статистика по Данте</p>
      <h1>Мой ад</h1>
      <p>Это игровая классификация по мотивам «Божественной комедии», а не богословская система. Потому что даже у ада должен быть дисклеймер.</p>
    </header>

    <section class="hell-summary glass-card">
      <div>
        <small>Текущий лидер</small>
        <strong>{{ appStore.mainCircleData.value.number }} круг - {{ appStore.mainCircleData.value.title }}</strong>
      </div>
      <div>
        <small>Всего</small>
        <strong>{{ appStore.formatPoints(appStore.totalScore.value) }} / {{ appStore.HELL_TARGET }}</strong>
      </div>
      <div>
        <small>Искуплено</small>
        <strong>{{ appStore.redeemedCount.value }}</strong>
      </div>
    </section>

    <section class="circle-list">
      <article v-for="circle in appStore.circles" :key="circle.number" class="circle-card glass-card" :class="{ active: circle.number === appStore.mainCircleData.value.number }">
        <img :src="circle.image" :alt="`${circle.number} круг: ${circle.title}`" />
        <div class="circle-copy">
          <div class="circle-title-row">
            <span>{{ circle.number }}</span>
            <div><small>Круг ада</small><h3>{{ circle.title }}</h3></div>
          </div>
          <p>{{ circle.description }}</p>
          <div class="score-bar"><i :style="{ width: `${circlePercent(circle.number)}%` }"></i></div>
          <strong>{{ appStore.formatPoints(appStore.circleScore(circle.number)) }} баллов</strong>
        </div>
      </article>
    </section>

    <section class="achievement-section glass-card">
      <p class="eyebrow">Достижения</p>
      <h2>Маленькие вехи большого падения</h2>
      <div class="achievement-grid">
        <div v-for="achievement in appStore.achievements.value" :key="achievement.id" :class="['achievement', { unlocked: achievement.unlocked }]">
          <span>{{ achievement.icon }}</span>
          <strong>{{ achievement.title }}</strong>
          <small>{{ achievement.text }}</small>
        </div>
      </div>
    </section>
  </main>
</template>
