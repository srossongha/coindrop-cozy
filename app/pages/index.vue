<script setup lang="ts">
import GameOverlay from '~/components/ui/GameOverlay.vue'
import CoinExperience from '~/components/three/CoinExperience.client.vue'

useHead({
  title: 'CoinDrop 3D — Nuxt 4 + Tres.js',
  meta: [
    {
      name: 'description',
      content: 'Interactive 3D Coin Drop built with Nuxt 4, Tres.js, and Tailwind CSS v4',
    },
  ],
})
</script>

<template>
  <div class="w-full h-full relative">
    <ClientOnly>
      <CoinExperience />
      <template #fallback>
        <div
          class="flex items-center justify-center h-full bg-slate-950 text-slate-400 font-mono text-sm"
        >
          Loading 3D Scene...
        </div>
      </template>
    </ClientOnly>
    <GameOverlay />
  </div>
</template>
