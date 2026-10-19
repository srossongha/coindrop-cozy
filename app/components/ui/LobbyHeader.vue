<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Share2,
  Send,
  Copy,
  Check,
  MoreVertical,
  Users,
  Crown,
  Play,
  Trophy,
  RotateCcw,
  ArrowLeft,
  Trash2,
  Edit3,
  X,
} from 'lucide-vue-next'
import type { Identity, LobbyPhase, LobbyRoom } from '~/types'

const props = defineProps<{
  room: LobbyRoom
  currentUser: Identity
  isConnected: boolean
  isHost: boolean
}>()

const emit = defineEmits<{
  (e: 'changePhase', phase: LobbyPhase): void
  (e: 'resetVotes' | 'leave' | 'endAndClear' | 'editIdentity'): void
  (e: 'toast', message: string): void
}>()

// Modal and menu popover states
const showShareModal = ref(false)
const showHostMenu = ref(false)
const showRosterModal = ref(false)

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
  emit('toast', `Copied code: ${props.room.id}`)
  setTimeout(() => (copiedCode.value = false), 2000)
}

function copyLink() {
  if (!import.meta.client) return
  const url = getShareUrl()
  navigator.clipboard.writeText(url)
  copiedLink.value = true
  emit('toast', 'Copied invite link! 📋')
  setTimeout(() => (copiedLink.value = false), 2000)
}

function shareTelegram() {
  if (!import.meta.client) return
  const url = getShareUrl()
  const text = `Join CoinDrop to vote on "${props.room.title}"! 🪙✨ Code: ${props.room.id}`
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
  window.open(telegramUrl, '_blank')
}

// Display top 3 avatar previews for stack
const visibleParticipants = computed(() => props.room.participants.slice(0, 3))
const extraParticipantsCount = computed(() =>
  Math.max(0, props.room.participants.length - visibleParticipants.value.length),
)

function handleResetVotes() {
  emit('resetVotes')
  showHostMenu.value = false
}

function handleReopenVoting() {
  emit('changePhase', 'voting')
  showHostMenu.value = false
}

function handleEndAndClear() {
  emit('endAndClear')
  showHostMenu.value = false
}

function handleEditIdentityFromRoster() {
  showRosterModal.value = false
  emit('editIdentity')
}
</script>

