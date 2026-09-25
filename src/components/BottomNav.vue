<script setup lang="ts">
import type { ViewId } from '../types'

defineProps<{ current: ViewId }>()
defineEmits<{ change: [view: ViewId] }>()

const items: { id: ViewId; icon: string; label: string }[] = [
  { id: 'home', icon: '⌂', label: 'Главная' },
  { id: 'hell', icon: '🔥', label: 'Мой ад' },
  { id: 'prayers', icon: '🙏', label: 'Молитвы' },
  { id: 'history', icon: '☷', label: 'История' },
  { id: 'settings', icon: '⚙', label: 'Настройки' }
]
</script>

<template>
  <nav class="bottom-nav" aria-label="Навигация">
    <button v-for="item in items" :key="item.id" :class="{ active: current === item.id }" @click="$emit('change', item.id)">
      <span>{{ item.icon }}</span>
      <small>{{ item.label }}</small>
    </button>
  </nav>
</template>
