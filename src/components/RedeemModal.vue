<script setup lang="ts">
import { computed, ref } from 'vue'
import { appStore } from '../store'

const emit = defineEmits<{ close: [] }>()
const selectedId = ref(appStore.unreedeemedEntries.value[0]?.id ?? '')
const done = ref(false)

const selected = computed(() => appStore.entries.value.find((entry) => entry.id === selectedId.value))
const definition = computed(() => selected.value ? appStore.getSinById(selected.value.sinId) : undefined)

async function redeem() {
  if (!selected.value) return
  await appStore.redeem(selected.value.id)
  done.value = true
}
</script>

<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <section class="sheet modal-sheet redemption-sheet">
      <div class="sheet-handle"></div>
      <button class="close-button" @click="$emit('close')">×</button>

      <template v-if="done">
        <div class="redemption-visual">
          <img src="/assets/redemption/redemption-glow.webp" alt="" />
          <img src="/assets/redemption/redemption-halo.webp" alt="" />
          <img src="/assets/redemption/redemption-particles.webp" alt="" />
          <img class="main" src="/assets/redemption/redemption-main.webp" alt="Искупление" />
        </div>
        <h2>Попытка засчитана</h2>
        <p class="lead">Вклад выбранного греха в общий счёт уменьшен на 40%.</p>
        <button class="primary-button" @click="$emit('close')">Вернуться</button>
      </template>

      <template v-else>
        <p class="eyebrow">Искупление</p>
        <h2>Что исправляем?</h2>
        <p v-if="!appStore.unreedeemedEntries.value.length" class="empty-state">Неискупленных записей нет. Подозрительно образцово.</p>
        <div v-else class="redeem-list">
          <label v-for="entry in appStore.unreedeemedEntries.value.slice(0, 20)" :key="entry.id" class="redeem-row" :class="{ selected: selectedId === entry.id }">
            <input v-model="selectedId" type="radio" :value="entry.id" />
            <span>
              <strong>{{ entry.sinTitle }}</strong>
              <small>{{ new Date(entry.createdAt).toLocaleString('ru-RU', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) }}</small>
            </span>
            <b>{{ appStore.formatPoints(entry.points) }}</b>
          </label>
        </div>
        <div v-if="selected" class="redemption-advice">
          <strong>Что можно сделать:</strong>
          <p>{{ definition?.redemption || 'Сделай конкретный поступок, который исправляет или уменьшает вред.' }}</p>
        </div>
        <button class="primary-button" :disabled="!selected" @click="redeem">Искупить выбранное</button>
      </template>
    </section>
  </div>
</template>
