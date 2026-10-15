<script setup lang="ts">
defineProps<{
  position: [number, number, number]
  rotation: [number, number, number]
  color?: string
}>()
</script>

<template>
  <TresMesh :position="position" :rotation="rotation" cast-shadow>
    <TresCylinderGeometry :args="[0.45, 0.45, 0.08, 32]" />
    <TresMeshStandardMaterial :color="color || '#f59e0b'" :metalness="0.85" :roughness="0.2" />
  </TresMesh>
</template>
