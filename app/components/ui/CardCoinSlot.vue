<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Minus, Flame } from 'lucide-vue-next'
import type { CoinType, EnrichedCardIdea } from '~/types'

const props = defineProps<{
  card: EnrichedCardIdea
  myGoldRemaining: number
  myRedRemaining: number
  isVotingPhase: boolean
  isHost: boolean
  activeDrop: { cardId: string; coinType: CoinType; key: number } | null
}>()

const emit = defineEmits<{
  (e: 'dropCoin' | 'removeCoin', type: CoinType): void
  (e: 'editCard'): void
}>()

interface FallingCoin {
  id: number
  type: CoinType
  startX: number
}

const fallingCoins = ref<FallingCoin[]>([])

// Watch for drop events on this card to trigger visual falling animation
watch(
  () => props.activeDrop,
  newDrop => {
    if (newDrop && newDrop.cardId === props.card.id) {
      triggerDropAnimation(newDrop.coinType)
    }
  },
)

function triggerDropAnimation(type: CoinType) {
  const id = Date.now() + Math.random()
  // Random horizontal offset around the slot entrance
  const startX = (Math.random() - 0.5) * 36
  fallingCoins.value.push({ id, type, startX })

  setTimeout(() => {
    fallingCoins.value = fallingCoins.value.filter(c => c.id !== id)
  }, 950)
}

function handleDrop(type: CoinType) {
  if (!props.isVotingPhase) return
  if (type === 'gold' && props.myGoldRemaining <= 0) return
  if (type === 'red' && props.myRedRemaining <= 0) return
  emit('dropCoin', type)
}

// Generate visual token array for settled coins (max 12 for clean layout)
const visibleGoldTokens = computed(() => Math.min(props.card.totalGold, 12))
const visibleRedTokens = computed(() => Math.min(props.card.totalRed, 8))
</script>

