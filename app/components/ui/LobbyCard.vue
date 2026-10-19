<script setup lang="ts">
import { ExternalLink, Edit3, Trophy, DollarSign, Tag, Crown } from 'lucide-vue-next'
import type { CoinType, EnrichedCardIdea, Identity } from '~/types'
import CardCoinSlot from '~/components/ui/CardCoinSlot.vue'

const props = defineProps<{
  card: EnrichedCardIdea
  currentUser: Identity
  isHost: boolean
  isVotingPhase: boolean
  isFinishedPhase: boolean
  isWinner: boolean
  myGoldRemaining: number
  myRedRemaining: number
  activeDrop: { cardId: string; coinType: CoinType; key: number } | null
}>()

const emit = defineEmits<{
  (e: 'dropCoin' | 'removeCoin', cardId: string, type: CoinType): void
  (e: 'editCard', card: EnrichedCardIdea): void
}>()

const canEdit = computed(() => {
  return !props.isFinishedPhase && (props.isHost || props.card.authorId === props.currentUser.id)
})

function getSafeLink(url?: string): string {
  if (!url) return '#'
  const trimmed = url.trim()
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return 'https://' + trimmed
}
</script>

<template>
  <div
    :class="[
      'relative rounded-[16px] p-3.5 sm:p-5 flex flex-col justify-between transition-all duration-300 group',
      isWinner
        ? 'bg-card p-[2px] rounded-[16px] bg-sky-gradient shadow-2xl shadow-sky-end/30 scale-[1.02] animate-pulse-glow'
        : card.isLeader && !isFinishedPhase
          ? 'bg-card border-2 border-sky-end/60 shadow-sky-glow hover:-translate-y-1'
          : 'bg-card border border-line hover:border-sky-end/60 hover:shadow-sky-glow hover:-translate-y-1',
    ]"
  >
    <!-- Inner container for gradient border wrapper when winning -->
    <div
      :class="[
        'w-full h-full rounded-[14px] flex flex-col justify-between',
        isWinner ? 'bg-card p-3.5 sm:p-5' : '',
      ]"
    >
      <!-- Top Meta Bar: Category, Leader / Winner Trophy, and Edit button -->
      <div>
        <div class="flex items-center justify-between gap-2 mb-2.5">
          <div class="flex items-center gap-1.5 flex-wrap">
            <span
              class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-canvas border border-line text-text-muted flex items-center gap-1"
            >
              <Tag class="w-3 h-3 text-sky-end" />
              <span>{{ card.category || 'General' }}</span>
            </span>

            <!-- Winner Trophy Banner -->
            <span
              v-if="isWinner"
              class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-gradient text-canvas flex items-center gap-1 shadow"
            >
              <Trophy class="w-3 h-3" />
              <span>Winner!</span>
            </span>

            <!-- Live Leader Tag -->
            <span
              v-else-if="card.isLeader && card.totalScore > 0"
              class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-end/15 text-sky-end border border-sky-end/30 flex items-center gap-1"
            >
              <Crown class="w-3 h-3 text-gold" />
              <span>Leading</span>
            </span>
          </div>

          <!-- Edit Option Button (Creator & Author before finish) -->
          <button
            v-if="canEdit"
            type="button"
            class="text-text-muted hover:text-sky-soft p-1 rounded-lg hover:bg-canvas border border-transparent hover:border-line transition-all text-xs flex items-center gap-1 cursor-pointer"
            title="Edit option details"
            @click="emit('editCard', card)"
          >
            <Edit3 class="w-3.5 h-3.5" />
            <span class="text-[11px] font-medium hidden sm:inline">Edit</span>
          </button>
        </div>

        <!-- Title -->
        <h3
          class="text-base font-bold text-text-primary mb-1.5 leading-snug group-hover:text-white transition-colors"
        >
          {{ card.title }}
        </h3>

        <!-- Description (if provided) -->
        <p v-if="card.description" class="text-xs text-text-muted mb-2 leading-relaxed">
          {{ card.description }}
        </p>

        <!-- Price Note & External Link Row -->
        <div class="flex items-center gap-3 text-xs text-text-muted mb-3 flex-wrap">
          <span v-if="card.priceNote" class="flex items-center gap-1 text-sky-soft">
            <DollarSign class="w-3.5 h-3.5 text-gold" />
            <span>{{ card.priceNote }}</span>
          </span>

          <a
            v-if="card.link"
            :href="getSafeLink(card.link)"
            target="_blank"
            rel="noopener noreferrer"
            class="text-sky-end hover:text-sky-soft hover:underline flex items-center gap-1"
          >
            <span>View Link</span>
            <ExternalLink class="w-3 h-3" />
          </a>
        </div>

        <!-- Proposer Credit -->
        <div class="text-[11px] text-text-muted/70 mb-4 flex items-center gap-1.5">
          <span class="sm:hidden">by</span>
          <span class="hidden sm:inline">Proposed by</span>
          <span class="inline-flex items-center gap-1 font-medium text-text-primary">
            <span>{{ card.authorEmoji }}</span>
            <span>{{ card.authorName }}</span>
          </span>
        </div>
      </div>

      <!-- Card Coin Drop Zone Component -->
      <CardCoinSlot
        :card="card"
        :my-gold-remaining="myGoldRemaining"
        :my-red-remaining="myRedRemaining"
        :is-voting-phase="isVotingPhase"
        :is-host="isHost"
        :active-drop="activeDrop"
        @drop-coin="type => emit('dropCoin', card.id, type)"
        @remove-coin="type => emit('removeCoin', card.id, type)"
        @edit-card="emit('editCard', card)"
      />
    </div>
  </div>
</template>
