import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useCanvasStore = defineStore('canvas', () => {
  const zoom = ref(1);
  const center = ref({ x: 0, y: 0 });

  function setZoom(value: number) {
    zoom.value = value;
  }

  function setCenter(x: number, y: number) {
    center.value = { x, y };
  }

  return { zoom, center, setZoom, setCenter };
});
