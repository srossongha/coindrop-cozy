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

interface FloatingScore {
  id: number
  text: string
  color: string
}

const fallingCoins = ref<FallingCoin[]>([])
const floatingScores = ref<FloatingScore[]>([])
const isBumping = ref(false)

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
  const startX = (Math.random() - 0.5) * 36
  fallingCoins.value.push({ id, type, startX })

  // Subtle physical recoil / impact bump on the card slot
  isBumping.value = true
  setTimeout(() => {
    isBumping.value = false
  }, 350)

  // Floating +1 / +2 particle feedback
  const scoreId = Date.now() + Math.random()
  floatingScores.value.push({
    id: scoreId,
    text: type === 'gold' ? '+1 🪙' : '+2 🔴',
    color: type === 'gold' ? 'text-gold' : 'text-red-500',
  })
  setTimeout(() => {
    floatingScores.value = floatingScores.value.filter(s => s.id !== scoreId)
  }, 1000)

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

function handleRemove(type: CoinType, event: Event) {
  event.stopPropagation()
  emit('removeCoin', type)
}

const visibleGoldTokens = computed(() => Math.min(props.card.totalGold, 8))
const visibleRedTokens = computed(() => Math.min(props.card.totalRed, 6))
</script>

<template>
  <div class="relative flex flex-col items-center w-full mt-2">
    <!-- Coin Hopper & Physics Slot Area -->
    <div
      :class="[
        'w-full relative py-2.5 px-3 rounded-xl bg-canvas/70 border border-line overflow-hidden flex flex-col items-center justify-center transition-all duration-300 group-hover:border-sky-end/40 shadow-inner min-h-[46px]',
        isBumping ? 'animate-card-bump' : '',
      ]"
    >
      <!-- Floating Score Feedback Layer -->
      <div
        class="absolute inset-0 pointer-events-none overflow-hidden z-30 flex items-center justify-center"
      >
        <div
          v-for="score in floatingScores"
          :key="score.id"
          :class="[
            'absolute font-black text-sm drop-shadow-lg animate-float-score select-none pointer-events-none',
            score.color,
          ]"
        >
          {{ score.text }}
        </div>
      </div>

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
                'w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-lg animate-coin-drop',
                coin.type === 'gold'
                  ? 'bg-gradient-to-b from-amber-200 via-gold to-amber-600 text-amber-950 border border-amber-100'
                  : 'bg-gradient-to-b from-red-400 via-red-500 to-red-700 text-white border border-red-300',
              ]"
            >
              {{ coin.type === 'gold' ? '🪙' : '🔴' }}
            </div>
          </div>
        </TransitionGroup>
      </div>

      <!-- Settled Coin Tokens Stack Visualizer -->
      <div class="flex items-center justify-between w-full z-10">
        <!-- Tokens Display -->
        <div class="flex items-center gap-1.5 min-h-[22px] flex-wrap">
          <template v-if="card.totalGold > 0 || card.totalRed > 0">
            <!-- Gold Tokens -->
            <div
              v-if="card.totalGold > 0"
              class="flex items-center -space-x-1"
              title="Gold Coins (1pt)"
            >
              <div
                v-for="n in visibleGoldTokens"
                :key="'g-' + n"
                class="w-4 h-4 rounded-full bg-gradient-to-tr from-amber-600 to-amber-200 border border-gold flex items-center justify-center text-[8px] shadow-sm animate-token-pop"
              >
                🪙
              </div>
              <span
                v-if="card.totalGold > visibleGoldTokens"
                class="text-[10px] font-bold text-gold pl-1.5"
              >
                +{{ card.totalGold - visibleGoldTokens }}
              </span>
            </div>

            <!-- Red Tokens -->
            <div
              v-if="card.totalRed > 0"
              class="flex items-center -space-x-1 pl-1"
              title="Red Super Coins (2pt)"
            >
              <div
                v-for="n in visibleRedTokens"
                :key="'r-' + n"
                class="w-4 h-4 rounded-full bg-gradient-to-tr from-red-700 to-red-400 border border-red-500 flex items-center justify-center text-[8px] shadow-sm animate-token-pop"
              >
                🔴
              </div>
              <span
                v-if="card.totalRed > visibleRedTokens"
                class="text-[10px] font-bold text-red-500 pl-1.5"
              >
                +{{ card.totalRed - visibleRedTokens }}
              </span>
            </div>
          </template>

          <span v-else class="text-[11px] text-text-muted/50 italic">
            <span class="sm:hidden">{{ isVotingPhase ? 'Drop coins' : 'Proposed' }}</span>
            <span class="hidden sm:inline">{{ isVotingPhase ? 'Ready for coins...' : 'Idea proposed' }}</span>
          </span>
        </div>

        <!-- Score Badge -->
        <span
          class="text-xs font-black px-2 py-0.5 rounded-full border"
          :class="[
            card.totalScore > 0
              ? 'bg-sky-end/15 text-sky-end border-sky-end/30'
              : 'bg-card text-text-muted/40 border-line',
          ]"
        >
          {{ card.totalScore }} pts
        </span>
      </div>
    </div>

    <!-- ============================================== -->
    <!-- UNIFIED MULTI-ACTION COIN BUTTONS              -->
    <!-- Fewer buttons, but each button does more!     -->
    <!-- ============================================== -->
    <div v-if="isVotingPhase" class="w-full mt-2.5 grid grid-cols-2 gap-2">
      <!-- 1. Gold Coin Button (1pt) -->
      <button
        type="button"
        :disabled="myGoldRemaining <= 0 && card.myGold <= 0"
        :class="[
          'py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-between border cursor-pointer select-none transition-all duration-200 active:scale-95 group/btn',
          card.myGold > 0
            ? 'bg-gold/20 border-gold/60 text-gold shadow-sm'
            : myGoldRemaining > 0
              ? 'bg-canvas hover:bg-gold/15 text-sky-soft hover:text-gold border-line hover:border-gold/40'
              : 'bg-canvas/50 text-text-muted/30 border-line cursor-not-allowed opacity-40',
        ]"
        @click="handleDrop('gold')"
      >
        <span class="flex items-center gap-1.5">
          <span class="text-sm">🪙</span>
          <span>{{ card.myGold > 0 ? `${card.myGold}` : '+1' }}</span>
        </span>

        <!-- Embedded Minus Retract Pill (Appears when you have placed a coin) -->
        <span
          v-if="card.myGold > 0"
          class="w-5 h-5 rounded-full bg-card hover:bg-red-500 text-text-muted hover:text-white flex items-center justify-center text-[10px] transition-colors border border-line"
          title="Take back 1 gold coin"
          @click="handleRemove('gold', $event)"
        >
          <Minus class="w-3 h-3" />
        </span>
        <span v-else class="text-[10px] text-text-muted opacity-60">1pt</span>
      </button>

      <!-- 2. Red Coin Button (2pt Super Vote) -->
      <button
        type="button"
        :disabled="myRedRemaining <= 0 && card.myRed <= 0"
        :class="[
          'py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-between border cursor-pointer select-none transition-all duration-200 active:scale-95 group/btn',
          card.myRed > 0
            ? 'bg-red-500/20 border-red-500/60 text-red-500 shadow-sm'
            : myRedRemaining > 0
              ? 'bg-canvas hover:bg-red-500/15 text-sky-soft hover:text-red-500 border-line hover:border-red-500/40'
              : 'bg-canvas/50 text-text-muted/30 border-line cursor-not-allowed opacity-40',
        ]"
        @click="handleDrop('red')"
      >
        <span class="flex items-center gap-1.5">
          <Flame class="w-3.5 h-3.5 text-red-500" />
          <span>{{ card.myRed > 0 ? `${card.myRed}` : '+1' }}</span>
        </span>

        <!-- Embedded Minus Retract Pill (Appears when you have placed a coin) -->
        <span
          v-if="card.myRed > 0"
          class="w-5 h-5 rounded-full bg-card hover:bg-red-500 text-text-muted hover:text-white flex items-center justify-center text-[10px] transition-colors border border-line"
          title="Take back 1 red coin"
          @click="handleRemove('red', $event)"
        >
          <Minus class="w-3 h-3" />
        </span>
        <span v-else class="text-[10px] text-text-muted opacity-60">2pt</span>
      </button>
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
