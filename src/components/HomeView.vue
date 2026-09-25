<script setup lang="ts">
import { computed, ref } from 'vue'
import { appStore } from '../store'
import ImageButton from './ImageButton.vue'
import type { ViewId } from '../types'

const emit = defineEmits<{
  addSin: []
  redeem: []
  navigate: [view: ViewId]
}>()

const installHelp = ref('')
const circleProgress = computed(() => `${appStore.hellPercent.value.toFixed(1)} 100`)
const dominant = computed(() => appStore.getCategory(appStore.dominantCategory.value))
const todayCount = computed(() => appStore.todayEntries.value.length)

async function install() {
  const ok = await appStore.installApp()
  if (!ok) installHelp.value = 'Если системная кнопка не появилась, откройте меню браузера и выберите «Установить приложение» или «На экран Домой».'
}
</script>

<template>
  <main class="view home-view">
    <header class="app-header">
      <div>
        <p class="brand-kicker">локальный счётчик моральных решений</p>
        <h1 class="brand-title">Грехометр</h1>
      </div>
      <button class="header-icon" aria-label="Настройки" @click="$emit('navigate', 'settings')">⚙</button>
    </header>

    <section class="hero-card glass-card">
      <div class="hero-summary">
        <div class="progress-copy">
          <p class="eyebrow">{{ appStore.hellCopyCurrent.value.title }}</p>
          <div class="progress-number">{{ Math.round(appStore.hellPercent.value) }}<small>%</small></div>
          <strong>до ада</strong>
          <p>{{ appStore.hellCopyCurrent.value.text }}</p>
        </div>

        <svg class="progress-ring" viewBox="0 0 120 120" aria-hidden="true">
          <circle class="ring-track" cx="60" cy="60" r="50" pathLength="100" />
          <circle class="ring-value" cx="60" cy="60" r="50" pathLength="100" :stroke-dasharray="circleProgress" />
        </svg>
      </div>

      <div class="hero-character-stage">
        <img class="hero-character" :class="`hero-character--${appStore.settings.avatar}`" :src="appStore.characterPath.value" alt="Персонаж Грехометра" />
      </div>
      <img v-if="appStore.currentLevel.value >= 7" class="hero-embers" src="/assets/decor/decor-embers.webp" alt="" />
    </section>

    <section class="action-grid">
      <ImageButton asset="/assets/buttons/button-sin.webp" label="Согрешить" subtitle="Добавить запись" @click="$emit('addSin')" />
      <ImageButton asset="/assets/buttons/button-redeem.webp" label="Искупить" subtitle="Снизить вклад" tone="light" :disabled="!appStore.unreedeemedEntries.value.length" @click="$emit('redeem')" />
    </section>

    <section class="quick-stats">
      <button class="mini-card" @click="$emit('navigate', 'history')">
        <span class="mini-icon">📆</span>
        <small>Сегодня</small>
        <strong>{{ todayCount }} {{ todayCount === 1 ? 'грех' : 'грехов' }}</strong>
        <em>{{ appStore.formatPoints(appStore.todayScore.value) }} баллов</em>
      </button>
      <button class="mini-card" @click="$emit('navigate', 'hell')">
        <img class="category-mini-icon" :src="dominant.icon" alt="" />
        <small>Главный грех</small>
        <strong>{{ dominant.title }}</strong>
        <em>{{ appStore.formatPoints(appStore.categoryScores.value[dominant.id]) }} баллов</em>
      </button>
      <button class="mini-card" @click="$emit('navigate', 'hell')">
        <span class="mini-icon">🔥</span>
        <small>Твой круг</small>
        <strong>{{ appStore.mainCircleData.value.number }} круг</strong>
        <em>{{ appStore.mainCircleData.value.title }}</em>
      </button>
      <button class="mini-card" @click="$emit('navigate', 'prayers')">
        <span class="mini-icon">🙏</span>
        <small>Молитва дня</small>
        <strong>{{ appStore.dailyPrayer.value.title }}</strong>
        <em>Открыть</em>
      </button>
    </section>

    <section class="ornate-nav" aria-label="Быстрые разделы">
      <ImageButton asset="/assets/buttons/button-my-hell.webp" label="Мой ад" subtitle="Круги и достижения" @click="$emit('navigate', 'hell')" />
      <ImageButton asset="/assets/buttons/button-prayers.webp" label="Молитвы" subtitle="По главному греху" tone="light" @click="$emit('navigate', 'prayers')" />
      <ImageButton asset="/assets/buttons/button-history.webp" label="История" subtitle="Все записи" tone="light" @click="$emit('navigate', 'history')" />
    </section>

    <section v-if="!appStore.standalone.value && !appStore.settings.installHintDismissed" class="install-card glass-card">
      <div class="install-icon">▣</div>
      <div class="install-copy">
        <strong>Работает как PWA</strong>
        <span>Установите на главный экран. Данные останутся локальными.</span>
        <small v-if="installHelp">{{ installHelp }}</small>
      </div>
      <button class="install-action" @click="install">Установить</button>
      <button class="install-close" aria-label="Скрыть" @click="appStore.updateSetting('installHintDismissed', true)">×</button>
    </section>

    <section class="origin-card glass-card" :class="{ collapsed: appStore.settings.originCollapsed }">
      <button class="origin-heading" @click="appStore.updateSetting('originCollapsed', !appStore.settings.originCollapsed)">
        <span>С чего всё началось</span>
        <b>{{ appStore.settings.originCollapsed ? 'Развернуть' : 'Свернуть' }}</b>
      </button>
      <div v-if="!appStore.settings.originCollapsed" class="origin-content">
        <img src="/assets/origin/origin-threads-redflagofff.jpg" alt="Скриншот исходной идеи в Threads" />
        <div class="origin-credit">
          <p><span>Идея</span><strong>@redflagofff</strong></p>
          <p><span>Автор приложения</span><a class="author-link" href="https://www.linkedin.com/in/arina-svirydava-221761172/" target="_blank" rel="noopener noreferrer"><strong>Arina Svirydava</strong></a></p>
          <small>Человечеству всё-таки понадобился учёт грехов. Кто бы мог подумать.</small>
        </div>
      </div>
    </section>

    <section class="formula-card glass-card">
      <p class="eyebrow">Как считается</p>
      <h3>Тяжесть × насколько от души</h3>
      <p>Каждый тип греха имеет базовую тяжесть от 1 до 10. При совершении выбирается интенсивность от 1 до 5. До 100% нужно набрать {{ appStore.HELL_TARGET }} эффективных грехобаллов.</p>
    </section>
  </main>
</template>
