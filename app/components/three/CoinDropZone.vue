<script setup lang="ts">
// Floor / Drop Platform
</script>

<template>
  <TresGroup>
    <!-- Base Platform -->
    <TresMesh :position="[0, 0, 0]" receive-shadow>
      <TresCylinderGeometry :args="[3.5, 3.8, 0.4, 48]" />
      <TresMeshStandardMaterial color="#121a2b" :metalness="0.5" :roughness="0.4" />
    </TresMesh>

    <!-- Outer Line Ring -->
    <TresMesh :position="[0, 0.21, 0]" :rotation="[-Math.PI / 2, 0, 0]">
      <TresRingGeometry :args="[3.3, 3.45, 48]" />
      <TresMeshBasicMaterial color="#25314a" />
    </TresMesh>

    <!-- Inner Sky Target Ring -->
    <TresMesh :position="[0, 0.21, 0]" :rotation="[-Math.PI / 2, 0, 0]">
      <TresRingGeometry :args="[1.2, 1.3, 36]" />
      <TresMeshBasicMaterial color="#74b9ff" />
    </TresMesh>

    <!-- Center Gold Bullseye -->
    <TresMesh :position="[0, 0.21, 0]" :rotation="[-Math.PI / 2, 0, 0]">
      <TresCircleGeometry :args="[0.4, 32]" />
      <TresMeshBasicMaterial color="#f5c242" />
    </TresMesh>
  </TresGroup>
</template>
