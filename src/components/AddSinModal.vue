<script setup lang="ts">
import { computed, ref } from 'vue'
import { appStore } from '../store'
import { intensityLevels } from '../data/intensity'
import ImageButton from './ImageButton.vue'
import type { CategoryId, SinDefinition } from '../types'

const emit = defineEmits<{ close: []; added: [] }>()
const query = ref('')
const selected = ref<SinDefinition | null>(null)
const mode = ref<'pick' | 'create' | 'intensity'>('pick')
const newTitle = ref('')
const newCategory = ref<CategoryId>('other')
const newSeverity = ref(5)
const newRedemption = ref('')

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return appStore.sins.value.filter((sin) => !q || sin.title.toLowerCase().includes(q)).slice(0, 30)
})

function choose(sin: SinDefinition) {
  selected.value = sin
  mode.value = 'intensity'
}

async function createAndContinue() {
  if (!newTitle.value.trim()) return
  selected.value = await appStore.createSin({
    title: newTitle.value,
    category: newCategory.value,
    severity: newSeverity.value,
    redemption: newRedemption.value
  })
  mode.value = 'intensity'
}

async function log(level: typeof intensityLevels[number]) {
  if (!selected.value) return
  await appStore.logSin(selected.value, level.level, level.multiplier)
  emit('added')
  emit('close')
}
</script>

<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <section class="sheet modal-sheet">
      <div class="sheet-handle"></div>
      <button class="close-button" aria-label="Закрыть" @click="$emit('close')">×</button>

      <template v-if="mode === 'pick'">
        <p class="eyebrow">Согрешить</p>
        <h2>Что произошло?</h2>
        <input v-model="query" class="text-input" placeholder="Найти грех..." autofocus />
        <div class="sin-list">
          <button v-for="sin in filtered" :key="sin.id" class="sin-row" @click="choose(sin)">
            <img :src="appStore.getCategory(sin.category).icon" alt="" />
            <span class="sin-row__main">
              <strong>{{ sin.title }}</strong>
              <small>{{ appStore.getCategory(sin.category).title }}</small>
            </span>
            <span class="severity-badge">{{ sin.severity }}/10</span>
          </button>
        </div>
        <ImageButton asset="/assets/buttons/button-add-sin.webp" label="Добавить грех" subtitle="Создать свой тип" @click="mode = 'create'" />
      </template>

      <template v-else-if="mode === 'create'">
        <button class="back-link" @click="mode = 'pick'">← Назад</button>
        <p class="eyebrow">Новый грех</p>
        <h2>Добавим в каталог</h2>
        <label class="field-label">Название</label>
        <input v-model="newTitle" class="text-input" placeholder="Например: соврать начальнику" />

        <label class="field-label">Категория</label>
        <div class="category-grid compact">
          <button v-for="category in appStore.categories" :key="category.id" :class="{ selected: newCategory === category.id }" @click="newCategory = category.id">
            <img :src="category.icon" alt="" />
            <span>{{ category.title }}</span>
          </button>
        </div>

        <label class="field-label">Насколько этот грех тяжёлый вообще: <b>{{ newSeverity }}/10</b></label>
        <input v-model.number="newSeverity" class="range" type="range" min="1" max="10" step="1" />
        <div class="range-labels"><span>мелочь</span><span>очень тяжело</span></div>

        <label class="field-label">Что можно сделать для искупления</label>
        <textarea v-model="newRedemption" class="text-input textarea" placeholder="Можно оставить пустым"></textarea>
        <button class="primary-button" :disabled="!newTitle.trim()" @click="createAndContinue">Сохранить и согрешить</button>
      </template>

      <template v-else-if="selected">
        <button class="back-link" @click="mode = 'pick'">← Выбрать другой</button>
        <p class="eyebrow">{{ appStore.getCategory(selected.category).title }} · {{ selected.severity }}/10</p>
        <h2>{{ selected.title }}</h2>
        <p class="muted">Насколько от души это было?</p>
        <div class="intensity-grid">
          <button v-for="level in intensityLevels" :key="level.level" @click="log(level)">
            <img :src="level.image" alt="" />
            <strong>{{ level.title }}</strong>
            <small>{{ appStore.formatPoints(selected.severity * level.multiplier) }} балла</small>
          </button>
        </div>
      </template>
    </section>
  </div>
</template>
