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
      class="max-w-2xl mx-auto w-full pointer-events-auto backdrop-blur-xl bg-[#121a2b] border border-[#25314a] rounded-[16px] p-5 shadow-2xl"
    >
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center space-x-2">
          <span
            class="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#0b1220] text-[#d0ebff] border border-[#25314a]"
          >
            🎮 {{ activeLobby.mode }}
          </span>
          <button
            type="button"
            class="px-2.5 py-1 rounded-full text-xs font-mono bg-[#0b1220] text-[#8fa3c4] hover:text-[#eaf2ff] border border-[#25314a] flex items-center space-x-1.5 cursor-pointer transition-colors"
            @click="copyCode"
          >
            <span
              >Room: <strong class="text-[#d0ebff]">{{ activeLobby.code }}</strong></span
            >
            <span class="text-[10px] text-[#8fa3c4]">{{ copied ? '✓ Copied' : '📋' }}</span>
          </button>
        </div>

        <button
          type="button"
          class="text-xs text-[#8fa3c4] hover:text-[#eaf2ff] transition-colors cursor-pointer px-2.5 py-1 rounded-lg border border-[#25314a] bg-[#0b1220]"
          @click="returnToHome"
        >
          Leave Lobby
        </button>
      </div>

      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-black text-[#eaf2ff]">
            {{ activeLobby.name }}
          </h2>
          <p class="text-xs text-[#8fa3c4] font-mono mt-0.5">
            Capacity: 1/{{ activeLobby.maxPlayers }} Players •
            {{ activeLobby.isPrivate ? 'Private Room' : 'Public Room' }}
          </p>
        </div>

        <!-- Mini Stats -->
        <div
          class="flex items-center space-x-4 bg-[#0b1220] px-3.5 py-2 rounded-xl border border-[#25314a]"
        >
          <div>
            <p class="text-[10px] text-[#8fa3c4] uppercase font-mono">Score</p>
            <p class="text-sm font-bold text-[#f5c242] font-mono">{{ totalScore }}</p>
          </div>
          <div class="h-6 w-px bg-[#25314a]" />
          <div>
            <p class="text-[10px] text-[#8fa3c4] uppercase font-mono">Dropped</p>
            <p class="text-sm font-bold text-[#eaf2ff] font-mono">{{ coinsDroppedCount }}</p>
          </div>
          <div class="h-6 w-px bg-[#25314a]" />
          <div>
            <p class="text-[10px] text-[#8fa3c4] uppercase font-mono">Active</p>
            <p class="text-sm font-bold text-[#d0ebff] font-mono">{{ coins.length }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Controls -->
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
          Reset Arena
        </button>
      </div>

      <div
        class="flex items-center space-x-6 text-xs text-[#8fa3c4] font-mono backdrop-blur-sm bg-[#121a2b]/80 px-4 py-2 rounded-full border border-[#25314a]"
      >
        <span>🖱️ Drag to rotate</span>
        <span>•</span>
        <span>🔍 Scroll to zoom</span>
      </div>
    </div>
  </div>
</template>
