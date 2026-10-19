<script setup lang="ts">
const { activeLobby, returnToHome } = useRoom()
const { coins, coinsDroppedCount, totalScore, dropCoin, resetCoins } = useCoinDrop()

const copied = ref(false)

function copyCode() {
  if (activeLobby.value?.code) {
    navigator.clipboard.writeText(activeLobby.value.code)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  }
}
</script>

<template>
  <div
    v-if="activeLobby"
    class="fixed inset-0 pointer-events-none z-10 flex flex-col justify-between p-6"
  >
    <div class="h-16" />

    <!-- Lobby Header Card -->
    <div
      class="max-w-2xl mx-auto w-full pointer-events-auto backdrop-blur-xl bg-slate-900/80 border border-amber-500/30 rounded-3xl p-5 shadow-2xl"
    >
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center space-x-2">
          <span
            class="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30"
          >
            🎮 {{ activeLobby.mode }}
          </span>
          <button
            type="button"
            class="px-2.5 py-1 rounded-full text-xs font-mono bg-slate-800 text-slate-300 hover:text-white border border-slate-700 flex items-center space-x-1 cursor-pointer transition-colors"
            @click="copyCode"
          >
            <span
              >Room: <strong class="text-amber-400">{{ activeLobby.code }}</strong></span
            >
            <span class="text-[10px] text-slate-400">{{ copied ? '✓ Copied' : '📋' }}</span>
          </button>
        </div>

        <button
          type="button"
          class="text-xs text-slate-400 hover:text-rose-400 transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-rose-500/10"
          @click="returnToHome"
        >
          Leave Lobby
        </button>
      </div>

      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-black text-white">
            {{ activeLobby.name }}
          </h2>
          <p class="text-xs text-slate-400 font-mono mt-0.5">
            Capacity: 1/{{ activeLobby.maxPlayers }} Players •
            {{ activeLobby.isPrivate ? 'Private Room' : 'Public Room' }}
          </p>
        </div>

        <!-- Mini Stats -->
        <div
          class="flex items-center space-x-4 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800"
        >
          <div>
            <p class="text-[10px] text-slate-500 uppercase font-mono">Score</p>
            <p class="text-sm font-bold text-amber-400 font-mono">{{ totalScore }}</p>
          </div>
          <div>
            <p class="text-[10px] text-slate-500 uppercase font-mono">Dropped</p>
            <p class="text-sm font-bold text-white font-mono">{{ coinsDroppedCount }}</p>
          </div>
          <div>
            <p class="text-[10px] text-slate-500 uppercase font-mono">Active</p>
            <p class="text-sm font-bold text-cyan-400 font-mono">{{ coins.length }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Controls -->
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
          Reset Arena
        </button>
      </div>

      <div
        class="flex items-center space-x-6 text-xs text-slate-400 font-mono backdrop-blur-sm bg-slate-950/40 px-4 py-2 rounded-full border border-slate-800/50"
      >
        <span>🖱️ Drag to rotate</span>
        <span>•</span>
        <span>🔍 Scroll to zoom</span>
      </div>
    </div>
  </div>
</template>
