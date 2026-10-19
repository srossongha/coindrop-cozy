<script setup lang="ts">
import { Sparkles, PartyPopper, Lock } from 'lucide-vue-next'
import type { EnrichedOption } from '~/types'

const props = defineProps<{
  options: EnrichedOption[]
  lockedWinnerId: string | null
}>()

const emit = defineEmits<{
  lockWinner: [optionId: string]
}>()

const activePool = computed(() => {
  const withVotes = props.options.filter(o => o.totalCoins > 0)
  return withVotes.length > 0 ? withVotes : props.options
})

const rotation = ref(0)
const isSpinning = ref(false)
const winner = ref<EnrichedOption | null>(null)

// Calibrated pastel palette for wheel segments that matches developer-tool vibe
const WHEEL_COLORS = [
  '#74b9ff', // pastel sky
  '#25314a', // deep line slate
  '#a5d8ff', // soft sky
  '#1e293b', // night navy
  '#d0ebff', // sky highlight
  '#334155', // slate blue
]

function spinWheel() {
  if (isSpinning.value || activePool.value.length === 0) return
  isSpinning.value = true
  winner.value = null

  const extraSpins = 5 + Math.floor(Math.random() * 4)
  const randomAngle = Math.floor(Math.random() * 360)
  const totalNewRotation = rotation.value + extraSpins * 360 + randomAngle
  rotation.value = totalNewRotation

  setTimeout(() => {
    isSpinning.value = false
    const normalizedAngle = (360 - (totalNewRotation % 360)) % 360
    const sliceAngle = 360 / activePool.value.length
    const winningIndex = Math.floor(normalizedAngle / sliceAngle) % activePool.value.length
    winner.value = activePool.value[winningIndex] || null
  }, 3600)
}

function getSegmentPath(index: number, total: number) {
  const angle = 360 / total
  const startAngle = index * angle
  const endAngle = (index + 1) * angle
  const startRad = (Math.PI / 180) * startAngle
  const endRad = (Math.PI / 180) * endAngle

  const x1 = 100 * Math.cos(startRad)
  const y1 = 100 * Math.sin(startRad)
  const x2 = 100 * Math.cos(endRad)
  const y2 = 100 * Math.sin(endRad)
  const largeArc = angle > 180 ? 1 : 0

  if (total === 1) {
    return 'M 0 0 m -100, 0 a 100,100 0 1,0 200,0 a 100,100 0 1,0 -200,0'
  }
  return `M 0 0 L ${x1} ${y1} A 100 100 0 ${largeArc} 1 ${x2} ${y2} Z`
}

function getMidAngle(index: number, total: number) {
  const angle = 360 / total
  return index * angle + angle / 2
}
</script>

<template>
  <div
    class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-card border border-line rounded-[16px] p-6 sm:p-8"
  >
    <!-- Left Column: Explanation & Contenders -->
    <div class="lg:col-span-5 space-y-5">
      <div
        class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-canvas border border-line text-sky-soft text-xs font-bold font-mono"
      >
        <Sparkles class="w-3.5 h-3.5" />
        <span>Synced Physics Tie-Breaker</span>
      </div>

      <h2 class="text-2xl font-extrabold text-text-primary">
        Can’t break a tie? Let the wheel decide!
      </h2>
      <p class="text-sm text-text-muted leading-relaxed">
        All options that received at least 1 gold coin are loaded onto the wheel below. Hit spin to
        run a smooth cubic-bezier physics roll.
      </p>

      <div class="space-y-2">
        <div class="text-xs font-bold uppercase tracking-wider text-text-muted font-mono">
          Contenders on the Wheel ({{ activePool.length }})
        </div>
        <div
          v-for="(item, idx) in activePool"
          :key="item.id"
          class="flex items-center justify-between px-3.5 py-2 rounded-xl bg-canvas border border-line text-xs"
        >
          <div class="flex items-center gap-2.5 truncate">
            <span
              class="w-3 h-3 rounded-full shrink-0"
              :style="{ backgroundColor: WHEEL_COLORS[idx % WHEEL_COLORS.length] }"
            />
            <span class="font-semibold text-text-primary truncate">{{ item.title }}</span>
          </div>
          <span class="font-mono text-gold shrink-0 font-bold">{{ item.totalCoins }} 🪙</span>
        </div>
      </div>

      <button
        type="button"
        :disabled="isSpinning || activePool.length === 0"
        class="w-full py-3.5 rounded-xl bg-sky-gradient text-canvas font-black text-sm shadow-md transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
        @click="spinWheel"
      >
        {{ isSpinning ? 'Spinning the Wheel...' : '🎡 Spin Tie-Breaker Wheel!' }}
      </button>

      <!-- Winner Announcement Box -->
      <div v-if="winner" class="p-4 rounded-xl bg-canvas border border-emerald animate-in fade-in">
        <div class="flex items-center justify-between mb-1">
          <span
            class="text-xs font-bold uppercase tracking-wider text-emerald flex items-center gap-1.5"
          >
            <PartyPopper class="w-4 h-4" /> Wheel Selected Winner!
          </span>
          <span class="text-xs font-mono font-bold text-gold">{{ winner.totalCoins }} 🪙</span>
        </div>
        <div class="text-lg font-extrabold text-text-primary mb-3">{{ winner.title }}</div>
        <button
          type="button"
          class="w-full py-2 rounded-xl bg-emerald hover:bg-emerald/90 text-canvas font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          @click="emit('lockWinner', winner.id)"
        >
          <Lock class="w-3.5 h-3.5" />
          <span>
            {{
              lockedWinnerId === winner.id
                ? 'Locked as Official Winner!'
                : 'Lock In as Official Winner'
            }}
          </span>
        </button>
      </div>
    </div>

    <!-- Right Column: Interactive SVG Spinning Wheel -->
    <div class="lg:col-span-7 flex flex-col items-center justify-center relative py-4">
      <!-- Top Pointer Indicator -->
      <div class="z-20 -mb-3">
        <div
          class="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[24px] border-t-[#74b9ff] drop-shadow-lg"
        />
      </div>

      <div
        class="relative w-72 h-72 sm:w-80 sm:h-80 rounded-full p-2 bg-canvas border-4 border-line shadow-2xl flex items-center justify-center overflow-hidden"
      >
        <svg
          viewBox="-100 -100 200 200"
          class="w-full h-full rounded-full"
          :style="{
            transform: `rotate(${rotation - 90}deg)`,
            transition: isSpinning ? 'transform 3.6s cubic-bezier(0.15, 0.85, 0.25, 1)' : 'none',
          }"
        >
          <g v-for="(item, i) in activePool" :key="item.id">
            <path
              :d="getSegmentPath(i, activePool.length)"
              :fill="WHEEL_COLORS[i % WHEEL_COLORS.length]"
              stroke="#0b1220"
              stroke-width="2"
            />
            <g :transform="`rotate(${getMidAngle(i, activePool.length)}) translate(54, 0)`">
              <text
                text-anchor="middle"
                dominant-baseline="middle"
                fill="#ffffff"
                font-size="7.5"
                font-weight="bold"
              >
                {{ item.title.slice(0, 14) }}
              </text>
            </g>
          </g>
        </svg>

        <!-- Center Hub Cap -->
        <div
          class="absolute w-14 h-14 rounded-full bg-canvas border-4 border-sky-end flex items-center justify-center shadow-xl"
        >
          <span class="text-xl">🪙</span>
        </div>
      </div>
    </div>
  </div>
</template>
