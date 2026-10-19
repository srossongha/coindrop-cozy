<script setup lang="ts">
import type { Identity } from '~/types'

defineProps<{
  user: Identity
  goldRemaining: number
  redRemaining: number
  maxGold?: number
  maxRed?: number
}>()

const emit = defineEmits<{
  (e: 'editIdentity'): void
}>()
</script>

<template>
  <div class="fixed bottom-4 inset-x-0 z-30 px-4 pointer-events-none flex justify-center">
    <div
      class="pointer-events-auto bg-[#121a2b]/95 backdrop-blur-xl border border-[#25314a] hover:border-[#74b9ff]/40 rounded-full px-4 py-2 shadow-2xl flex items-center gap-3 sm:gap-4 transition-all duration-300 shadow-sky-glow animate-in slide-in-from-bottom-2"
    >
      <!-- User Persona (Tap to edit) -->
      <button
        type="button"
        class="flex items-center gap-1.5 text-xs text-[#eaf2ff] font-semibold hover:text-[#74b9ff] transition-colors cursor-pointer"
        title="Tap to customize nickname or mascot"
        @click="emit('editIdentity')"
      >
        <span class="text-base">{{ user.emoji }}</span>
        <span class="max-w-[90px] sm:max-w-[120px] truncate">{{ user.name }}</span>
      </button>

      <span class="w-px h-4 bg-[#25314a]" />

      <!-- Gold Coins Remaining -->
      <div
        class="flex items-center gap-1 text-xs font-bold text-[#f5c242]"
        title="Gold Coins Remaining (1pt each)"
      >
        <span>🪙</span>
        <span>{{ goldRemaining }}</span>
        <span class="text-[10px] text-[#8fa3c4] font-normal hidden sm:inline">Gold</span>
      </div>

      <span class="w-px h-4 bg-[#25314a]" />

      <!-- Red Coins Remaining -->
      <div
        class="flex items-center gap-1 text-xs font-bold text-[#ef4444]"
        title="Red Super Coins Remaining (2pt each)"
      >
        <span>🔴</span>
        <span>{{ redRemaining }}</span>
        <span class="text-[10px] text-[#8fa3c4] font-normal hidden sm:inline">Super</span>
      </div>
    </div>
  </div>
</template>
