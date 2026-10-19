<script setup lang="ts">
import { Plus, Crown, Trophy, ExternalLink, Coins } from 'lucide-vue-next'
import type { EnrichedOption, UserProfile } from '~/types'
import RollingCounter from './RollingCounter.vue'
import HoldToConfirmButton from './HoldToConfirmButton.vue'

defineProps<{
  options: EnrichedOption[]
  userProfile: UserProfile
  participants: UserProfile[]
  lockedWinnerId: string | null
  myCoinsRemaining: number
  sortBy: 'coins' | 'newest'
}>()

const emit = defineEmits<{
  vote: [optionId: string, delta: number]
  openAddModal: []
  resetVotes: []
  setSortBy: [sort: 'coins' | 'newest']
}>()
</script>

<template>
  <div>
    <!-- Action Sub-bar -->
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div class="flex items-center gap-2.5">
        <button
          type="button"
          class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-gradient text-canvas font-bold text-xs shadow-md transition-all hover:opacity-95 active:scale-98 cursor-pointer"
          @click="emit('openAddModal')"
        >
          <Plus class="w-4 h-4 stroke-[2.5]" />
          <span>Add Option Card</span>
        </button>

        <div class="flex items-center bg-card border border-line rounded-xl p-1 text-xs">
          <button
            type="button"
            class="px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer"
            :class="[
              sortBy === 'coins'
                ? 'bg-canvas text-sky-soft border border-line'
                : 'text-text-muted hover:text-text-primary',
            ]"
            @click="emit('setSortBy', 'coins')"
          >
            Most Coins 👑
          </button>
          <button
            type="button"
            class="px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer"
            :class="[
              sortBy === 'newest'
                ? 'bg-canvas text-sky-soft border border-line'
                : 'text-text-muted hover:text-text-primary',
            ]"
            @click="emit('setSortBy', 'newest')"
          >
            Newest
          </button>
        </div>
      </div>

      <!-- Hold to Reset Micro-Interaction -->
      <HoldToConfirmButton label="Hold to Reset All Coins" @confirm="emit('resetVotes')" />
    </div>

    <!-- Empty State if New Room -->
    <div
      v-if="options.length === 0"
      class="bg-card border border-dashed border-line rounded-[16px] p-12 text-center max-w-lg mx-auto my-8"
    >
      <div
        class="w-14 h-14 rounded-2xl bg-canvas border border-line flex items-center justify-center mx-auto mb-4 text-gold"
      >
        <Coins class="w-7 h-7" />
      </div>
      <h3 class="text-lg font-bold text-text-primary mb-1">No options on the board yet!</h3>
      <p class="text-sm text-text-muted mb-6 leading-relaxed">
        Drop the first suggestion card (restaurant, project idea, weekend trip) so everyone can
        start stacking their 5 gold coins.
      </p>
      <button
        type="button"
        class="px-5 py-2.5 rounded-xl bg-sky-gradient text-canvas font-bold text-xs shadow-md hover:opacity-95 cursor-pointer"
        @click="emit('openAddModal')"
      >
        + Add First Option Card
      </button>
    </div>

    <!-- Option Cards Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div
        v-for="opt in options"
        :key="opt.id"
        class="group relative rounded-[16px] p-5 transition-all duration-300 flex flex-col justify-between hover:shadow-sky-glow hover:-translate-y-1"
        :class="[
          lockedWinnerId === opt.id
            ? 'bg-card border-2 border-emerald shadow-md shadow-emerald/15'
            : opt.isLeader
              ? 'bg-card ring-2 ring-sky-end border-transparent shadow-sky-glow'
              : 'bg-card border border-line hover:border-sky-soft/40',
        ]"
      >
        <!-- Top Row: Category Badge, Leader Crown & Total Coins Counter -->
        <div>
          <div class="flex items-start justify-between gap-3 mb-3">
            <div class="flex flex-wrap items-center gap-2">
              <span
                class="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-canvas text-sky-soft border border-line"
              >
                {{ opt.category }}
              </span>
              <span
                v-if="opt.isLeader"
                class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold bg-canvas text-gold border border-gold/30"
              >
                <Crown class="w-3.5 h-3.5 fill-[#f5c242]" />
                Top Choice
              </span>
              <span
                v-if="lockedWinnerId === opt.id"
                class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold bg-canvas text-emerald border border-emerald/40"
              >
                <Trophy class="w-3.5 h-3.5 text-emerald" />
                Official Winner
              </span>
            </div>

            <!-- Rolling Coin Counter Badge (Reserved #f5c242 for coins) -->
            <div
              class="flex items-center gap-1.5 bg-canvas border border-line px-3 py-1.5 rounded-xl shadow-inner shrink-0"
            >
              <span class="text-base">🪙</span>
              <RollingCounter :value="opt.totalCoins" class="text-lg text-gold" />
              <span class="text-[11px] text-text-muted font-medium">coins</span>
            </div>
          </div>

          <!-- Card Title & Metadata -->
          <h3
            class="text-lg font-bold text-text-primary group-hover:text-white transition-colors mb-1"
          >
            {{ opt.title }}
          </h3>

          <div class="flex flex-wrap items-center gap-3 text-xs text-text-muted mb-4">
            <span class="text-sky-soft font-medium">{{ opt.priceNote }}</span>
            <span>•</span>
            <span>Added by {{ opt.createdBy }}</span>
            <template v-if="opt.link">
              <span>•</span>
              <a
                :href="opt.link"
                target="_blank"
                rel="noreferrer"
                class="inline-flex items-center gap-1 text-sky-end hover:text-sky-soft underline"
              >
                <span>Map / Link</span>
                <ExternalLink class="w-3 h-3" />
              </a>
            </template>
          </div>
        </div>

        <!-- Bottom Section: Visual Voter Coin Stack & +/- Controls -->
        <div class="pt-4 border-t border-line flex flex-wrap items-center justify-between gap-3">
          <!-- Who stacked coins here -->
          <div class="flex flex-wrap items-center gap-1.5 min-h-[28px]">
            <template
              v-if="Object.entries(opt.votes).filter(([, count]) => count > 0).length === 0"
            >
              <span class="text-xs text-text-muted/70 italic">
                No coins dropped yet — be the first!
              </span>
            </template>
            <template v-else>
              <div
                v-for="[voterId, count] in Object.entries(opt.votes).filter(([, c]) => c > 0)"
                :key="voterId"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border"
                :class="[
                  voterId === userProfile.id
                    ? 'bg-canvas border-sky-end text-text-primary font-semibold'
                    : 'bg-canvas border-line text-text-muted',
                ]"
                :title="`${participants.find(p => p.id === voterId)?.name || 'Friend'} stacked ${count} coin(s)`"
              >
                <span>{{ participants.find(p => p.id === voterId)?.emoji || '👤' }}</span>
                <span class="text-[11px] font-mono">×{{ count }}</span>
              </div>
            </template>
          </div>

          <!-- Interactive -1 / +1 Coin Dropper Buttons -->
          <div class="flex items-center gap-2">
            <button
              type="button"
              :disabled="(opt.votes[userProfile.id] || 0) === 0"
              class="px-3 py-1.5 rounded-xl text-xs font-bold border transition-all"
              :class="[
                (opt.votes[userProfile.id] || 0) > 0
                  ? 'bg-canvas hover:bg-line text-text-primary border-line active:scale-95 cursor-pointer'
                  : 'bg-canvas/40 text-text-muted/40 border-line/40 cursor-not-allowed',
              ]"
              @click="emit('vote', opt.id, -1)"
            >
              -1 🪙
            </button>

            <button
              type="button"
              class="px-3.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              :class="[
                myCoinsRemaining > 0
                  ? 'bg-sky-gradient text-canvas shadow-md hover:opacity-95'
                  : 'bg-canvas text-text-muted border border-line',
              ]"
              @click="emit('vote', opt.id, 1)"
            >
              <span>Drop +1 🪙</span>
              <span
                v-if="(opt.votes[userProfile.id] || 0) > 0"
                class="px-1.5 py-0.2 rounded-full bg-canvas/25 text-[10px]"
              >
                You: {{ opt.votes[userProfile.id] }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
