<script setup lang="ts">
import HeaderNav from '~/components/ui/HeaderNav.vue'
</script>

<template>
  <div
    class="min-h-screen bg-canvas-glow text-[#eaf2ff] overflow-hidden select-none relative font-sans"
  >
    <HeaderNav />
    <main class="w-full h-screen relative">
      <slot />
    </main>
  </div>
</template>
