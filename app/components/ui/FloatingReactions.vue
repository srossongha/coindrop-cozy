<script setup lang="ts">
import type { FloatingReaction } from '~/types'

defineProps<{
  reactions: FloatingReaction[]
}>()
</script>

<template>
  <div class="fixed inset-0 pointer-events-none z-50 overflow-hidden">
    <div
      v-for="r in reactions"
      :key="r.id"
      :style="{ left: `${r.leftOffset}%` }"
      class="absolute bottom-24 animate-bounce flex flex-col items-center transition-all duration-1000"
    >
      <span class="text-3xl drop-shadow-lg select-none">{{ r.emoji }}</span>
      <span
        class="text-[10px] font-bold bg-card/95 text-text-primary px-2 py-0.5 rounded-full border border-line shadow"
      >
        {{ r.authorName }}
      </span>
    </div>
  </div>
</template>
