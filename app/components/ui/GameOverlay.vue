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
        class="pointer-events-auto backdrop-blur-md bg-slate-900/60 border border-slate-700/50 rounded-2xl p-4 shadow-xl"
      >
        <div class="flex items-center space-x-6">
          <div>
            <p class="text-xs uppercase tracking-wider text-slate-400 font-mono">Total Score</p>
            <p class="text-2xl font-black text-amber-400">{{ totalScore }}</p>
          </div>
          <div class="h-8 w-px bg-slate-700/60" />
          <div>
            <p class="text-xs uppercase tracking-wider text-slate-400 font-mono">Coins Dropped</p>
            <p class="text-2xl font-black text-white">{{ coinsDroppedCount }}</p>
          </div>
          <div class="h-8 w-px bg-slate-700/60" />
          <div>
            <p class="text-xs uppercase tracking-wider text-slate-400 font-mono">Active</p>
            <p class="text-2xl font-black text-cyan-400">{{ coins.length }}</p>
          </div>
        </div>
      </div>

      <button
        type="button"
        class="pointer-events-auto px-4 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold backdrop-blur-md transition-colors cursor-pointer flex items-center space-x-1.5"
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
          class="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 active:scale-95 text-slate-950 font-black text-base shadow-lg shadow-amber-500/25 transition-all duration-150 cursor-pointer flex items-center space-x-2"
          @click="dropCoin"
        >
          <span>Drop Coin</span>
          <kbd
            class="px-2 py-0.5 text-xs bg-slate-950/20 text-slate-900 rounded font-mono font-bold"
            >Space</kbd
          >
        </button>

        <button
          type="button"
          class="px-4 py-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 active:scale-95 text-slate-300 hover:text-white border border-slate-700/60 font-medium text-sm transition-all duration-150 cursor-pointer"
          @click="resetCoins"
        >
          Reset
        </button>
      </div>

      <div
        class="flex items-center space-x-6 text-xs text-slate-400 font-mono backdrop-blur-sm bg-slate-950/40 px-4 py-2 rounded-full border border-slate-800/50"
      >
        <span>🖱️ Drag to rotate</span>
        <span>•</span>
        <span>🔍 Scroll to zoom</span>
        <span>•</span>
        <span>🟡 Gold (10pts)</span>
        <span>🟠 Bronze (25pts)</span>
        <span>💎 Diamond (50pts)</span>
      </div>
    </div>
  </div>
</template>
