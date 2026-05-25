import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type Theme = 'dark' | 'light'

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<Theme>('dark')

  function applyTheme(t: Theme) {
    const root = document.documentElement
    const body = document.body

    // Clear both classes first
    root.classList.remove('dark', 'light')
    body.classList.remove('dark', 'light')

    // Add the appropriate class
    if (t === 'dark') {
      root.classList.add('dark')
      body.classList.add('dark')
    } else {
      root.classList.add('light')
      body.classList.add('light')
    }
  }

  function toggle() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  function init() {
    applyTheme(theme.value)
  }

  watch(theme, applyTheme)

  return { theme, toggle, init }
})
