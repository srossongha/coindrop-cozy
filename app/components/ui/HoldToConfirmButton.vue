<script setup lang="ts">
import { RotateCcw, Check } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    label?: string
    holdDuration?: number
  }>(),
  {
    label: 'Hold to Reset All Coins',
    holdDuration: 1200,
  },
)

const emit = defineEmits<{
  confirm: []
}>()

const progress = ref(0)
const isHolding = ref(false)
const completed = ref(false)
let intervalId: ReturnType<typeof setInterval> | null = null
let startTime = 0

function startHold() {
  if (completed.value) return
  isHolding.value = true
  startTime = Date.now()
  intervalId = setInterval(() => {
    const elapsed = Date.now() - startTime
    const pct = Math.min(100, (elapsed / props.holdDuration) * 100)
    progress.value = pct
    if (pct >= 100) {
      if (intervalId) clearInterval(intervalId)
      isHolding.value = false
      completed.value = true
      emit('confirm')
      setTimeout(() => {
        completed.value = false
        progress.value = 0
      }, 1400)
    }
  }, 16)
}

function stopHold() {
  if (intervalId) clearInterval(intervalId)
  isHolding.value = false
  if (!completed.value) {
    progress.value = 0
  }
}

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>

<template>
  <button
    type="button"
    class="relative overflow-hidden select-none rounded-xl px-3.5 py-2 text-xs font-semibold transition-transform active:scale-95 border cursor-pointer"
    :class="[
      completed
        ? 'bg-[#121a2b] border-[#3fb950] text-[#3fb950]'
        : 'bg-[#121a2b] hover:bg-[#121a2b]/90 border-rose-500/40 text-rose-300',
      isHolding ? 'animate-pulse' : '',
    ]"
    @mousedown="startHold"
    @mouseup="stopHold"
    @mouseleave="stopHold"
    @touchstart="startHold"
    @touchend="stopHold"
  >
    <!-- Progress Fill Bar -->
    <span
      class="absolute inset-y-0 left-0 bg-gradient-to-r from-rose-500/30 to-[#74b9ff]/40 transition-none pointer-events-none"
      :style="{ width: `${progress}%` }"
    />
    <span class="relative z-10 flex items-center gap-1.5">
      <template v-if="completed">
        <Check class="w-3.5 h-3.5 text-[#3fb950]" />
        <span>Reset Complete!</span>
      </template>
      <template v-else>
        <RotateCcw class="w-3.5 h-3.5" :class="{ 'animate-spin': isHolding }" />
        <span>{{ isHolding ? `Keep Holding... ${Math.round(progress)}%` : label }}</span>
      </template>
    </span>
  </button>
</template>
