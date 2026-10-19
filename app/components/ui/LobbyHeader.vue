<script setup lang="ts">
import { ref } from 'vue'
import {
  Copy,
  Check,
  Send,
  Users,
  Crown,
  Play,
  Trophy,
  RotateCcw,
  ArrowLeft,
} from 'lucide-vue-next'
import type { Identity, LobbyPhase, LobbyRoom } from '~/types'

const props = defineProps<{
  room: LobbyRoom
  currentUser: Identity
  isConnected: boolean
  isHost: boolean
  isDatabaseConnected?: boolean
}>()

const emit = defineEmits<{
  (e: 'changePhase', phase: LobbyPhase): void
  (e: 'resetVotes' | 'leave'): void
  (e: 'toast', message: string): void
}>()

const copiedCode = ref(false)
const copiedLink = ref(false)

function getShareUrl() {
  if (!import.meta.client) return ''
  return `${window.location.origin}/?room=${props.room.id}`
}

function copyCode() {
  if (!import.meta.client) return
  navigator.clipboard.writeText(props.room.id)
  copiedCode.value = true
  emit('toast', `Copied lobby code: ${props.room.id}`)
  setTimeout(() => (copiedCode.value = false), 2000)
}

function copyLink() {
  if (!import.meta.client) return
  const url = getShareUrl()
  navigator.clipboard.writeText(url)
  copiedLink.value = true
  emit('toast', 'Copied invite link to clipboard! 📋')
  setTimeout(() => (copiedLink.value = false), 2000)
}

function shareTelegram() {
  if (!import.meta.client) return
  const url = getShareUrl()
  const text = `Join our CoinDrop lobby to vote on "${props.room.title}"! 🪙✨ Room code: ${props.room.id}`
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
  window.open(telegramUrl, '_blank')
}
</script>

