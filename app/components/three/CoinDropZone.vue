<script setup lang="ts">
// Floor / Drop Platform
</script>

<template>
  <TresGroup>
    <!-- Base Platform -->
    <TresMesh :position="[0, 0, 0]" receive-shadow>
      <TresCylinderGeometry :args="[3.5, 3.8, 0.4, 48]" />
      <TresMeshStandardMaterial color="#1e1b4b" :metalness="0.5" :roughness="0.4" />
    </TresMesh>

    <!-- Outer Glow Ring -->
    <TresMesh :position="[0, 0.21, 0]" :rotation="[-Math.PI / 2, 0, 0]">
      <TresRingGeometry :args="[3.3, 3.45, 48]" />
      <TresMeshBasicMaterial color="#6366f1" />
    </TresMesh>

    <!-- Inner Target Ring -->
    <TresMesh :position="[0, 0.21, 0]" :rotation="[-Math.PI / 2, 0, 0]">
      <TresRingGeometry :args="[1.2, 1.3, 36]" />
      <TresMeshBasicMaterial color="#38bdf8" />
    </TresMesh>

    <!-- Center Bonus Spot -->
    <TresMesh :position="[0, 0.21, 0]" :rotation="[-Math.PI / 2, 0, 0]">
      <TresCircleGeometry :args="[0.4, 32]" />
      <TresMeshBasicMaterial color="#fbbf24" />
    </TresMesh>
  </TresGroup>
</template>
