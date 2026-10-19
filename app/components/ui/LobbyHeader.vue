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
    class="w-full bg-[#121a2b]/90 backdrop-blur-xl border-b border-[#25314a] sticky top-0 z-40 transition-all"
  >
    <div
      class="max-w-7xl mx-auto px-2.5 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-1.5 sm:gap-3"
    >
      <!-- Left: Back Button, Room Title & Live Indicator -->
      <div class="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          type="button"
          class="p-1.5 sm:p-2 rounded-xl bg-[#0b1220] hover:bg-[#25314a] text-[#8fa3c4] hover:text-[#eaf2ff] border border-[#25314a] cursor-pointer transition-colors shrink-0"
          title="Leave Lobby"
          @click="emit('leave')"
        >
          <ArrowLeft class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        <div class="min-w-0">
          <div class="flex items-center gap-1.5 sm:gap-2">
            <h1
              class="text-xs sm:text-base font-bold text-[#eaf2ff] truncate max-w-[95px] xs:max-w-[140px] sm:max-w-xs md:max-w-md"
            >
              {{ room.title }}
            </h1>
            <span
              v-if="isHost"
              class="px-1.5 py-0.2 rounded text-[9px] sm:text-[10px] font-bold bg-[#f5c242]/20 text-[#f5c242] border border-[#f5c242]/40 shrink-0"
            >
              Host
            </span>
          </div>

          <div class="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-[#8fa3c4]">
            <span class="inline-flex items-center gap-1 font-medium">
              <span
                class="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full"
                :class="isConnected ? 'bg-[#3fb950] animate-pulse' : 'bg-amber-400'"
              />
              <span :class="isConnected ? 'text-[#3fb950]' : 'text-amber-400'">
                {{ isConnected ? 'Live' : 'Connecting' }}
              </span>
            </span>

            <span class="text-[#25314a]">•</span>

            <span class="font-mono font-semibold text-[#d0ebff]"> #{{ room.id }} </span>
          </div>
        </div>
      </div>

      <!-- Right: Consolidated Controls (Avatars Stack, Share Button, Primary Host Action & Menu) -->
      <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <!-- 1. Participant Avatar Stack (Clickable to open roster & edit persona) -->
        <button
          type="button"
          class="flex items-center gap-1 p-1 sm:px-2.5 sm:py-1 rounded-xl bg-[#0b1220] hover:bg-[#25314a] border border-[#25314a] hover:border-[#74b9ff]/40 transition-all cursor-pointer group"
          title="View friends in lobby & edit persona"
          @click="showRosterModal = true"
        >
          <div class="flex items-center -space-x-1.5">
            <div
              v-for="p in visibleParticipants"
              :key="p.id"
              class="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#121a2b] border border-[#25314a] flex items-center justify-center text-[11px] sm:text-xs shadow-sm"
              :title="p.name"
            >
              {{ p.emoji }}
            </div>
          </div>
          <span
            v-if="extraParticipantsCount > 0"
            class="text-[10px] font-bold text-[#74b9ff] pr-0.5"
          >
            +{{ extraParticipantsCount }}
          </span>
          <span
            class="text-[11px] text-[#8fa3c4] group-hover:text-[#d0ebff] hidden md:inline font-medium ml-0.5"
          >
            {{ room.participants.length }} friends
          </span>
        </button>

        <!-- 2. ONE Single Share Button (Opens Share & Telegram Modal) -->
        <button
          type="button"
          class="px-2 sm:px-3 py-1.5 rounded-xl bg-[#74b9ff]/15 hover:bg-[#74b9ff]/25 text-[#74b9ff] border border-[#74b9ff]/30 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-sm"
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
            class="px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-sky-gradient text-[#0b1220] font-bold text-xs shadow-md hover:opacity-95 active:scale-95 flex items-center gap-1 sm:gap-1.5 cursor-pointer"
            @click="emit('changePhase', 'voting')"
          >
            <Play class="w-3.5 h-3.5 fill-[#0b1220]" />
            <span><span class="hidden sm:inline">Start </span>Voting 🪙</span>
          </button>

          <button
            v-else-if="room.phase === 'voting'"
            type="button"
            class="px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-sky-gradient text-[#0b1220] font-bold text-xs shadow-md hover:opacity-95 active:scale-95 flex items-center gap-1 sm:gap-1.5 cursor-pointer"
            @click="emit('changePhase', 'finished')"
          >
            <Trophy class="w-3.5 h-3.5" />
            <span><span class="hidden sm:inline">Reveal </span>Winner 🏆</span>
          </button>

          <!-- 4. Host More Menu (•••) for Secondary Actions (Reset, End, etc.) -->
          <div class="relative">
            <button
              type="button"
              class="p-1.5 rounded-xl bg-[#0b1220] hover:bg-[#25314a] text-[#8fa3c4] hover:text-[#eaf2ff] border border-[#25314a] cursor-pointer transition-colors"
              title="Host settings & options"
              @click="showHostMenu = !showHostMenu"
            >
              <MoreVertical class="w-4 h-4" />
            </button>

            <!-- Dropdown Menu -->
            <Transition name="dropdown-slide">
              <div
                v-if="showHostMenu"
                class="absolute right-0 mt-2 w-48 bg-[#121a2b] border border-[#25314a] rounded-xl shadow-2xl py-1 z-50 origin-top-right"
              >
                <button
                  v-if="room.phase === 'voting'"
                  type="button"
                  class="w-full px-3.5 py-2 text-left text-xs text-[#d0ebff] hover:bg-[#25314a] flex items-center gap-2 cursor-pointer transition-colors"
                  @click="handleResetVotes"
                >
                  <RotateCcw class="w-3.5 h-3.5 text-[#f5c242]" />
                  <span>Reset All Votes</span>
                </button>

                <button
                  v-if="room.phase === 'finished'"
                  type="button"
                  class="w-full px-3.5 py-2 text-left text-xs text-[#74b9ff] hover:bg-[#25314a] flex items-center gap-2 cursor-pointer transition-colors"
                  @click="handleReopenVoting"
                >
                  <RotateCcw class="w-3.5 h-3.5" />
                  <span>Reopen Voting</span>
                </button>

                <div class="h-px bg-[#25314a] my-1" />

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
    <div v-if="showHostMenu" class="fixed inset-0 z-40" @click="showHostMenu = false" />

    <!-- ============================================== -->
    <!-- UNIFIED SHARE & INVITE MODAL                    -->
    <!-- ============================================== -->
    <Transition name="modal">
      <div
        v-if="showShareModal"
        class="fixed inset-0 z-50 bg-[#0b1220]/80 backdrop-blur-md flex items-center justify-center p-4"
      >
        <div
          class="modal-dialog w-full max-w-sm bg-[#121a2b] border border-[#25314a] rounded-[20px] p-5 shadow-2xl relative"
        >
          <button
            type="button"
            class="absolute top-4 right-4 text-[#8fa3c4] hover:text-[#eaf2ff] cursor-pointer"
            @click="showShareModal = false"
          >
            <X class="w-5 h-5" />
          </button>

          <div class="flex items-center gap-2.5 mb-3">
            <div
              class="w-9 h-9 rounded-xl bg-[#74b9ff]/15 border border-[#74b9ff]/30 flex items-center justify-center text-[#74b9ff]"
            >
              <Share2 class="w-4 h-4" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-[#eaf2ff]">Invite Friends</h3>
              <p class="text-[11px] text-[#8fa3c4]">Zero signup required to join</p>
            </div>
          </div>

          <!-- Room Code Box -->
          <div
            class="p-3 rounded-xl bg-[#0b1220] border border-[#25314a] mb-4 flex items-center justify-between"
          >
            <div>
              <span class="text-[10px] uppercase font-bold text-[#8fa3c4] block">Lobby Code</span>
              <span class="font-mono text-base font-black text-[#74b9ff] tracking-wider">{{
                room.id
              }}</span>
            </div>
            <button
              type="button"
              class="px-3 py-1.5 rounded-lg bg-[#121a2b] hover:bg-[#25314a] border border-[#25314a] text-xs font-semibold text-[#d0ebff] flex items-center gap-1.5 cursor-pointer transition-colors"
              @click="copyCode"
            >
              <Check v-if="copiedCode" class="w-3.5 h-3.5 text-[#3fb950]" />
              <Copy v-else class="w-3.5 h-3.5 opacity-70" />
              <span>{{ copiedCode ? 'Copied' : 'Copy' }}</span>
            </button>
          </div>

          <!-- Main Actions -->
          <div class="space-y-2 mb-2">
            <!-- Telegram -->
            <button
              type="button"
              class="w-full py-2.5 px-4 rounded-xl bg-[#229ed9] hover:bg-[#229ed9]/90 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
              @click="shareTelegram"
            >
              <Send class="w-4 h-4" />
              <span>Share to Telegram</span>
            </button>

            <!-- Copy Direct Link -->
            <button
              type="button"
              class="w-full py-2.5 px-4 rounded-xl bg-[#0b1220] hover:bg-[#25314a] border border-[#25314a] text-[#d0ebff] font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
              @click="copyLink"
            >
              <Check v-if="copiedLink" class="w-4 h-4 text-[#3fb950]" />
              <Copy v-else class="w-4 h-4 text-[#74b9ff]" />
              <span>{{ copiedLink ? 'Copied Link!' : 'Copy Direct Link' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ============================================== -->
    <!-- UNIFIED ROSTER & PERSONA MODAL                 -->
    <!-- ============================================== -->
    <Transition name="modal">
      <div
        v-if="showRosterModal"
        class="fixed inset-0 z-50 bg-[#0b1220]/80 backdrop-blur-md flex items-center justify-center p-4"
      >
        <div
          class="modal-dialog w-full max-w-sm bg-[#121a2b] border border-[#25314a] rounded-[20px] p-5 shadow-2xl relative"
        >
          <button
            type="button"
            class="absolute top-4 right-4 text-[#8fa3c4] hover:text-[#eaf2ff] cursor-pointer"
            @click="showRosterModal = false"
          >
            <X class="w-5 h-5" />
          </button>

          <h3 class="text-sm font-bold text-[#eaf2ff] mb-3 flex items-center gap-2">
            <Users class="w-4 h-4 text-[#74b9ff]" />
            <span>Friends in Lobby ({{ room.participants.length }})</span>
          </h3>

          <!-- Your Persona Card with Edit Button -->
          <div
            class="p-3 rounded-xl bg-[#0b1220] border border-[#74b9ff]/40 mb-3 flex items-center justify-between"
          >
            <div class="flex items-center gap-2.5">
              <span class="text-2xl">{{ currentUser.emoji }}</span>
              <div>
                <div class="text-xs font-bold text-[#eaf2ff] flex items-center gap-1">
                  <span>{{ currentUser.name }}</span>
                  <span class="text-[10px] text-[#74b9ff] font-normal">(you)</span>
                </div>
                <span class="text-[10px] text-[#8fa3c4]">Tap to change name or mascot</span>
              </div>
            </div>
            <button
              type="button"
              class="px-2.5 py-1 rounded-lg bg-sky-gradient text-[#0b1220] text-xs font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
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
              class="flex items-center justify-between p-2 rounded-lg bg-[#0b1220]/50 border border-[#25314a]/60 text-xs"
            >
              <div class="flex items-center gap-2">
                <span class="text-base">{{ p.emoji }}</span>
                <span class="font-medium text-[#eaf2ff]">{{ p.name }}</span>
              </div>
              <span
                v-if="p.id === room.creatorId"
                class="text-[10px] font-bold text-[#f5c242] flex items-center gap-1"
              >
                <Crown class="w-3 h-3" />
                <span>Host</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </header>
</template>