<template>
  <header
    class="w-full bg-card/90 backdrop-blur-xl border-b border-line sticky top-0 z-40 transition-all"
  >
    <div
      class="max-w-7xl mx-auto px-2.5 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-1.5 sm:gap-3"
    >
      <!-- Left: Back Button, Room Title & Live Indicator -->
      <div class="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          type="button"
          class="p-1.5 sm:p-2 rounded-xl bg-canvas hover:bg-line text-text-muted hover:text-text-primary border border-line cursor-pointer transition-colors shrink-0"
          title="Leave Lobby"
          @click="emit('leave')"
        >
          <ArrowLeft class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        <div class="min-w-0">
          <div class="flex items-center gap-1.5 sm:gap-2">
            <h1
              class="text-xs sm:text-base font-bold text-text-primary truncate max-w-[95px] xs:max-w-[140px] sm:max-w-xs md:max-w-md"
            >
              {{ room.title }}
            </h1>
            <span
              v-if="isHost"
              class="px-1.5 py-0.2 rounded text-[9px] sm:text-[10px] font-bold bg-gold/20 text-gold border border-gold/40 shrink-0"
            >
              Host
            </span>
          </div>

          <div
            class="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-text-muted"
          >
            <span class="inline-flex items-center gap-1 font-medium">
              <span
                class="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full"
                :class="isConnected ? 'bg-emerald animate-pulse' : 'bg-amber-400'"
              />
              <span :class="isConnected ? 'text-emerald' : 'text-amber-400'">
                {{ isConnected ? 'Live' : 'Connecting' }}
              </span>
            </span>

            <span class="text-line">•</span>

            <span class="font-mono font-semibold text-sky-soft"> #{{ room.id }} </span>
          </div>
        </div>
      </div>

      <!-- Right: Consolidated Controls (Avatars Stack, Share Button, Primary Host Action & Menu) -->
      <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <!-- 1. Participant Avatar Stack (Clickable to open roster & edit persona) -->
        <button
          type="button"
          class="flex items-center gap-1 p-1 sm:px-2.5 sm:py-1 rounded-xl bg-canvas hover:bg-line border border-line hover:border-sky-end/40 transition-all cursor-pointer group"
          title="View friends in lobby & edit persona"
          @click="showRosterModal = true"
        >
          <div class="flex items-center -space-x-1.5">
            <div
              v-for="p in visibleParticipants"
              :key="p.id"
              class="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-card border border-line flex items-center justify-center text-[11px] sm:text-xs shadow-sm"
              :title="p.name"
            >
              {{ p.emoji }}
            </div>
          </div>
          <span v-if="extraParticipantsCount > 0" class="text-[10px] font-bold text-sky-end pr-0.5">
            +{{ extraParticipantsCount }}
          </span>
          <span
            class="text-[11px] text-text-muted group-hover:text-sky-soft hidden md:inline font-medium ml-0.5"
          >
            {{ room.participants.length }} friends
          </span>
        </button>

        <!-- 2. ONE Single Share Button (Opens Share & Telegram Modal) -->
        <button
          type="button"
          class="px-2 sm:px-3 py-1.5 rounded-xl bg-sky-end/15 hover:bg-sky-end/25 text-sky-end border border-sky-end/30 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-sm"
          title="Share lobby with friends"
          @click="showShareModal = true"
        >
          <Share2 class="w-3.5 h-3.5" />
          <span class="hidden sm:inline">Invite</span>
        </button>

        <!-- 3. Host Primary Action Button (Advances Game Step) -->
        <template v-if="isHost">
          <button
            v-if="room.phase === 'ideas'"
            type="button"
            class="px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-sky-gradient text-canvas font-bold text-xs shadow-md hover:opacity-95 active:scale-95 flex items-center gap-1 sm:gap-1.5 cursor-pointer"
            @click="emit('changePhase', 'voting')"
          >
            <Play class="w-3.5 h-3.5 fill-[#0b1220]" />
            <span><span class="sm:hidden">Vote 🪙</span><span class="hidden sm:inline">Start Voting 🪙</span></span>
          </button>

          <button
            v-else-if="room.phase === 'voting'"
            type="button"
            class="px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-sky-gradient text-canvas font-bold text-xs shadow-md hover:opacity-95 active:scale-95 flex items-center gap-1 sm:gap-1.5 cursor-pointer"
            @click="emit('changePhase', 'finished')"
          >
            <Trophy class="w-3.5 h-3.5" />
            <span><span class="sm:hidden">Winner 🏆</span><span class="hidden sm:inline">Reveal Winner 🏆</span></span>
          </button>

          <!-- 4. Host More Menu (•••) for Secondary Actions (Reset, End, etc.) -->
          <div class="relative">
            <button
              type="button"
              class="p-1.5 rounded-xl bg-canvas hover:bg-line text-text-muted hover:text-text-primary border border-line cursor-pointer transition-colors"
              title="Host settings & options"
              @click="showHostMenu = !showHostMenu"
            >
              <MoreVertical class="w-4 h-4" />
            </button>

            <!-- Dropdown Menu -->
            <Transition name="dropdown-slide">
              <div
                v-if="showHostMenu"
                class="absolute right-0 mt-2 w-48 bg-card border border-line rounded-xl shadow-2xl py-1 z-50 origin-top-right"
              >
                <button
                  v-if="room.phase === 'voting'"
                  type="button"
                  class="w-full px-3.5 py-2 text-left text-xs text-sky-soft hover:bg-line flex items-center gap-2 cursor-pointer transition-colors"
                  @click="handleResetVotes"
                >
                  <RotateCcw class="w-3.5 h-3.5 text-gold" />
                  <span>Reset All Votes</span>
                </button>

                <button
                  v-if="room.phase === 'finished'"
                  type="button"
                  class="w-full px-3.5 py-2 text-left text-xs text-sky-end hover:bg-line flex items-center gap-2 cursor-pointer transition-colors"
                  @click="handleReopenVoting"
                >
                  <RotateCcw class="w-3.5 h-3.5" />
                  <span>Reopen Voting</span>
                </button>

                <div class="h-px bg-line my-1" />

                <button
                  type="button"
                  class="w-full px-3.5 py-2 text-left text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2 cursor-pointer transition-colors"
                  @click="handleEndAndClear"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                  <span>End & Delete Lobby</span>
                </button>
              </div>
            </Transition>
          </div>
        </template>
      </div>
    </div>

    <!-- Backdrop closer for host menu -->
    <Teleport to="body">
      <div v-if="showHostMenu" class="fixed inset-0 z-40" @click="showHostMenu = false" />
    </Teleport>

    <!-- ============================================== -->
    <!-- UNIFIED SHARE & INVITE MODAL                    -->
    <!-- ============================================== -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showShareModal"
          class="fixed inset-0 z-50 bg-canvas/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
        >
          <div
            class="modal-dialog w-full max-w-sm bg-card border border-line rounded-[20px] p-5 shadow-2xl relative my-auto"
          >
            <button
              type="button"
              class="absolute top-4 right-4 text-text-muted hover:text-text-primary cursor-pointer"
              @click="showShareModal = false"
            >
              <X class="w-5 h-5" />
            </button>

            <div class="flex items-center gap-2.5 mb-3">
              <div
                class="w-9 h-9 rounded-xl bg-sky-end/15 border border-sky-end/30 flex items-center justify-center text-sky-end"
              >
                <Share2 class="w-4 h-4" />
              </div>
              <div>
                <h3 class="text-sm font-bold text-text-primary">Invite Friends</h3>
                <p class="text-[11px] text-text-muted">
                  <span class="sm:hidden">No signup needed</span>
                  <span class="hidden sm:inline">Zero signup required to join</span>
                </p>
              </div>
            </div>

            <!-- Room Code Box -->
            <div
              class="p-3 rounded-xl bg-canvas border border-line mb-4 flex items-center justify-between"
            >
              <div>
                <span class="text-[10px] uppercase font-bold text-text-muted block"
                  >Lobby Code</span
                >
                <span class="font-mono text-base font-black text-sky-end tracking-wider">{{
                  room.id
                }}</span>
              </div>
              <button
                type="button"
                class="px-3 py-1.5 rounded-lg bg-card hover:bg-line border border-line text-xs font-semibold text-sky-soft flex items-center gap-1.5 cursor-pointer transition-colors"
                @click="copyCode"
              >
                <Check v-if="copiedCode" class="w-3.5 h-3.5 text-emerald" />
                <Copy v-else class="w-3.5 h-3.5 opacity-70" />
                <span>{{ copiedCode ? 'Copied' : 'Copy' }}</span>
              </button>
            </div>

            <!-- Main Actions -->
            <div class="space-y-2 mb-2">
              <!-- Telegram -->
              <button
                type="button"
                class="w-full py-2.5 px-4 rounded-xl bg-telegram hover:bg-telegram/90 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
                @click="shareTelegram"
              >
                <Send class="w-4 h-4" />
                <span>
                  <span class="sm:hidden">Telegram</span>
                  <span class="hidden sm:inline">Share to Telegram</span>
                </span>
              </button>

              <!-- Copy Direct Link -->
              <button
                type="button"
                class="w-full py-2.5 px-4 rounded-xl bg-canvas hover:bg-line border border-line text-sky-soft font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
                @click="copyLink"
              >
                <Check v-if="copiedLink" class="w-4 h-4 text-emerald" />
                <Copy v-else class="w-4 h-4 text-sky-end" />
                <span>
                  <span class="sm:hidden">{{ copiedLink ? 'Copied!' : 'Copy Link' }}</span>
                  <span class="hidden sm:inline">{{ copiedLink ? 'Copied Link!' : 'Copy Direct Link' }}</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ============================================== -->
    <!-- UNIFIED ROSTER & PERSONA MODAL                 -->
    <!-- ============================================== -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showRosterModal"
          class="fixed inset-0 z-50 bg-canvas/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
        >
          <div
            class="modal-dialog w-full max-w-sm bg-card border border-line rounded-[20px] p-5 shadow-2xl relative my-auto"
          >
            <button
              type="button"
              class="absolute top-4 right-4 text-text-muted hover:text-text-primary cursor-pointer"
              @click="showRosterModal = false"
            >
              <X class="w-5 h-5" />
            </button>

            <h3 class="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
              <Users class="w-4 h-4 text-sky-end" />
              <span>Friends in Lobby ({{ room.participants.length }})</span>
            </h3>

            <!-- Your Persona Card with Edit Button -->
            <div
              class="p-3 rounded-xl bg-canvas border border-sky-end/40 mb-3 flex items-center justify-between"
            >
              <div class="flex items-center gap-2.5">
                <span class="text-2xl">{{ currentUser.emoji }}</span>
                <div>
                  <div class="text-xs font-bold text-text-primary flex items-center gap-1">
                    <span>{{ currentUser.name }}</span>
                    <span class="text-[10px] text-sky-end font-normal">(you)</span>
                  </div>
                  <span class="text-[10px] text-text-muted">
                    <span class="sm:hidden">Tap to edit</span>
                    <span class="hidden sm:inline">Tap to change name or mascot</span>
                  </span>
                </div>
              </div>
              <button
                type="button"
                class="px-2.5 py-1 rounded-lg bg-sky-gradient text-canvas text-xs font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                @click="handleEditIdentityFromRoster"
              >
                <Edit3 class="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>

            <!-- Participants List -->
            <div class="max-h-48 overflow-y-auto space-y-1.5 pr-1">
              <div
                v-for="p in room.participants"
                :key="p.id"
                class="flex items-center justify-between p-2 rounded-lg bg-canvas/50 border border-line/60 text-xs"
              >
                <div class="flex items-center gap-2">
                  <span class="text-base">{{ p.emoji }}</span>
                  <span class="font-medium text-text-primary">{{ p.name }}</span>
                </div>
                <span
                  v-if="p.id === room.creatorId"
                  class="text-[10px] font-bold text-gold flex items-center gap-1"
                >
                  <Crown class="w-3 h-3" />
                  <span>Host</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </header>
</template>
