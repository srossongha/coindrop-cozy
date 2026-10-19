<script setup lang="ts">
const { activePoll, returnToHome } = useRoom()
const { dropCoin } = useCoinDrop()

const copied = ref(false)

const maxCoins = computed(() => {
  if (!activePoll.value) return 0
  return Math.max(...activePoll.value.options.map(o => o.coinsCount))
})

function isWinningOption(coinsCount: number): boolean {
  return coinsCount > 0 && coinsCount === maxCoins.value
}

function copyCode() {
  if (activePoll.value?.code) {
    navigator.clipboard.writeText(activePoll.value.code)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  }
}

function voteForOption(optionId: string) {
  if (!activePoll.value) return
  const opt = activePoll.value.options.find(o => o.id === optionId)
  if (opt) {
    opt.coinsCount++
    dropCoin()
  }
}
</script>

<template>
  <div
    v-if="activePoll"
    class="fixed inset-0 pointer-events-none z-10 flex flex-col justify-between p-6"
  >
    <div class="h-16" />

    <!-- Poll Header & Question Card -->
    <div
      class="max-w-xl mx-auto w-full pointer-events-auto backdrop-blur-xl bg-[#121a2b] border border-[#25314a] rounded-[16px] p-5 shadow-2xl"
    >
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center space-x-2">
          <span
            class="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#0b1220] text-[#d0ebff] border border-[#25314a]"
          >
            Live 3D Poll
          </span>
          <button
            type="button"
            class="px-2.5 py-1 rounded-full text-xs font-mono bg-[#0b1220] text-[#8fa3c4] hover:text-[#eaf2ff] border border-[#25314a] flex items-center space-x-1.5 cursor-pointer transition-colors"
            @click="copyCode"
          >
            <span
              >Code: <strong class="text-[#d0ebff]">{{ activePoll.code }}</strong></span
            >
            <span class="text-[10px] text-[#8fa3c4]">{{ copied ? '✓ Copied' : '📋' }}</span>
          </button>
        </div>

        <button
          type="button"
          class="text-xs text-[#8fa3c4] hover:text-[#eaf2ff] transition-colors cursor-pointer px-2.5 py-1 rounded-lg border border-[#25314a] bg-[#0b1220]"
          @click="returnToHome"
        >
          Exit Poll
        </button>
      </div>

      <h2 class="text-lg font-black text-[#eaf2ff] mb-4">
        {{ activePoll.title }}
      </h2>

      <!-- Voting Options Grid -->
      <div class="grid grid-cols-2 gap-2.5">
        <button
          v-for="opt in activePoll.options"
          :key="opt.id"
          type="button"
          :class="[
            'p-3.5 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between group relative',
            isWinningOption(opt.coinsCount)
              ? 'bg-[#0b1220] ring-2 ring-[#74b9ff] shadow-sky-glow'
              : 'bg-[#0b1220] border border-[#25314a] hover:border-[#d0ebff]/50 hover:shadow-sky-glow',
          ]"
          @click="voteForOption(opt.id)"
        >
          <div class="flex items-center space-x-2.5 min-w-0">
            <span
              v-if="isWinningOption(opt.coinsCount)"
              class="text-xs shrink-0"
              title="Current Leader"
            >
              👑
            </span>
            <span
              class="text-sm font-semibold text-[#eaf2ff] group-hover:text-white transition-colors truncate"
            >
              {{ opt.label }}
            </span>
          </div>

          <!-- Coin Counter (Strictly reserved #f5c242) -->
          <div
            class="flex items-center space-x-1 font-mono text-xs font-bold text-[#f5c242] bg-[#f5c242]/10 border border-[#f5c242]/20 px-2 py-1 rounded-lg shrink-0 ml-2"
          >
            <span>🪙</span>
            <span>{{ opt.coinsCount }}</span>
          </div>
        </button>
      </div>
    </div>

    <!-- Bottom Hint -->
    <div class="flex justify-center pointer-events-auto">
      <div
        class="text-xs text-[#8fa3c4] font-mono backdrop-blur-md bg-[#121a2b] px-4 py-2 rounded-full border border-[#25314a]"
      >
        Click an option above to drop a vote coin into the arena
      </div>
    </div>
  </div>
</template>
