<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  asset: string
  label: string
  subtitle?: string
  tone?: 'dark' | 'light'
  disabled?: boolean
}>(), { tone: 'dark', disabled: false })

const assetClass = computed(() => {
  const name = props.asset.split('/').pop()?.replace(/\.[^.]+$/, '') ?? 'generic'
  return `image-button--asset-${name.replace(/^button-/, '')}`
})

defineEmits<{ click: [] }>()
</script>

<template>
  <button
    class="image-button"
    :class="[`image-button--${props.tone}`, assetClass, { 'is-disabled': props.disabled }]"
    :style="{ backgroundImage: `url(${props.asset})` }"
    :disabled="props.disabled"
    @click="$emit('click')"
  >
    <span class="image-button__text">
      <strong>{{ props.label }}</strong>
      <small v-if="props.subtitle">{{ props.subtitle }}</small>
    </span>
  </button>
</template>
