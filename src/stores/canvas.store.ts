import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCanvasStore = defineStore('canvas', () => {
  const addMenuVisible = ref(false)
  const addMenuScreenPos = ref({ x: 0, y: 0 })
  const addMenuFlowPos = ref({ x: 0, y: 0 })

  function openAddMenu(screen: { x: number; y: number }, flow: { x: number; y: number }) {
    addMenuScreenPos.value = screen
    addMenuFlowPos.value = flow
    addMenuVisible.value = true
  }

  function closeAddMenu() {
    addMenuVisible.value = false
  }

  return { addMenuVisible, addMenuScreenPos, addMenuFlowPos, openAddMenu, closeAddMenu }
})
