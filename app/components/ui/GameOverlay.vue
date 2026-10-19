<script setup lang="ts">
const { coins, coinsDroppedCount, totalScore, dropCoin, resetCoins } = useCoinDrop()
const { returnToHome } = useRoom()

function handleKeyDown(e: KeyboardEvent) {
  if (e.code === 'Space') {
    if ((e.target as HTMLElement)?.tagName === 'BUTTON') return
    e.preventDefault()
    dropCoin()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <div class="fixed inset-0 pointer-events-none z-10 flex flex-col justify-between p-6">
    <!-- Spacer for header -->
    <div class="h-16" />

    <!-- Stats HUD & Return to Home -->
    <div class="flex items-center justify-between w-full max-w-4xl mx-auto">
      <div
        class="pointer-events-auto backdrop-blur-md bg-[#121a2b] border border-[#25314a] rounded-[16px] p-4 shadow-xl"
      >
        <div class="flex items-center space-x-6">
          <div>
            <p class="text-xs uppercase tracking-wider text-[#8fa3c4] font-mono">Total Score</p>
            <p class="text-2xl font-black text-[#f5c242] font-mono">{{ totalScore }}</p>
          </div>
          <div class="h-8 w-px bg-[#25314a]" />
          <div>
            <p class="text-xs uppercase tracking-wider text-[#8fa3c4] font-mono">Coins Dropped</p>
            <p class="text-2xl font-black text-[#eaf2ff] font-mono">{{ coinsDroppedCount }}</p>
          </div>
          <div class="h-8 w-px bg-[#25314a]" />
          <div>
            <p class="text-xs uppercase tracking-wider text-[#8fa3c4] font-mono">Active</p>
            <p class="text-2xl font-black text-[#d0ebff] font-mono">{{ coins.length }}</p>
          </div>
        </div>
      </div>

      <button
        type="button"
        class="pointer-events-auto px-4 py-2.5 rounded-xl bg-[#121a2b] hover:bg-[#25314a] text-[#8fa3c4] hover:text-[#eaf2ff] border border-[#25314a] text-xs font-semibold backdrop-blur-md transition-colors cursor-pointer flex items-center space-x-1.5"
        @click="returnToHome"
      >
        <span>← Back to Home</span>
      </button>
    </div>

    <!-- Bottom Controls & Hints -->
    <div class="flex flex-col items-center space-y-4 pointer-events-auto">
      <div class="flex items-center space-x-3">
        <button
          type="button"
          class="px-8 py-3.5 rounded-xl bg-sky-gradient text-[#0b1220] font-bold text-base shadow-md transition-all duration-150 hover:opacity-95 active:scale-98 cursor-pointer flex items-center space-x-2"
          @click="dropCoin"
        >
          <span>Drop Coin</span>
          <kbd
            class="px-2 py-0.5 text-xs bg-[#0b1220]/20 text-[#0b1220] rounded font-mono font-bold"
          >
            Space
          </kbd>
        </button>

        <button
          type="button"
          class="px-4 py-3.5 rounded-xl bg-[#121a2b] hover:bg-[#25314a] text-[#8fa3c4] hover:text-[#eaf2ff] border border-[#25314a] font-medium text-sm transition-all duration-150 cursor-pointer"
          @click="resetCoins"
        >
          Reset
        </button>
      </div>

      <div
        class="flex items-center space-x-4 text-xs text-[#8fa3c4] font-mono backdrop-blur-sm bg-[#121a2b]/80 px-4 py-2 rounded-full border border-[#25314a]"
      >
        <span>🖱️ Drag to rotate</span>
        <span>•</span>
        <span>🔍 Scroll to zoom</span>
        <span>•</span>
        <span>🪙 Gold Coin</span>
      </div>
    </div>
  </div>
</template>
