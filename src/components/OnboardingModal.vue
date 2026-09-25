<script setup lang="ts">
import { ref } from 'vue'
import type { AvatarKind } from '../types'
import { appStore } from '../store'

const emit = defineEmits<{ done: [] }>()
const step = ref(1)
const avatar = ref<AvatarKind>(appStore.settings.avatar)
const installMessage = ref('')

async function next() {
  if (step.value < 3) {
    step.value += 1
    return
  }
  await appStore.finishOnboarding(avatar.value)
  emit('done')
}

async function install() {
  const ok = await appStore.installApp()
  if (!ok) installMessage.value = 'Если кнопка установки недоступна, откройте меню браузера и выберите «На экран Домой» или «Установить приложение».'
}
</script>

<template>
  <div class="modal-backdrop onboarding-backdrop">
    <section class="onboarding-card glass-card">
      <div class="onboarding-progress">
        <span v-for="n in 3" :key="n" :class="{ active: n <= step }"></span>
      </div>

      <template v-if="step === 1">
        <div class="onboarding-mark">Г</div>
        <p class="eyebrow">Добро пожаловать</p>
        <h1>Грехометр</h1>
        <p class="lead">Локальный учёт моральных решений, кругов ада и попыток всё исправить.</p>
        <div class="privacy-note">
          <strong>Ваши грехи остаются на устройстве.</strong>
          <span>Без аккаунтов, облака и серверной базы.</span>
        </div>
      </template>

      <template v-else-if="step === 2">
        <p class="eyebrow">Шаг 2</p>
        <h2>Кто сегодня грешит?</h2>
        <p class="muted">Персонажа можно поменять позже в настройках.</p>
        <div class="avatar-picker">
          <button :class="{ selected: avatar === 'girl' }" @click="avatar = 'girl'">
            <img src="/assets/characters/character-girl-level-01.webp" alt="Девушка" />
            <strong>Девушка</strong>
          </button>
          <button :class="{ selected: avatar === 'boy' }" @click="avatar = 'boy'">
            <img src="/assets/characters/character-boy-level-01.webp" alt="Парень" />
            <strong>Парень</strong>
          </button>
        </div>
      </template>

      <template v-else>
        <p class="eyebrow">Шаг 3</p>
        <h2>Можно установить как приложение</h2>
        <p class="lead">Грехометр работает как PWA: открывается с главного экрана и после первого кэширования работает офлайн.</p>
        <button class="install-demo" @click="install">Установить Грехометр</button>
        <p v-if="installMessage" class="install-help">{{ installMessage }}</p>
        <p class="muted">Можно и не устанавливать. В браузере данные тоже сохраняются локально между запусками.</p>
      </template>

      <button class="primary-button" @click="next">
        {{ step < 3 ? 'Дальше' : 'Начать грешить' }}
      </button>
    </section>
  </div>
</template>
