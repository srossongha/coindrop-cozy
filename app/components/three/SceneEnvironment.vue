<script setup lang="ts">
import { Stars } from '@tresjs/cientos'
</script>

<template>
  <TresAmbientLight :intensity="0.8" />
  <TresDirectionalLight :position="[5, 10, 5]" :intensity="1.5" cast-shadow />
  <TresDirectionalLight :position="[-5, 5, -5]" :intensity="0.4" color="#a5d8ff" />
  <Stars :radius="50" :depth="50" :count="1000" :size="0.8" :size-attenuation="true" />
</template>
