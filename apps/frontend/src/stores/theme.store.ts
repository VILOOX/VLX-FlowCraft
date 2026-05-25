import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<'light' | 'dark'>('dark');

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark';
    document.body.classList.toggle('light', theme.value === 'light');
  }

  return { theme, toggleTheme };
});
