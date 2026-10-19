<script setup lang="ts">
import type { UserProfile } from '~/types'
import { MAX_COINS_PER_USER } from '~/utils/constants'

defineProps<{
  userProfile: UserProfile
  myCoinsRemaining: number
  shakePouch: boolean
}>()
</script>

<template>
  <div class="fixed bottom-4 inset-x-0 z-30 px-4 pointer-events-none">
    <div
      class="max-w-xl mx-auto pointer-events-auto bg-[#121a2b]/95 backdrop-blur-xl border rounded-[16px] px-4 py-3 shadow-2xl flex items-center justify-between gap-4 transition-all"
      :class="[
        shakePouch
          ? 'border-rose-500 animate-bounce'
          : 'border-[#25314a] hover:border-[#d0ebff]/40 shadow-sky-glow',
      ]"
    >
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 rounded-xl bg-[#0b1220] border border-[#25314a] flex items-center justify-center text-xl shrink-0"
        >
          {{ userProfile.emoji }}
        </div>
        <div>
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold uppercase tracking-wider text-[#d0ebff] font-mono">
              Your Coin Pouch
            </span>
            <span class="text-xs font-mono font-bold text-[#f5c242]">
              ({{ myCoinsRemaining }}/{{ MAX_COINS_PER_USER }} left)
            </span>
          </div>
          <p class="text-[11px] text-[#8fa3c4] hidden sm:block">
            {{
              myCoinsRemaining === 0
                ? 'All coins deployed! Reclaim with -1🪙 to change votes.'
                : 'Spread your coins out or go all-in on your favorite card.'
            }}
          </p>
        </div>
      </div>

      <!-- Visual Gold Coins (Strictly #f5c242 reserved for coins) -->
      <div class="flex items-center gap-1.5 shrink-0">
        <div
          v-for="(_, idx) in MAX_COINS_PER_USER"
          :key="idx"
          class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black transition-all duration-300 select-none"
          :class="[
            idx < myCoinsRemaining
              ? 'bg-[#0b1220] border-2 border-[#f5c242] shadow-sm shadow-[#f5c242]/30 scale-100'
              : 'bg-[#0b1220]/40 text-[#8fa3c4]/30 border border-dashed border-[#25314a] scale-90 opacity-40',
          ]"
        >
          🪙
        </div>
      </div>
    </div>
  </div>
</template>