<template>
  <header
    class="w-full bg-[#121a2b] border-b border-[#25314a] sticky top-0 z-40 shadow-xl backdrop-blur-md"
  >
    <div
      class="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3"
    >
      <!-- Left: Title, Code, & Status -->
      <div class="flex items-center gap-3 flex-wrap">
        <button
          type="button"
          class="p-2 rounded-xl bg-[#0b1220] hover:bg-[#25314a] text-[#8fa3c4] hover:text-[#eaf2ff] border border-[#25314a] cursor-pointer transition-colors"
          title="Leave Lobby"
          @click="emit('leave')"
        >
          <ArrowLeft class="w-4 h-4" />
        </button>

        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-base font-bold text-[#eaf2ff] truncate max-w-[240px] sm:max-w-xs">
              {{ room.title }}
            </h1>
            <span
              v-if="isHost"
              class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#f5c242]/20 text-[#f5c242] border border-[#f5c242]/40 flex items-center gap-1"
            >
              <Crown class="w-3 h-3" />
              <span>Host</span>
            </span>
          </div>

          <!-- Room Code & Connection Indicator -->
          <div class="flex items-center gap-2.5 mt-0.5 text-xs text-[#8fa3c4]">
            <button
              type="button"
              class="font-mono font-bold text-[#d0ebff] hover:text-[#74b9ff] flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#0b1220] border border-[#25314a] cursor-pointer transition-colors"
              title="Click to copy code"
              @click="copyCode"
            >
              <span>{{ room.id }}</span>
              <Check v-if="copiedCode" class="w-3 h-3 text-[#3fb950]" />
              <Copy v-else class="w-3 h-3 opacity-60" />
            </button>

            <span class="inline-flex items-center gap-1 text-[11px]">
              <span
                class="w-2 h-2 rounded-full"
                :class="isConnected ? 'bg-[#3fb950] animate-pulse' : 'bg-amber-400'"
              />
              <span>{{ isConnected ? 'Live' : 'Connecting...' }}</span>
            </span>

            <span class="text-[11px] flex items-center gap-1">
              <Users class="w-3 h-3" />
              <span>{{ room.participants.length }} friends</span>
            </span>

            <span
              v-if="isDatabaseConnected"
              class="text-[10px] text-[#3fb950] bg-[#3fb950]/10 border border-[#3fb950]/30 px-1.5 py-0.5 rounded flex items-center gap-1 font-semibold"
              title="Persistent PostgreSQL & Realtime"
            >
              <span>⚡ Supabase</span>
            </span>
          </div>
        </div>
      </div>

      <!-- Right: Share Actions & Host Flow Controls -->
      <div class="flex items-center gap-2 flex-wrap">
        <!-- 1. Copy Link Button -->
        <button
          type="button"
          class="px-3 py-1.5 rounded-xl bg-[#0b1220] hover:bg-[#25314a] text-[#d0ebff] border border-[#25314a] text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
          @click="copyLink"
        >
          <Check v-if="copiedLink" class="w-3.5 h-3.5 text-[#3fb950]" />
          <Copy v-else class="w-3.5 h-3.5 text-[#74b9ff]" />
          <span>{{ copiedLink ? 'Copied Link!' : 'Copy Link' }}</span>
        </button>

        <!-- 2. Share to Telegram Button -->
        <button
          type="button"
          class="px-3 py-1.5 rounded-xl bg-[#229ed9]/15 hover:bg-[#229ed9]/25 text-[#74b9ff] border border-[#229ed9]/30 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
          @click="shareTelegram"
        >
          <Send class="w-3.5 h-3.5 text-[#229ed9]" />
          <span>Telegram</span>
        </button>

        <!-- 3. Host Phase Advancement Toolbar -->
        <template v-if="isHost">
          <div class="h-4 w-px bg-[#25314a] hidden sm:block mx-1" />

          <!-- If in Ideas phase -> Start Voting -->
          <button
            v-if="room.phase === 'ideas'"
            type="button"
            class="px-3.5 py-1.5 rounded-xl bg-sky-gradient text-[#0b1220] font-bold text-xs shadow-md hover:opacity-95 active:scale-95 flex items-center gap-1.5 cursor-pointer"
            @click="emit('changePhase', 'voting')"
          >
            <Play class="w-3.5 h-3.5 fill-[#0b1220]" />
            <span>Start Voting 🪙</span>
          </button>

          <!-- If in Voting phase -> Finish & Winner or Reset -->
          <template v-else-if="room.phase === 'voting'">
            <button
              type="button"
              class="px-3 py-1.5 rounded-xl bg-[#0b1220] hover:bg-[#25314a] text-[#8fa3c4] hover:text-[#eaf2ff] border border-[#25314a] text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all"
              title="Clear all votes"
              @click="emit('resetVotes')"
            >
              <RotateCcw class="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              type="button"
              class="px-3.5 py-1.5 rounded-xl bg-sky-gradient text-[#0b1220] font-bold text-xs shadow-md hover:opacity-95 active:scale-95 flex items-center gap-1.5 cursor-pointer"
              @click="emit('changePhase', 'finished')"
            >
              <Trophy class="w-3.5 h-3.5" />
              <span>Reveal Winner 🏆</span>
            </button>
          </template>

          <!-- If Finished -> Reopen -->
          <button
            v-else-if="room.phase === 'finished'"
            type="button"
            class="px-3 py-1.5 rounded-xl bg-[#0b1220] hover:bg-[#25314a] text-[#74b9ff] border border-[#74b9ff]/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
            @click="emit('changePhase', 'voting')"
          >
            <RotateCcw class="w-3.5 h-3.5" />
            <span>Reopen Voting</span>
          </button>
        </template>
      </div>
    </div>

    <!-- Participants Avatars Bar -->
    <div
      class="bg-[#0b1220]/60 border-t border-[#25314a]/60 px-4 sm:px-6 py-1.5 flex items-center justify-between text-xs"
    >
      <div class="flex items-center gap-2 overflow-x-auto py-0.5 no-scrollbar">
        <span class="text-[11px] font-semibold text-[#8fa3c4]/70 uppercase tracking-wider shrink-0">
          In Lobby:
        </span>
        <div class="flex items-center gap-1.5">
          <div
            v-for="p in room.participants"
            :key="p.id"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#121a2b] border border-[#25314a] text-xs text-[#eaf2ff] shrink-0"
            :title="p.name"
          >
            <span class="text-sm">{{ p.emoji }}</span>
            <span class="text-[11px] font-medium max-w-[90px] truncate">{{ p.name }}</span>
            <span
              v-if="p.id === room.creatorId"
              class="text-[10px] text-[#f5c242]"
              title="Room Host"
              >👑</span
            >
            <span v-if="p.id === currentUser.id" class="text-[10px] text-[#74b9ff]">(you)</span>
          </div>
        </div>
      </div>

      <!-- Current Phase Pill -->
      <div class="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold">
        <span class="text-[#8fa3c4]">Phase:</span>
        <span
          :class="[
            'px-2 py-0.5 rounded-full uppercase tracking-wider font-bold text-[10px]',
            room.phase === 'ideas'
              ? 'bg-[#74b9ff]/15 text-[#74b9ff] border border-[#74b9ff]/30'
              : room.phase === 'voting'
                ? 'bg-[#f5c242]/15 text-[#f5c242] border border-[#f5c242]/30 animate-pulse'
                : 'bg-[#3fb950]/15 text-[#3fb950] border border-[#3fb950]/30',
          ]"
        >
          {{
            room.phase === 'ideas'
              ? '💡 Suggesting Ideas'
              : room.phase === 'voting'
                ? '🪙 Live Voting'
                : '🏆 Decided'
          }}
        </span>
      </div>
    </div>
  </header>
</template>
