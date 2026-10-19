<script setup lang="ts">
import { Clock, CheckCircle2, Share2, Coins, Sparkles, Receipt } from 'lucide-vue-next'
import type { DecisionRoom, LiveFeedItem } from '~/types'

const props = defineProps<{
  room: DecisionRoom
  activeTab: 'board' | 'wheel' | 'split'
  liveFeed: LiveFeedItem[]
}>()

const emit = defineEmits<{
  selectTab: [tab: 'board' | 'wheel' | 'split']
  triggerReaction: [emoji: string]
  copyLink: []
}>()

// Active Countdown Timer
const secondsLeft = ref(props.room.expiresInSeconds)
let countdownInterval: ReturnType<typeof setInterval> | null = null

watch(
  () => props.room.expiresInSeconds,
  val => {
    secondsLeft.value = val
  },
)

onMounted(() => {
  countdownInterval = setInterval(() => {
    if (secondsLeft.value > 0) {
      secondsLeft.value--
    }
  }, 1000)
})

onUnmounted(() => {
  if (countdownInterval) clearInterval(countdownInterval)
})

function formatCountdown(secs: number) {
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  return `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`
}
</script>

<template>
  <div class="bg-[#121a2b]/90 border-b border-[#25314a]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-5">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <!-- Room Title, Code & Ephemeral Countdown -->
        <div>
          <div class="flex flex-wrap items-center gap-2 mb-1.5">
            <span
              class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-mono font-semibold bg-[#0b1220] text-[#d0ebff] border border-[#25314a]"
            >
              #{{ room.id }}
            </span>
            <span
              class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium font-mono bg-[#0b1220] text-[#8fa3c4] border border-[#25314a]"
            >
              <Clock class="w-3 h-3 text-[#74b9ff]" />
              Auto-deletes in {{ formatCountdown(secondsLeft) }}
            </span>
            <span
              v-if="room.lockedWinnerId"
              class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#0b1220] text-[#3fb950] border border-[#3fb950]/40"
            >
              <CheckCircle2 class="w-3.5 h-3.5" /> Decision Locked!
            </span>
          </div>

          <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#eaf2ff]">
            {{ room.title }}
          </h1>
        </div>

        <!-- Share Link & Live Reaction Bar -->
        <div class="flex flex-wrap items-center gap-2">
          <div class="flex items-center bg-[#0b1220] border border-[#25314a] rounded-xl p-1 gap-1">
            <button
              v-for="emo in ['🔥', '🍲', '🙌', '💯']"
              :key="emo"
              type="button"
              class="w-8 h-8 rounded-lg hover:bg-[#121a2b] flex items-center justify-center text-base transition-transform active:scale-125 cursor-pointer"
              :title="`Send live ${emo} reaction`"
              @click="emit('triggerReaction', emo)"
            >
              {{ emo }}
            </button>
          </div>

          <button
            type="button"
            class="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-gradient text-[#0b1220] font-bold text-xs shadow-md transition-all active:scale-95 hover:opacity-95 cursor-pointer"
            @click="emit('copyLink')"
          >
            <Share2 class="w-3.5 h-3.5" />
            <span>Copy Invite Link</span>
          </button>
        </div>
      </div>

      <!-- Navigation Tabs & Live Activity Ticker -->
      <div
        class="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-[#25314a]"
      >
        <!-- Navigation Tabs -->
        <div
          class="flex items-center gap-1.5 bg-[#0b1220] p-1 rounded-2xl border border-[#25314a] w-fit"
        >
          <button
            type="button"
            class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
            :class="[
              activeTab === 'board'
                ? 'bg-[#121a2b] text-[#d0ebff] border border-[#25314a] shadow-sm'
                : 'text-[#8fa3c4] hover:text-[#eaf2ff]',
            ]"
            @click="emit('selectTab', 'board')"
          >
            <Coins class="w-4 h-4 text-[#f5c242]" />
            <span>1. Coin Board ({{ room.options.length }})</span>
          </button>

          <button
            type="button"
            class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
            :class="[
              activeTab === 'wheel'
                ? 'bg-[#121a2b] text-[#d0ebff] border border-[#25314a] shadow-sm'
                : 'text-[#8fa3c4] hover:text-[#eaf2ff]',
            ]"
            @click="emit('selectTab', 'wheel')"
          >
            <Sparkles class="w-4 h-4 text-[#74b9ff]" />
            <span>2. Tie-Breaker Wheel</span>
          </button>

          <button
            type="button"
            class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
            :class="[
              activeTab === 'split'
                ? 'bg-[#121a2b] text-[#d0ebff] border border-[#25314a] shadow-sm'
                : 'text-[#8fa3c4] hover:text-[#eaf2ff]',
            ]"
            @click="emit('selectTab', 'split')"
          >
            <Receipt class="w-4 h-4 text-[#3fb950]" />
            <span>3. Fair Split & QR ({{ room.expenses.length }})</span>
          </button>
        </div>

        <!-- Live Activity Ticker -->
        <div
          v-if="liveFeed.length > 0"
          class="flex items-center gap-2 text-xs text-[#8fa3c4] bg-[#0b1220] border border-[#25314a] px-3 py-1.5 rounded-xl truncate max-w-md font-mono"
        >
          <span class="w-2 h-2 rounded-full bg-[#3fb950] animate-ping shrink-0" />
          <span class="truncate text-[#eaf2ff]">{{ liveFeed[0]?.text }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
