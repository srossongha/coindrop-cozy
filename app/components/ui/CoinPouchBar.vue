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
  <div class="fixed bottom-4 inset-x-0 z-30 px-4 pointer-events-none">
    <div
      class="max-w-2xl mx-auto pointer-events-auto bg-[#121a2b]/95 backdrop-blur-xl border border-[#25314a] rounded-[16px] px-4 py-3 shadow-2xl flex items-center justify-between gap-4 transition-all hover:border-[#74b9ff]/40 shadow-sky-glow"
    >
      <!-- User Persona & Remaining Summary -->
      <button
        type="button"
        class="flex items-center gap-3 text-left cursor-pointer group"
        title="Click to edit your persona"
        @click="emit('editIdentity')"
      >
        <div
          class="w-10 h-10 rounded-xl bg-[#0b1220] border border-[#25314a] group-hover:border-[#74b9ff]/50 flex items-center justify-center text-xl shrink-0 transition-colors"
        >
          {{ user.emoji }}
        </div>
        <div>
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold uppercase tracking-wider text-[#d0ebff]">
              Your Coin Pouch
            </span>
            <span
              class="text-xs font-medium text-[#8fa3c4] group-hover:text-[#74b9ff] transition-colors"
            >
              ({{ user.name }})
            </span>
          </div>
          <p class="text-[11px] text-[#8fa3c4] hidden sm:block">
            5 Gold Coins (1 pt) & 2 Red Coins (2 pts). Drop them onto your top choices!
          </p>
        </div>
      </button>

      <!-- Coin Pockets -->
      <div class="flex items-center gap-3 shrink-0">
        <!-- Gold Pocket -->
        <div class="flex flex-col items-end">
          <span class="text-[10px] uppercase font-bold text-[#f5c242] tracking-wider mb-0.5">
            Gold: {{ goldRemaining }}/5
          </span>
          <div class="flex items-center gap-1">
            <div
              v-for="(_, idx) in maxGold || 5"
              :key="'gp-' + idx"
              class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 select-none"
              :class="[
                idx < goldRemaining
                  ? 'bg-[#0b1220] border-2 border-[#f5c242] shadow-sm shadow-[#f5c242]/30 scale-100'
                  : 'bg-[#0b1220]/40 text-[#8fa3c4]/30 border border-dashed border-[#25314a] scale-90 opacity-40',
              ]"
            >
              🪙
            </div>
          </div>
        </div>

        <div class="w-px h-8 bg-[#25314a]" />

        <!-- Red Pocket (Super Votes) -->
        <div class="flex flex-col items-end">
          <span class="text-[10px] uppercase font-bold text-[#ef4444] tracking-wider mb-0.5">
            Red: {{ redRemaining }}/2
          </span>
          <div class="flex items-center gap-1">
            <div
              v-for="(_, idx) in maxRed || 2"
              :key="'rp-' + idx"
              class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 select-none"
              :class="[
                idx < redRemaining
                  ? 'bg-[#0b1220] border-2 border-[#ef4444] shadow-sm shadow-[#ef4444]/30 scale-100'
                  : 'bg-[#0b1220]/40 text-[#8fa3c4]/30 border border-dashed border-[#25314a] scale-90 opacity-40',
              ]"
            >
              🔴
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
