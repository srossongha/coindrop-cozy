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
  padding-top: env(safe-area-inset-top, 0px);
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
/* If the layout contains a sticky/fixed header, let the header handle top safe area so its glass background extends behind the notch */
.main-layout:has(header),
.main-layout:has(nav.sticky) {
  padding-top: 0;
}
</style>
