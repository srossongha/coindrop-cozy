<script setup lang="ts">
import HeaderNav from '~/components/ui/HeaderNav.vue'
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-white overflow-hidden select-none relative">
    <HeaderNav />
    <main class="w-full h-screen relative">
      <slot />
    </main>
  </div>
</template>
