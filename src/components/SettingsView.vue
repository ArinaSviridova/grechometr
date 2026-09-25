<script setup lang="ts">
import { ref } from 'vue'
import { appStore } from '../store'
import type { AvatarKind, SinDefinition } from '../types'
import ImageButton from './ImageButton.vue'

const fileInput = ref<HTMLInputElement | null>(null)
const resetConfirm = ref(false)
const editing = ref<SinDefinition | null>(null)
const installHelp = ref('')

async function chooseAvatar(avatar: AvatarKind) {
  await appStore.setAvatar(avatar)
}

async function onImport(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  try {
    await appStore.importData(file)
  } catch (error) {
    appStore.showToast(error instanceof Error ? error.message : 'Не удалось импортировать файл')
  } finally {
    target.value = ''
  }
}

async function install() {
  const ok = await appStore.installApp()
  if (!ok) installHelp.value = 'Откройте меню браузера и выберите «Установить приложение» или «На экран Домой».'
}

async function saveEdit() {
  if (!editing.value) return
  await appStore.updateSin({ ...editing.value, severity: Math.max(1, Math.min(10, Math.round(editing.value.severity))) })
  editing.value = null
  appStore.showToast('Параметры греха обновлены')
}

async function reset() {
  await appStore.resetEverything()
  resetConfirm.value = false
}
</script>

<template>
  <main class="view sub-view settings-view">
    <header class="section-header">
      <p class="eyebrow">Локально и без исповеди серверу</p>
      <h1>Настройки</h1>
      <p>Закрытие вкладки и перезапуск телефона данные не сбрасывают. Очистка данных сайта браузером - сбрасывает.</p>
    </header>

    <section class="settings-card glass-card">
      <h2>Персонаж</h2>
      <div class="avatar-picker settings-avatar-picker">
        <button :class="{ selected: appStore.settings.avatar === 'girl' }" @click="chooseAvatar('girl')">
          <img src="/assets/characters/character-girl-level-01.webp" alt="Девушка" />
          <strong>Девушка</strong>
        </button>
        <button :class="{ selected: appStore.settings.avatar === 'boy' }" @click="chooseAvatar('boy')">
          <img src="/assets/characters/character-boy-level-01.webp" alt="Парень" />
          <strong>Парень</strong>
        </button>
      </div>
    </section>

    <section class="settings-card glass-card">
      <h2>Установка</h2>
      <p>В браузере приложение сохраняет данные через IndexedDB. При установке как PWA оно также получает отдельную иконку и офлайн-кэш.</p>
      <div class="status-line">
        <span>{{ appStore.standalone.value ? 'Установлено как приложение' : 'Сейчас открыто в браузере' }}</span>
        <b>{{ appStore.storagePersistent.value ? 'Хранилище защищено' : 'Локальное хранилище' }}</b>
      </div>
      <ImageButton v-if="!appStore.standalone.value" asset="/assets/buttons/button-install.webp" label="Установить" subtitle="Добавить PWA на устройство" tone="light" @click="install" />
      <small v-if="installHelp" class="install-help">{{ installHelp }}</small>
    </section>

    <section class="settings-card glass-card">
      <h2>Ваш каталог грехов</h2>
      <p>Встроенные типы можно перенастроить по тяжести. Пользовательские можно ещё и удалить.</p>
      <div class="catalog-list">
        <button v-for="sin in appStore.sins.value" :key="sin.id" class="catalog-row" @click="editing = { ...sin }">
          <img :src="appStore.getCategory(sin.category).icon" alt="" />
          <span><strong>{{ sin.title }}</strong><small>{{ appStore.getCategory(sin.category).title }}</small></span>
          <b>{{ sin.severity }}/10</b>
        </button>
      </div>
    </section>

    <section class="settings-card glass-card">
      <h2>Данные</h2>
      <p>Экспорт создаёт JSON с настройками, каталогом и историей. Его можно импортировать на другом устройстве.</p>
      <div class="settings-actions settings-actions--ornate">
        <ImageButton asset="/assets/buttons/button-export.webp" label="Экспорт души" subtitle="Скачать JSON" @click="appStore.exportData" />
        <button class="secondary-button" @click="fileInput?.click()">Восстановить душу из JSON</button>
        <input ref="fileInput" hidden type="file" accept="application/json,.json" @change="onImport" />
      </div>
    </section>

    <section class="settings-card glass-card danger-card">
      <h2>Очистить совесть</h2>
      <p>Удалит историю, пользовательские грехи и настройки на этом устройстве.</p>
      <button v-if="!resetConfirm" class="danger-button" @click="resetConfirm = true">Очистить всё</button>
      <div v-else class="confirm-reset">
        <strong>Точно? Назад пути не будет.</strong>
        <button class="danger-button" @click="reset">Да, очистить</button>
        <button class="secondary-button" @click="resetConfirm = false">Отмена</button>
      </div>
    </section>

    <section class="settings-card glass-card about-card">
      <h2>О приложении</h2>
      <p><strong>Автор приложения:</strong> <a class="author-link" href="https://www.linkedin.com/in/arina-svirydava-221761172/" target="_blank" rel="noopener noreferrer">Arina Svirydava</a></p>
      <p><strong>Идея:</strong> @redflagofff</p>
      <p class="muted">Грехометр - сатирическая PWA. Круги ада основаны на художественной модели Данте и не претендуют на религиозную точность.</p>
    </section>

    <div v-if="editing" class="modal-backdrop" @click.self="editing = null">
      <section class="sheet modal-sheet edit-sin-sheet">
        <div class="sheet-handle"></div>
        <button class="close-button" @click="editing = null">×</button>
        <p class="eyebrow">Настроить грех</p>
        <h2>{{ editing.title }}</h2>
        <label class="field-label">Название</label>
        <input v-model="editing.title" class="text-input" />
        <label class="field-label">Категория</label>
        <select v-model="editing.category" class="text-input">
          <option v-for="category in appStore.categories" :key="category.id" :value="category.id">{{ category.title }}</option>
        </select>
        <label class="field-label">Тяжесть: <b>{{ editing.severity }}/10</b></label>
        <input v-model.number="editing.severity" class="range" type="range" min="1" max="10" />
        <label class="field-label">Искупление</label>
        <textarea v-model="editing.redemption" class="text-input textarea"></textarea>
        <button class="primary-button" @click="saveEdit">Сохранить</button>
        <button v-if="editing.isCustom" class="danger-button full" @click="appStore.removeSin(editing.id); editing = null">Удалить этот грех</button>
      </section>
    </div>
  </main>
</template>