<template>
  <div class="relative flex flex-col items-center w-full">
    <!-- Coin Hopper & Physics Slot Area -->
    <div
      class="w-full relative py-3 px-4 rounded-xl bg-[#0b1220]/80 border border-[#25314a] overflow-hidden flex flex-col items-center justify-center transition-all duration-300 group-hover:border-[#74b9ff]/40 shadow-inner"
    >
      <!-- Subtle internal glow -->
      <div
        class="absolute inset-0 bg-radial from-[#74b9ff]/5 via-transparent to-transparent pointer-events-none"
      />

      <!-- Falling Coins Physics Layer -->
      <div class="absolute inset-0 pointer-events-none overflow-hidden z-20">
        <TransitionGroup name="coin-fall">
          <div
            v-for="coin in fallingCoins"
            :key="coin.id"
            class="absolute top-0 left-1/2 -translate-x-1/2 flex items-center justify-center"
            :style="{
              transform: `translate(calc(-50% + ${coin.startX}px), 0)`,
            }"
          >
            <div
              :class="[
                'w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-lg animate-coin-drop',
                coin.type === 'gold'
                  ? 'bg-gradient-to-b from-[#ffeaa7] via-[#f5c242] to-[#d49e1a] text-[#3d2700] border-2 border-[#fff3b0]'
                  : 'bg-gradient-to-b from-[#ff8787] via-[#ef4444] to-[#b91c1c] text-white border-2 border-[#ffa8a8]',
              ]"
            >
              {{ coin.type === 'gold' ? '🪙' : '🔴' }}
            </div>
          </div>
        </TransitionGroup>
      </div>

      <!-- Physical Coin Slot Opening -->
      <div class="relative flex flex-col items-center mb-2 z-10">
        <!-- Slot guide lip -->
        <div
          class="text-[10px] uppercase font-bold tracking-wider text-[#8fa3c4]/70 mb-1 flex items-center gap-1"
        >
          <span>Coin Slot</span>
          <span v-if="card.totalScore > 0" class="text-[#74b9ff]">• {{ card.totalScore }} pts</span>
        </div>

        <!-- Physical slot aperture -->
        <div
          class="w-28 h-3.5 rounded-full bg-[#070b14] border-2 border-[#25314a] shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] relative flex items-center justify-center"
        >
          <div class="w-20 h-1 rounded-full bg-[#121a2b]/70" />
        </div>
      </div>

      <!-- Settled Coin Tokens Stack Visualizer -->
      <div class="flex items-center justify-center gap-1.5 min-h-[28px] flex-wrap z-10 px-2 py-0.5">
        <template v-if="card.totalGold > 0 || card.totalRed > 0">
          <!-- Gold Coins -->
          <div v-if="card.totalGold > 0" class="flex items-center -space-x-1.5" title="Gold Coins">
            <div
              v-for="n in visibleGoldTokens"
              :key="'g-' + n"
              class="w-5 h-5 rounded-full bg-gradient-to-tr from-[#d49e1a] to-[#ffeaa7] border border-[#f5c242] flex items-center justify-center text-[9px] shadow-sm transform transition-transform hover:-translate-y-1"
            >
              🪙
            </div>
            <span
              v-if="card.totalGold > visibleGoldTokens"
              class="text-[11px] font-bold text-[#f5c242] pl-2"
            >
              +{{ card.totalGold - visibleGoldTokens }}
            </span>
          </div>

          <!-- Red Coins -->
          <div
            v-if="card.totalRed > 0"
            class="flex items-center -space-x-1.5 pl-1"
            title="Red Coins (Super 2x)"
          >
            <div
              v-for="n in visibleRedTokens"
              :key="'r-' + n"
              class="w-5 h-5 rounded-full bg-gradient-to-tr from-[#b91c1c] to-[#ff8787] border border-[#ef4444] flex items-center justify-center text-[9px] shadow-sm transform transition-transform hover:-translate-y-1"
            >
              🔴
            </div>
            <span
              v-if="card.totalRed > visibleRedTokens"
              class="text-[11px] font-bold text-[#ef4444] pl-2"
            >
              +{{ card.totalRed - visibleRedTokens }}
            </span>
          </div>
        </template>
        <span v-else class="text-xs text-[#8fa3c4]/50 italic">
          {{ isVotingPhase ? 'Drop a coin here!' : 'Awaiting voting phase' }}
        </span>
      </div>

      <!-- My Contributions Indicator -->
      <div
        v-if="(card.myGold > 0 || card.myRed > 0) && isVotingPhase"
        class="mt-2 text-[11px] text-[#74b9ff] flex items-center gap-2 bg-[#74b9ff]/10 px-2.5 py-0.5 rounded-full border border-[#74b9ff]/20"
      >
        <span>Your drop:</span>
        <span v-if="card.myGold > 0" class="font-bold text-[#f5c242]">{{ card.myGold }} Gold</span>
        <span v-if="card.myRed > 0" class="font-bold text-[#ef4444]">{{ card.myRed }} Red</span>
      </div>
    </div>

    <!-- Drop Coin Action Buttons (Visible during voting) -->
    <div v-if="isVotingPhase" class="w-full mt-3 flex items-center gap-2">
      <!-- 1. Gold Coin Button -->
      <button
        type="button"
        :disabled="myGoldRemaining <= 0"
        :class="[
          'flex-1 py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 border cursor-pointer select-none active:scale-95',
          myGoldRemaining > 0
            ? 'bg-[#f5c242]/15 hover:bg-[#f5c242]/25 text-[#f5c242] border-[#f5c242]/40 shadow-sm hover:shadow-[#f5c242]/20'
            : 'bg-[#121a2b] text-[#8fa3c4]/40 border-[#25314a] cursor-not-allowed opacity-60',
        ]"
        @click="handleDrop('gold')"
      >
        <span class="text-sm">🪙</span>
        <span>+1 Gold</span>
      </button>

      <!-- 2. Red Coin Button (Super Vote 2x) -->
      <button
        type="button"
        :disabled="myRedRemaining <= 0"
        :class="[
          'flex-1 py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 border cursor-pointer select-none active:scale-95',
          myRedRemaining > 0
            ? 'bg-[#ef4444]/15 hover:bg-[#ef4444]/25 text-[#ef4444] border-[#ef4444]/40 shadow-sm hover:shadow-[#ef4444]/20'
            : 'bg-[#121a2b] text-[#8fa3c4]/40 border-[#25314a] cursor-not-allowed opacity-60',
        ]"
        @click="handleDrop('red')"
      >
        <Flame class="w-3.5 h-3.5 text-[#ef4444]" />
        <span>+1 Red</span>
      </button>

      <!-- 3. Undo / Retrieve Coin Button (if user placed any on this card) -->
      <div v-if="card.myGold > 0 || card.myRed > 0" class="flex items-center gap-1">
        <button
          v-if="card.myGold > 0"
          type="button"
          title="Take back 1 Gold coin"
          class="p-2 rounded-xl bg-[#121a2b] hover:bg-[#25314a] text-[#f5c242] border border-[#25314a] text-xs cursor-pointer active:scale-90 transition-all"
          @click="emit('removeCoin', 'gold')"
        >
          <Minus class="w-3.5 h-3.5" />
        </button>
        <button
          v-if="card.myRed > 0"
          type="button"
          title="Take back 1 Red coin"
          class="p-2 rounded-xl bg-[#121a2b] hover:bg-[#25314a] text-[#ef4444] border border-[#25314a] text-xs cursor-pointer active:scale-90 transition-all"
          @click="emit('removeCoin', 'red')"
        >
          <Minus class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes coinDropPhysics {
  0% {
    transform: translateY(-24px) scale(1.15) rotate(0deg);
    opacity: 0;
  }
  15% {
    opacity: 1;
  }
  55% {
    transform: translateY(22px) scale(0.95) rotate(20deg);
  }
  70% {
    transform: translateY(14px) scale(1.02) rotate(-10deg);
  }
  85% {
    transform: translateY(26px) scale(0.98) rotate(5deg);
  }
  100% {
    transform: translateY(40px) scale(0.7) rotate(0deg);
    opacity: 0;
  }
}

.animate-coin-drop {
  animation: coinDropPhysics 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}
</style>
