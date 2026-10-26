<script setup lang="ts">
import IosInstallPrompt from '~/components/ui/IosInstallPrompt.vue'
</script>

<template>
  <div
    class="main-layout min-h-[100dvh] bg-canvas-glow text-[#eaf2ff] font-sans selection:bg-[#74b9ff]/30 selection:text-[#d0ebff]"
  >
    <slot />
    <ClientOnly>
      <IosInstallPrompt />
    </ClientOnly>
  </div>
</template>

<style scoped>
.main-layout {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
</style>
