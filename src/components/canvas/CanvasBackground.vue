<script setup lang="ts">
import { Background, BackgroundVariant } from '@vue-flow/background'
import { useThemeStore } from '@/stores/theme.store'
import { computed } from 'vue'

const theme = useThemeStore()
const dotColor = computed(() => theme.isDark ? '#ffffff14' : '#00000014')
</script>

<template>
  <Background
    :variant="BackgroundVariant.Dots"
    :gap="22"
    :size="1.2"
    :color="dotColor"
  />
</template>
