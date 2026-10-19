<script setup lang="ts">
const { activePoll, returnToHome } = useRoom()
const { dropCoin } = useCoinDrop()

const copied = ref(false)

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
      class="max-w-xl mx-auto w-full pointer-events-auto backdrop-blur-xl bg-slate-900/80 border border-purple-500/30 rounded-3xl p-5 shadow-2xl"
    >
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center space-x-2">
          <span
            class="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30"
          >
            Live 3D Poll
          </span>
          <button
            type="button"
            class="px-2.5 py-1 rounded-full text-xs font-mono bg-slate-800 text-slate-300 hover:text-white border border-slate-700 flex items-center space-x-1 cursor-pointer transition-colors"
            @click="copyCode"
          >
            <span
              >Code: <strong class="text-purple-400">{{ activePoll.code }}</strong></span
            >
            <span class="text-[10px] text-slate-400">{{ copied ? '✓ Copied' : '📋' }}</span>
          </button>
        </div>

        <button
          type="button"
          class="text-xs text-slate-400 hover:text-rose-400 transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-rose-500/10"
          @click="returnToHome"
        >
          Exit Poll
        </button>
      </div>

      <h2 class="text-lg font-black text-white mb-4">
        {{ activePoll.title }}
      </h2>

      <!-- Voting Options Grid -->
      <div class="grid grid-cols-2 gap-2.5">
        <button
          v-for="opt in activePoll.options"
          :key="opt.id"
          type="button"
          class="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-purple-500/60 active:scale-98 text-left transition-all cursor-pointer flex items-center justify-between group"
          @click="voteForOption(opt.id)"
        >
          <div class="flex items-center space-x-2.5">
            <div
              class="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
              :style="{ backgroundColor: opt.color }"
            />
            <span
              class="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors"
            >
              {{ opt.label }}
            </span>
          </div>
          <div
            class="flex items-center space-x-1 font-mono text-xs font-bold text-purple-400 bg-purple-500/10 px-2 py-1 rounded-lg"
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
        class="text-xs text-slate-400 font-mono backdrop-blur-md bg-slate-950/60 px-4 py-2 rounded-full border border-slate-800"
      >
        Click an option above to drop a vote coin into the arena
      </div>
    </div>
  </div>
</template>
