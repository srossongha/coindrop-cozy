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
      'relative rounded-[16px] p-5 flex flex-col justify-between transition-all duration-300 group',
      isWinner
        ? 'bg-[#121a2b] p-[2px] rounded-[16px] bg-sky-gradient shadow-2xl shadow-[#74b9ff]/25 scale-[1.02]'
        : card.isLeader && !isFinishedPhase
          ? 'bg-[#121a2b] border-2 border-[#74b9ff]/60 shadow-sky-glow'
          : 'bg-[#121a2b] border border-[#25314a] hover:border-[#d0ebff]/40 hover:shadow-sky-glow',
    ]"
  >
    <!-- Inner container for gradient border wrapper when winning -->
    <div
      :class="[
        'w-full h-full rounded-[14px] flex flex-col justify-between',
        isWinner ? 'bg-[#121a2b] p-5' : '',
      ]"
    >
      <!-- Top Meta Bar: Category, Leader / Winner Trophy, and Edit button -->
      <div>
        <div class="flex items-center justify-between gap-2 mb-2.5">
          <div class="flex items-center gap-1.5 flex-wrap">
            <span
              class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#0b1220] border border-[#25314a] text-[#8fa3c4] flex items-center gap-1"
            >
              <Tag class="w-3 h-3 text-[#74b9ff]" />
              <span>{{ card.category || 'General' }}</span>
            </span>

            <!-- Winner Trophy Banner -->
            <span
              v-if="isWinner"
              class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-gradient text-[#0b1220] flex items-center gap-1 shadow"
            >
              <Trophy class="w-3 h-3" />
              <span>Winner!</span>
            </span>

            <!-- Live Leader Tag -->
            <span
              v-else-if="card.isLeader && card.totalScore > 0"
              class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#74b9ff]/15 text-[#74b9ff] border border-[#74b9ff]/30 flex items-center gap-1"
            >
              <Crown class="w-3 h-3 text-[#f5c242]" />
              <span>Leading</span>
            </span>
          </div>

          <!-- Edit Option Button (Creator & Author before finish) -->
          <button
            v-if="canEdit"
            type="button"
            class="text-[#8fa3c4] hover:text-[#d0ebff] p-1 rounded-lg hover:bg-[#0b1220] border border-transparent hover:border-[#25314a] transition-all text-xs flex items-center gap-1 cursor-pointer"
            title="Edit option details"
            @click="emit('editCard', card)"
          >
            <Edit3 class="w-3.5 h-3.5" />
            <span class="text-[11px] font-medium hidden sm:inline">Edit</span>
          </button>
        </div>

        <!-- Title -->
        <h3
          class="text-base font-bold text-[#eaf2ff] mb-1.5 leading-snug group-hover:text-white transition-colors"
        >
          {{ card.title }}
        </h3>

        <!-- Description (if provided) -->
        <p v-if="card.description" class="text-xs text-[#8fa3c4] mb-2 leading-relaxed">
          {{ card.description }}
        </p>

        <!-- Price Note & External Link Row -->
        <div class="flex items-center gap-3 text-xs text-[#8fa3c4] mb-3 flex-wrap">
          <span v-if="card.priceNote" class="flex items-center gap-1 text-[#d0ebff]">
            <DollarSign class="w-3.5 h-3.5 text-[#f5c242]" />
            <span>{{ card.priceNote }}</span>
          </span>

          <a
            v-if="card.link"
            :href="getSafeLink(card.link)"
            target="_blank"
            rel="noopener noreferrer"
            class="text-[#74b9ff] hover:text-[#d0ebff] hover:underline flex items-center gap-1"
          >
            <span>View Link</span>
            <ExternalLink class="w-3 h-3" />
          </a>
        </div>

        <!-- Proposer Credit -->
        <div class="text-[11px] text-[#8fa3c4]/70 mb-4 flex items-center gap-1.5">
          <span>Proposed by</span>
          <span class="inline-flex items-center gap-1 font-medium text-[#eaf2ff]">
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
