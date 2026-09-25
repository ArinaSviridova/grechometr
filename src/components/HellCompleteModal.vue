<script setup lang="ts">
import { appStore } from '../store'

const emit = defineEmits<{ close: [] }>()

async function close() {
  await appStore.updateSetting('hellRewardSeen', true)
  emit('close')
}

async function copyCode() {
  try {
    await navigator.clipboard.writeText('HELLFRIEND13')
    appStore.showToast('Код HELLFRIEND13 скопирован')
  } catch {
    appStore.showToast('Код: HELLFRIEND13')
  }
}
</script>

<template>
  <div class="modal-backdrop hell-complete-backdrop">
    <section class="hell-complete-card">
      <img class="hell-complete-bg" src="/assets/final/hell-complete-background.webp" alt="" />
      <img
        v-if="appStore.settings.avatar === 'girl'"
        class="hell-complete-char"
        src="/assets/final/hell-complete-character.webp"
        alt=""
      />
      <img
        v-else
        class="hell-complete-char hell-complete-char--boy"
        src="/assets/characters/character-boy-level-10.webp"
        alt=""
      />
      <img class="hell-complete-frame" src="/assets/final/hell-complete-frame.webp" alt="" />
      <div class="hell-complete-copy">
        <p class="eyebrow">100%</p>
        <h2>АД ДОСТИГНУТ</h2>
        <p>Поздравляем. Дальше уже чисто из спортивного интереса.</p>
        <div class="reward-box">
          <span>🎁 Награда</span>
          <strong>13% на будущий Premium для друга</strong>
          <button @click="copyCode">Скопировать код HELLFRIEND13</button>
        </div>
        <button class="primary-button" @click="close">Принять судьбу</button>
      </div>
    </section>
  </div>
</template>
