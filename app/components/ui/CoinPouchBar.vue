<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Identity } from '~/types'

const props = defineProps<{
  user: Identity
  goldRemaining: number
  redRemaining: number
  maxGold?: number
  maxRed?: number
}>()

const emit = defineEmits<{
  (e: 'editIdentity'): void
}>()

const goldPulse = ref(false)
const redPulse = ref(false)

watch(
  () => props.goldRemaining,
  () => {
    goldPulse.value = true
    setTimeout(() => (goldPulse.value = false), 300)
  },
)

watch(
  () => props.redRemaining,
  () => {
    redPulse.value = true
    setTimeout(() => (redPulse.value = false), 300)
  },
)
</script>

<template>
  <div
    class="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] inset-x-0 z-30 px-2 sm:px-4 pointer-events-none flex justify-center"
  >
    <div
      class="pointer-events-auto max-w-[calc(100vw-1.5rem)] bg-card/95 backdrop-blur-xl border border-line hover:border-sky-end/40 rounded-full px-3 sm:px-4 py-2 shadow-2xl flex items-center gap-2 sm:gap-4 transition-all duration-300 shadow-sky-glow animate-toast-pop hover:scale-[1.02]"
    >
      <!-- User Persona (Tap to edit) -->
      <button
        type="button"
        class="flex items-center gap-1.5 text-xs text-text-primary font-semibold hover:text-sky-end transition-colors cursor-pointer active:scale-95 shrink-0"
        title="Tap to customize nickname or mascot"
        @click="emit('editIdentity')"
      >
        <span class="text-base">{{ user.emoji }}</span>
        <span class="max-w-[70px] xs:max-w-[100px] sm:max-w-[140px] truncate">{{ user.name }}</span>
      </button>

      <span class="w-px h-4 bg-line shrink-0" />

      <!-- Gold Coins Remaining -->
      <div
        class="flex items-center gap-1 text-xs font-bold text-gold transition-transform duration-200"
        :class="[goldPulse ? 'scale-125' : 'scale-100']"
        title="Gold Coins Remaining (1pt each)"
      >
        <span class="transition-transform duration-200" :class="[goldPulse ? 'rotate-12' : '']"
          >🪙</span
        >
        <span>{{ goldRemaining }}</span>
        <span class="text-[10px] text-text-muted font-normal hidden sm:inline">Gold</span>
      </div>

      <span class="w-px h-4 bg-line" />

      <!-- Red Coins Remaining -->
      <div
        class="flex items-center gap-1 text-xs font-bold text-red-500 transition-transform duration-200"
        :class="[redPulse ? 'scale-125' : 'scale-100']"
        title="Red Super Coins Remaining (2pt each)"
      >
        <span class="transition-transform duration-200" :class="[redPulse ? 'rotate-12' : '']"
          >🔴</span
        >
        <span>{{ redRemaining }}</span>
        <span class="text-[10px] text-text-muted font-normal hidden sm:inline">Super</span>
      </div>
    </div>
  </div>
</template>
