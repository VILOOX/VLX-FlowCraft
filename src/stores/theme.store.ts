import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<'dark' | 'light'>('dark')
  const isDark = computed(() => theme.value === 'dark')

  function init() {
    const saved = localStorage.getItem('wf-theme')
    if (saved === 'light' || saved === 'dark') theme.value = saved
    apply()
  }

  function toggle() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
    localStorage.setItem('wf-theme', theme.value)
    apply()
  }

  function apply() {
    document.documentElement.classList.remove('dark', 'light')
    document.documentElement.classList.add(theme.value)
  }

  return { theme, isDark, init, toggle }
})
