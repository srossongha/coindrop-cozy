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
  <div class="bg-card/90 border-b border-line">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-5">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <!-- Room Title, Code & Ephemeral Countdown -->
        <div>
          <div class="flex flex-wrap items-center gap-2 mb-1.5">
            <span
              class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-mono font-semibold bg-canvas text-sky-soft border border-line"
            >
              #{{ room.id }}
            </span>
            <span
              class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium font-mono bg-canvas text-text-muted border border-line"
            >
              <Clock class="w-3 h-3 text-sky-end" />
              Auto-deletes in {{ formatCountdown(secondsLeft) }}
            </span>
            <span
              v-if="room.lockedWinnerId"
              class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-canvas text-emerald border border-emerald/40"
            >
              <CheckCircle2 class="w-3.5 h-3.5" /> Decision Locked!
            </span>
          </div>

          <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
            {{ room.title }}
          </h1>
        </div>

        <!-- Share Link & Live Reaction Bar -->
        <div class="flex flex-wrap items-center gap-2">
          <div class="flex items-center bg-canvas border border-line rounded-xl p-1 gap-1">
            <button
              v-for="emo in ['🔥', '🍲', '🙌', '💯']"
              :key="emo"
              type="button"
              class="w-8 h-8 rounded-lg hover:bg-card flex items-center justify-center text-base transition-transform active:scale-125 cursor-pointer"
              :title="`Send live ${emo} reaction`"
              @click="emit('triggerReaction', emo)"
            >
              {{ emo }}
            </button>
          </div>

          <button
            type="button"
            class="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-gradient text-canvas font-bold text-xs shadow-md transition-all active:scale-95 hover:opacity-95 cursor-pointer"
            @click="emit('copyLink')"
          >
            <Share2 class="w-3.5 h-3.5" />
            <span>Copy Invite Link</span>
          </button>
        </div>
      </div>

      <!-- Navigation Tabs & Live Activity Ticker -->
      <div
        class="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-line"
      >
        <!-- Navigation Tabs -->
        <div class="flex items-center gap-1.5 bg-canvas p-1 rounded-2xl border border-line w-fit">
          <button
            type="button"
            class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
            :class="[
              activeTab === 'board'
                ? 'bg-card text-sky-soft border border-line shadow-sm'
                : 'text-text-muted hover:text-text-primary',
            ]"
            @click="emit('selectTab', 'board')"
          >
            <Coins class="w-4 h-4 text-gold" />
            <span>1. Coin Board ({{ room.options.length }})</span>
          </button>

          <button
            type="button"
            class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
            :class="[
              activeTab === 'wheel'
                ? 'bg-card text-sky-soft border border-line shadow-sm'
                : 'text-text-muted hover:text-text-primary',
            ]"
            @click="emit('selectTab', 'wheel')"
          >
            <Sparkles class="w-4 h-4 text-sky-end" />
            <span>2. Tie-Breaker Wheel</span>
          </button>

          <button
            type="button"
            class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
            :class="[
              activeTab === 'split'
                ? 'bg-card text-sky-soft border border-line shadow-sm'
                : 'text-text-muted hover:text-text-primary',
            ]"
            @click="emit('selectTab', 'split')"
          >
            <Receipt class="w-4 h-4 text-emerald" />
            <span>3. Fair Split & QR ({{ room.expenses.length }})</span>
          </button>
        </div>

        <!-- Live Activity Ticker -->
        <div
          v-if="liveFeed.length > 0"
          class="flex items-center gap-2 text-xs text-text-muted bg-canvas border border-line px-3 py-1.5 rounded-xl truncate max-w-md font-mono"
        >
          <span class="w-2 h-2 rounded-full bg-emerald animate-ping shrink-0" />
          <span class="truncate text-text-primary">{{ liveFeed[0]?.text }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
