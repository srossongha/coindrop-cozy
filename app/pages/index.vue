<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { Sparkles, Plus, ArrowRight, Coins, Trophy, Users, Lightbulb } from 'lucide-vue-next'
import type { CardIdea, CoinType, EnrichedCardIdea } from '~/types'
import { useIdentity } from '~/composables/useIdentity'
import { useLobby } from '~/composables/useLobby'
import LobbyHeader from '~/components/ui/LobbyHeader.vue'
import LobbyCard from '~/components/ui/LobbyCard.vue'
import CoinPouchBar from '~/components/ui/CoinPouchBar.vue'
import IdentityModal from '~/components/ui/IdentityModal.vue'
import CreateIdeaModal from '~/components/ui/CreateIdeaModal.vue'

useHead({
  title: 'CoinDrop — Cozy Multiplayer Decision Lobby',
  meta: [
    {
      name: 'description',
      content:
        'Zero-account multiplayer decision lobby. Brainstorm card ideas, share via Telegram, and drop your gold & red coins to vote in real-time!',
    },
  ],
})

const route = useRoute()
const router = useRouter()

const { identity, init: initIdentity, hasDefinedSelf } = useIdentity()
const {
  currentRoom,
  isConnected,
  isSupabaseConfigured,
  recentRooms,
  activeDrop,
  myGoldRemaining,
  myRedRemaining,
  MAX_GOLD_COINS,
  MAX_RED_COINS,
  enrichedIdeas,
  loadRecentRooms,
  createLobby,
  joinLobby,
  leaveLobby,
  endLobbyAndClearData,
  addIdea,
  updateIdea,
  deleteIdea,
  dropCoin,
  removeCoin,
  changePhase,
  resetVotes,
  setupSupabaseRealtime,
  updateParticipantIdentity,
} = useLobby()

// Local state for landing inputs & loading
const landingTab = ref<'create' | 'join'>('create')
const slideDirection = ref<'slide-left' | 'slide-right'>('slide-left')
const cardInnerRef = ref<HTMLElement | null>(null)
const cardHeight = ref<number | null>(null)
let cardResizeObserver: ResizeObserver | null = null

function setLandingTab(tab: 'create' | 'join') {
  if (landingTab.value === tab) return
  slideDirection.value = tab === 'join' ? 'slide-left' : 'slide-right'
  landingTab.value = tab
}

function handleTransitionEnter() {
  if (cardInnerRef.value) {
    const height = cardInnerRef.value.offsetHeight
    if (height > 100) {
      cardHeight.value = Math.round(height) + 2
    }
  }
}

watch(
  cardInnerRef,
  el => {
    if (cardResizeObserver) {
      cardResizeObserver.disconnect()
      cardResizeObserver = null
    }
    if (el && typeof ResizeObserver !== 'undefined') {
      cardResizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          const target = entry.target as HTMLElement
          const height = target.offsetHeight || entry.contentRect.height
          if (height > 100) {
            cardHeight.value = Math.round(height) + 2
          }
        }
      })
      cardResizeObserver.observe(el)
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (cardResizeObserver) {
    cardResizeObserver.disconnect()
    cardResizeObserver = null
  }
})

const newRoomTitle = ref('')
const joinRoomCode = ref('')
const isJoining = ref(false)
const toastMessage = ref<string | null>(null)

// Pending actions for first-time persona onboarding
const pendingRoomCode = ref<string | null>(null)
const pendingAction = ref<'join' | 'create' | null>(null)

// Modal states
const showIdentityModal = ref(false)
const isIdentityMandatory = ref(false)
const identityModalTitle = ref('Choose Your Persona')
const identityModalDescription = ref(
  'Zero signup needed! Pick your nickname and cute emoji to join the decision lobby.',
)
const showIdeaModal = ref(false)
const editingIdea = ref<CardIdea | null>(null)

const isHost = computed(() => {
  if (!currentRoom.value || !identity.value) return false
  return currentRoom.value.creatorId === identity.value.id
})

const winningCard = computed<EnrichedCardIdea | null>(() => {
  if (!currentRoom.value || !currentRoom.value.winnerCardId) return null
  return enrichedIdeas.value.find(c => c.id === currentRoom.value?.winnerCardId) || null
})

function showToast(msg: string) {
  toastMessage.value = msg
  setTimeout(() => {
    if (toastMessage.value === msg) {
      toastMessage.value = null
    }
  }, 2600)
}

function handleOpenEditIdentity() {
  isIdentityMandatory.value = false
  identityModalTitle.value = 'Update Your Persona'
  identityModalDescription.value = 'Change your nickname or cute mascot emoji anytime!'
  showIdentityModal.value = true
}

async function handleIdentitySaved() {
  showIdentityModal.value = false
  const user = identity.value || initIdentity()

  // 1. If currently inside a lobby, update persona across participants & broadcast
  if (currentRoom.value) {
    updateParticipantIdentity(user)
    showToast(`Updated persona to ${user.emoji} ${user.name}! ✨`)
  }

  // 2. If there was a pending join action, execute it now
  if (pendingAction.value === 'join' && pendingRoomCode.value) {
    const target = pendingRoomCode.value
    pendingRoomCode.value = null
    pendingAction.value = null
    isIdentityMandatory.value = false

    isJoining.value = true
    const result = await joinLobby(target, user)
    isJoining.value = false
    if (result.success) {
      router.replace({ query: { room: target } })
      showToast(`Welcome! Joined lobby: #${target} 🪙`)
    } else {
      showToast(`Lobby #${target} was not found or has expired.`)
      router.replace({ query: {} })
    }
  } else if (pendingAction.value === 'create') {
    pendingAction.value = null
    isIdentityMandatory.value = false
    await handleCreateLobby()
  }
}

onMounted(async () => {
  // 1. Initialize user persona from localStorage
  const user = initIdentity()
  loadRecentRooms()

  // 2. Check for room code in URL query (?room=DROP-XXXX) or hash (#DROP-XXXX)
  const roomQuery =
    (route.query.room as string) ||
    (window.location.hash ? window.location.hash.replace('#', '') : null)

  if (roomQuery && roomQuery.trim()) {
    const raw = roomQuery.trim().toUpperCase()
    const targetRoom = raw.startsWith('DROP-') ? raw : `DROP-${raw}`

    // FIRST JOIN ONBOARDING: If user hasn't chosen/defined their persona yet, prompt them first!
    if (!hasDefinedSelf()) {
      pendingRoomCode.value = targetRoom
      pendingAction.value = 'join'
      isIdentityMandatory.value = true
      identityModalTitle.value = 'Define Yourself First 🦫'
      identityModalDescription.value = `You were invited to room #${targetRoom}! Pick your nickname & mascot before joining your friends.`
      showIdentityModal.value = true
      return
    }

    isJoining.value = true
    const result = await joinLobby(targetRoom, user)
    isJoining.value = false
    if (result.success) {
      showToast(`Joined lobby: #${targetRoom} 🪙`)
    } else {
      showToast(`Lobby #${targetRoom} was not found or has expired.`)
      router.replace({ query: {} })
    }
  } else if (currentRoom.value) {
    // If room is already active in local state, fetch fresh remote state & connect Supabase Realtime channel
    if (isSupabaseConfigured.value) {
      const fresh = await useSupabase().fetchRoom(currentRoom.value.id)
      if (fresh) {
        currentRoom.value = fresh
      }
    }
    setupSupabaseRealtime(currentRoom.value.id, user)
    router.replace({ query: { room: currentRoom.value.id } })
  }
})

// Create lobby handler
async function handleCreateLobby() {
  if (!hasDefinedSelf()) {
    pendingAction.value = 'create'
    isIdentityMandatory.value = true
    identityModalTitle.value = 'Define Yourself First 🦫'
    identityModalDescription.value =
      'You are creating a new lobby! Choose your host nickname & mascot emoji.'
    showIdentityModal.value = true
    return
  }

  const user = identity.value || initIdentity()
  isJoining.value = true
  const room = await createLobby(newRoomTitle.value, user)
  isJoining.value = false
  newRoomTitle.value = ''
  router.replace({ query: { room: room.id } })
  showToast(`Created lobby ${room.id}! Share with friends.`)
}

// Join lobby handler
async function handleJoinLobby() {
  if (!joinRoomCode.value.trim()) return
  const raw = joinRoomCode.value.trim().toUpperCase()
  const code = raw.startsWith('DROP-') ? raw : `DROP-${raw}`

  if (!hasDefinedSelf()) {
    pendingRoomCode.value = code
    pendingAction.value = 'join'
    isIdentityMandatory.value = true
    identityModalTitle.value = 'Define Yourself First 🦫'
    identityModalDescription.value = `Joining lobby #${code}! Choose your nickname & mascot emoji.`
    showIdentityModal.value = true
    return
  }

  const user = identity.value || initIdentity()
  isJoining.value = true
  const result = await joinLobby(code, user)
  isJoining.value = false
  if (result.success) {
    joinRoomCode.value = ''
    router.replace({ query: { room: code } })
    showToast(`Joined lobby ${code}!`)
  } else {
    showToast(`Lobby ${code} was not found or has expired.`)
  }
}

async function handleRecentLobbyClick(roomId: string) {
  const user = identity.value || initIdentity()
  isJoining.value = true
  const result = await joinLobby(roomId, user)
  isJoining.value = false
  if (result.success) {
    router.replace({ query: { room: roomId } })
  } else {
    showToast(`Lobby #${roomId} is expired or no longer exists.`)
  }
}

async function handleEndLobby() {
  if (
    !confirm(
      'Are you sure you want to close this lobby? All cards and votes will be permanently cleared for all participants.',
    )
  ) {
    return
  }
  await endLobbyAndClearData()
  router.replace({ query: {} })
  showToast('Lobby closed and cleared. ✨')
}

// Open modal to add idea
function handleOpenAddIdea() {
  editingIdea.value = null
  showIdeaModal.value = true
}

// Open modal to edit idea (Host or Author)
function handleOpenEditIdea(card: EnrichedCardIdea) {
  editingIdea.value = card
  showIdeaModal.value = true
}

// Submit idea (new or update)
function handleSaveIdea(data: {
  title: string
  category: string
  priceNote?: string
  link?: string
  description?: string
}) {
  const user = identity.value || initIdentity()
  if (editingIdea.value) {
    updateIdea({
      ...editingIdea.value,
      title: data.title,
      category: data.category,
      priceNote: data.priceNote,
      link: data.link,
      description: data.description,
    })
    showToast('Updated card details! ✓')
  } else {
    addIdea(data, user)
    showToast('Added your idea to the board! 💡')
  }
  showIdeaModal.value = false
  editingIdea.value = null
}

function handleDeleteIdea(ideaId: string) {
  deleteIdea(ideaId)
  showToast('Removed card option.')
  showIdeaModal.value = false
  editingIdea.value = null
}

function handleDropCoin(cardId: string, coinType: CoinType) {
  const user = identity.value || initIdentity()
  const success = dropCoin(cardId, coinType, user)
  if (success) {
    showToast(coinType === 'gold' ? '+1 Gold Coin dropped! 🪙' : '+1 Red Super Coin dropped! 🔴')
  }
}

function handleRemoveCoin(cardId: string, coinType: CoinType) {
  const user = identity.value || initIdentity()
  const success = removeCoin(cardId, coinType, user)
  if (success) {
    showToast('Coin retrieved back to your pouch.')
  }
}

function handleLeaveLobby() {
  leaveLobby()
  // Clean URL query
  router.replace({ query: {} })
}
</script>

<template>
  <div
    class="min-h-screen bg-[#0b1220] text-[#eaf2ff] flex flex-col font-sans selection:bg-[#74b9ff]/30 selection:text-[#d0ebff] relative"
  >
    <!-- Subtle top radial sky glow per design requirement -->
    <div
      class="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] pointer-events-none z-0 rounded-full bg-radial from-[#a5d8ff]/10 via-[#74b9ff]/5 to-transparent blur-2xl"
    />

    <!-- Global Toast Notification -->
    <Transition name="modal">
      <div
        v-if="toastMessage"
        class="modal-dialog fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#121a2b] border border-[#74b9ff]/60 text-[#d0ebff] px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold shadow-sky-glow"
      >
        <Sparkles class="w-4 h-4 text-[#74b9ff] shrink-0" />
        <span>{{ toastMessage }}</span>
      </div>
    </Transition>

    <!-- Join Loading Overlay -->
    <Transition name="modal">
      <div
        v-if="isJoining"
        class="fixed inset-0 z-50 bg-[#0b1220]/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3"
      >
        <div
          class="w-10 h-10 border-3 border-[#74b9ff] border-t-transparent rounded-full animate-spin"
        />
        <p class="text-xs font-semibold text-[#d0ebff]">Connecting to lobby...</p>
      </div>
    </Transition>

    <!-- =================================================== -->
    <!-- SCENARIO A: ACTIVE LOBBY VIEW                       -->
    <!-- =================================================== -->
    <template v-if="currentRoom">
      <!-- Top Lobby Bar with Code, Telegram Share, and Host Controls -->
      <LobbyHeader
        :room="currentRoom"
        :current-user="identity || { id: '', name: 'Guest', emoji: '🦫' }"
        :is-connected="isConnected"
        :is-host="isHost"
        @change-phase="phase => changePhase(phase)"
        @reset-votes="resetVotes"
        @leave="handleLeaveLobby"
        @end-and-clear="handleEndLobby"
        @edit-identity="handleOpenEditIdentity"
        @toast="msg => showToast(msg)"
      />

      <!-- Lobby Main Content -->
      <main
        class="max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-6 flex-1 relative z-10 pb-32 sm:pb-36"
      >
        <!-- Clean Phase Bar & Action -->
        <div
          class="mb-4 sm:mb-6 flex items-center justify-between gap-2.5 sm:gap-3 p-2.5 sm:px-4 sm:py-3 rounded-2xl bg-[#121a2b]/80 border border-[#25314a]"
        >
          <div class="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div
              :class="[
                'w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-xs sm:text-sm border shrink-0',
                currentRoom.phase === 'ideas'
                  ? 'bg-[#74b9ff]/15 border-[#74b9ff]/30 text-[#74b9ff]'
                  : currentRoom.phase === 'voting'
                    ? 'bg-[#f5c242]/15 border-[#f5c242]/30 text-[#f5c242]'
                    : 'bg-[#3fb950]/15 border-[#3fb950]/30 text-[#3fb950]',
              ]"
            >
              <Lightbulb
                v-if="currentRoom.phase === 'ideas'"
                class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#74b9ff]"
              />
              <Coins
                v-else-if="currentRoom.phase === 'voting'"
                class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#f5c242]"
              />
              <Trophy v-else class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#3fb950]" />
            </div>

            <div class="min-w-0">
              <span class="text-xs sm:text-sm font-bold text-[#eaf2ff] block truncate">
                {{
                  currentRoom.phase === 'ideas'
                    ? 'Brainstorming Options'
                    : currentRoom.phase === 'voting'
                      ? 'Live Voting Phase'
                      : 'Winner Decided!'
                }}
              </span>
              <span class="text-[11px] text-[#8fa3c4] hidden md:block">
                {{
                  currentRoom.phase === 'ideas'
                    ? 'Anyone can propose cards. The host starts voting when ready.'
                    : currentRoom.phase === 'voting'
                      ? '5 Gold coins (1pt) and 2 Red coins (2pt) in your pouch.'
                      : 'The winning group choice is highlighted below.'
                }}
              </span>
            </div>
          </div>

          <!-- Add Idea Button (Always accessible before finish) -->
          <button
            v-if="currentRoom.phase !== 'finished'"
            type="button"
            class="px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-sky-gradient text-[#0b1220] font-bold text-xs shadow-md transition-all hover:opacity-95 active:scale-95 flex items-center gap-1 sm:gap-1.5 cursor-pointer shrink-0"
            @click="handleOpenAddIdea"
          >
            <Plus class="w-3.5 h-3.5" />
            <span><span class="hidden sm:inline">Add </span>Option</span>
          </button>
        </div>

        <!-- Finished Phase Winner Podium Banner -->
        <Transition name="modal">
          <div
            v-if="currentRoom.phase === 'finished' && winningCard"
            class="modal-dialog mb-6 sm:mb-8 p-4 sm:p-8 rounded-[20px] bg-gradient-to-b from-[#121a2b] to-[#0b1220] border-2 border-[#74b9ff] shadow-2xl shadow-[#74b9ff]/25 text-center relative overflow-hidden animate-pulse-glow"
          >
            <!-- Background Shimmer Sheen -->
            <div class="absolute inset-0 animate-winner-shimmer pointer-events-none" />

            <div
              class="inline-flex items-center justify-center p-2.5 sm:p-3.5 rounded-2xl bg-sky-gradient text-[#0b1220] mb-2.5 sm:mb-3 shadow-lg shadow-[#74b9ff]/40 animate-trophy-wiggle relative z-10"
            >
              <Trophy class="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <h2 class="text-lg sm:text-2xl font-black text-[#eaf2ff] mb-1 relative z-10">
              Winning Decision: {{ winningCard.title }}!
            </h2>
            <p class="text-xs sm:text-sm text-[#8fa3c4] max-w-md mx-auto mb-3 relative z-10">
              Winner with
              <span class="text-[#74b9ff] font-bold">
                {{ winningCard.totalScore }} total points
              </span>
              ({{ winningCard.totalGold }} Gold 🪙, {{ winningCard.totalRed }} Red 🔴)!
            </p>
            <div class="flex items-center justify-center gap-2 relative z-10">
              <span
                class="text-xs px-3 py-1 rounded-full bg-[#0b1220] border border-[#25314a] text-[#8fa3c4]"
              >
                Proposed by {{ winningCard.authorEmoji }} {{ winningCard.authorName }}
              </span>
            </div>
          </div>
        </Transition>

        <!-- Cards Grid with Smooth FLIP Animations and Multi-Device Breakpoints -->
        <TransitionGroup
          v-if="enrichedIdeas.length > 0"
          name="card-flip"
          tag="div"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-5"
        >
          <LobbyCard
            v-for="card in enrichedIdeas"
            :key="card.id"
            :card="card"
            :current-user="identity || { id: '', name: 'Guest', emoji: '🦫' }"
            :is-host="isHost"
            :is-voting-phase="currentRoom.phase === 'voting'"
            :is-finished-phase="currentRoom.phase === 'finished'"
            :is-winner="currentRoom.phase === 'finished' && currentRoom.winnerCardId === card.id"
            :my-gold-remaining="myGoldRemaining"
            :my-red-remaining="myRedRemaining"
            :active-drop="activeDrop"
            @drop-coin="(cardId, type) => handleDropCoin(cardId, type)"
            @remove-coin="(cardId, type) => handleRemoveCoin(cardId, type)"
            @edit-card="c => handleOpenEditIdea(c)"
          />
        </TransitionGroup>

        <!-- Empty State if no cards added yet -->
        <div
          v-else
          class="p-12 text-center rounded-[16px] bg-[#121a2b] border border-dashed border-[#25314a] flex flex-col items-center justify-center"
        >
          <div
            class="w-14 h-14 rounded-2xl bg-[#0b1220] border border-[#25314a] flex items-center justify-center text-2xl mb-3 shadow-inner"
          >
            💡
          </div>
          <h3 class="text-base font-bold text-[#eaf2ff] mb-1">No Card Ideas Yet</h3>
          <p class="text-xs text-[#8fa3c4] max-w-sm mb-4">
            Be the first to propose an option! Once added, your friends can drop coins to decide
            together.
          </p>
          <button
            type="button"
            class="px-4 py-2.5 rounded-xl bg-sky-gradient text-[#0b1220] font-bold text-xs shadow-md transition-all hover:opacity-95 active:scale-95 flex items-center gap-1.5 cursor-pointer"
            @click="handleOpenAddIdea"
          >
            <Plus class="w-4 h-4" />
            <span>Propose First Idea</span>
          </button>
        </div>
      </main>

      <!-- Sticky Coin Pouch Bar during Voting Phase -->
      <CoinPouchBar
        v-if="currentRoom.phase === 'voting'"
        :user="identity || { id: '', name: 'Guest', emoji: '🦫' }"
        :gold-remaining="myGoldRemaining"
        :red-remaining="myRedRemaining"
        :max-gold="MAX_GOLD_COINS"
        :max-red="MAX_RED_COINS"
        @edit-identity="handleOpenEditIdentity"
      />
    </template>

    <!-- =================================================== -->
    <!-- SCENARIO B: CLEAN LANDING FIRST VIEW                -->
    <!-- =================================================== -->
    <template v-else>
      <!-- Navigation Header -->
      <nav
        class="w-full border-b border-[#25314a]/80 bg-[#121a2b]/60 backdrop-blur-md sticky top-0 z-30"
      >
        <div
          class="max-w-6xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between"
        >
          <!-- Logo & Brand -->
          <div class="flex items-center gap-2 sm:gap-2.5">
            <div
              class="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-sky-gradient text-[#0b1220] flex items-center justify-center text-base sm:text-lg font-black shadow-md shrink-0"
            >
              🪙
            </div>
            <div>
              <span class="text-sm sm:text-base font-bold text-[#eaf2ff] tracking-tight"
                >CoinDrop</span
              >
              <span
                class="text-[9px] sm:text-[10px] ml-1 sm:ml-1.5 px-1.5 sm:px-2 py-0.5 rounded-full bg-[#74b9ff]/15 text-[#74b9ff] border border-[#74b9ff]/30 font-semibold uppercase tracking-wider"
              >
                Multiplayer
              </span>
            </div>
          </div>

          <!-- Persona Selector Pill -->
          <button
            type="button"
            class="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-[#121a2b] hover:bg-[#25314a] border border-[#25314a] text-xs transition-all cursor-pointer shadow-sm hover:border-[#74b9ff]/40 shrink-0"
            @click="handleOpenEditIdentity"
          >
            <span class="text-sm sm:text-base">{{ identity?.emoji || '🦫' }}</span>
            <span class="font-semibold text-[#eaf2ff] max-w-[80px] xs:max-w-[120px] truncate">
              {{ identity?.name || 'Chill Capybara' }}
            </span>
            <span class="text-[10px] text-[#74b9ff] font-medium hidden sm:inline">Change</span>
          </button>
        </div>
      </nav>

      <!-- Main Clean Landing Content -->
      <main
        class="max-w-4xl mx-auto w-full px-3.5 sm:px-6 py-8 sm:py-12 flex-1 flex flex-col justify-center relative z-10"
      >
        <!-- Hero Header -->
        <div class="text-center mb-6 sm:mb-10">
          <div
            class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#121a2b] border border-[#25314a] text-[11px] sm:text-xs text-[#d0ebff] mb-3 sm:mb-4 shadow-sm"
          >
            <span class="w-2 h-2 rounded-full bg-[#3fb950] animate-pulse shrink-0" />
            <span class="font-medium tracking-wide"
              >Live Multiplayer Decision Lounge • No Signup Required</span
            >
          </div>

          <h1
            class="text-2xl xs:text-3xl sm:text-5xl font-black text-[#eaf2ff] tracking-tight leading-tight mb-2 sm:mb-3"
          >
            Group decisions made fun.<br />
            <span
              class="text-transparent bg-clip-text bg-gradient-to-r from-[#a5d8ff] to-[#74b9ff]"
            >
              Just drop your coins.
            </span>
          </h1>

          <p class="text-xs sm:text-base text-[#8fa3c4] max-w-xl mx-auto leading-relaxed">
            Create a cozy lobby, invite friends via Telegram or code, brainstorm card ideas, and
            drop your gold & red coins to vote live.
          </p>
        </div>

        <!-- Unified Single Card with Segmented Toggle -->
        <div class="max-w-md mx-auto w-full mb-8">
          <!-- Segmented Tab Switcher with Apple-grade Sliding Indicator -->
          <div
            class="relative flex items-center p-1 rounded-2xl bg-[#121a2b] border border-[#25314a] mb-4 sm:mb-5 shadow-lg select-none"
          >
            <!-- Apple-style Sliding Indicator Pill -->
            <div
              class="absolute top-1 bottom-1 rounded-xl bg-sky-gradient shadow-md transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none"
              :style="{
                left: landingTab === 'create' ? '4px' : 'calc(50% + 2px)',
                width: 'calc(50% - 6px)',
              }"
            />

            <button
              type="button"
              class="relative z-10 flex-1 py-2 text-xs font-bold rounded-xl transition-colors duration-250 cursor-pointer flex items-center justify-center gap-1.5"
              :class="
                landingTab === 'create' ? 'text-[#0b1220]' : 'text-[#8fa3c4] hover:text-[#eaf2ff]'
              "
              @click="setLandingTab('create')"
            >
              <Plus class="w-3.5 h-3.5" />
              <span>Create Lobby</span>
            </button>
            <button
              type="button"
              class="relative z-10 flex-1 py-2 text-xs font-bold rounded-xl transition-colors duration-250 cursor-pointer flex items-center justify-center gap-1.5"
              :class="
                landingTab === 'join' ? 'text-[#0b1220]' : 'text-[#8fa3c4] hover:text-[#eaf2ff]'
              "
              @click="setLandingTab('join')"
            >
              <Users class="w-3.5 h-3.5" />
              <span>Join with Code</span>
            </button>
          </div>

          <!-- Main Interactive Card with Apple-grade Box Morphing -->
          <div
            class="box-morph overflow-hidden rounded-[20px] bg-[#121a2b] border border-[#25314a] shadow-2xl relative"
            :style="cardHeight ? { height: `${cardHeight}px` } : undefined"
          >
            <div ref="cardInnerRef" class="p-4 sm:p-6">
              <Transition :name="slideDirection" mode="out-in" @enter="handleTransitionEnter">
                <!-- 1. CREATE TAB -->
                <div v-if="landingTab === 'create'" key="create" class="space-y-4">
                  <div>
                    <label class="block text-xs font-bold text-[#eaf2ff] mb-1.5">
                      What are you deciding?
                    </label>
                    <input
                      v-model="newRoomTitle"
                      type="text"
                      placeholder="e.g. Friday Night Hotpot 🍲"
                      class="w-full bg-[#0b1220] border border-[#25314a] rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-base sm:text-sm text-[#eaf2ff] placeholder-[#8fa3c4]/50 focus:outline-none focus:ring-2 focus:ring-[#74b9ff]"
                      @keydown.enter="handleCreateLobby"
                    />
                  </div>

                  <!-- Quick Topic Chips -->
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <button
                      v-for="sug in ['Hotpot 🍲', 'BBQ 🍢', 'Movie 🍿', 'Trip 🚗', 'Boardgames 🎲']"
                      :key="sug"
                      type="button"
                      class="px-2.5 py-1 rounded-lg bg-[#0b1220] hover:bg-[#25314a] border border-[#25314a] text-[#8fa3c4] hover:text-[#d0ebff] text-xs transition-colors cursor-pointer active:scale-95"
                      @click="newRoomTitle = sug"
                    >
                      {{ sug }}
                    </button>
                  </div>

                  <button
                    type="button"
                    class="w-full py-3 rounded-xl bg-sky-gradient text-[#0b1220] font-bold text-sm shadow-md transition-all hover:opacity-95 active:scale-98 flex items-center justify-center gap-2 cursor-pointer mt-2"
                    @click="handleCreateLobby"
                  >
                    <span>Create Lobby & Drop Coins</span>
                    <ArrowRight class="w-4 h-4" />
                  </button>
                </div>

                <!-- 2. JOIN TAB -->
                <div v-else key="join" class="space-y-4">
                  <div>
                    <label class="block text-xs font-bold text-[#eaf2ff] mb-1.5">
                      Enter 4-Digit Room Code
                    </label>
                    <input
                      v-model="joinRoomCode"
                      type="text"
                      placeholder="e.g. 2785 or DROP-2785"
                      class="w-full bg-[#0b1220] border border-[#25314a] rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-base sm:text-sm text-[#eaf2ff] uppercase font-mono tracking-wider placeholder-[#8fa3c4]/50 focus:outline-none focus:ring-2 focus:ring-[#74b9ff]"
                      @keydown.enter="handleJoinLobby"
                    />
                    <p class="text-[11px] text-[#8fa3c4] mt-1.5">
                      Tip: Or just tap the invite link sent to you in Telegram.
                    </p>
                  </div>

                  <button
                    type="button"
                    :disabled="!joinRoomCode.trim()"
                    :class="[
                      'w-full py-3 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer',
                      joinRoomCode.trim()
                        ? 'bg-sky-gradient text-[#0b1220] hover:opacity-95 active:scale-98'
                        : 'bg-[#0b1220] text-[#8fa3c4]/40 border border-[#25314a] cursor-not-allowed',
                    ]"
                    @click="handleJoinLobby"
                  >
                    <span>Join Lobby</span>
                    <ArrowRight class="w-4 h-4" />
                  </button>
                </div>
              </Transition>
            </div>
          </div>

          <!-- Recent Lobbies (if any) -->
          <div v-if="recentRooms.length > 0" class="mt-6 text-center">
            <span
              class="text-[11px] font-bold uppercase tracking-wider text-[#8fa3c4]/70 block mb-2"
            >
              Recent Rooms
            </span>
            <div class="flex items-center justify-center gap-2 flex-wrap">
              <button
                v-for="r in recentRooms.slice(0, 4)"
                :key="r.id"
                type="button"
                class="px-3 py-1.5 rounded-full bg-[#121a2b] hover:bg-[#25314a] border border-[#25314a] text-xs text-[#d0ebff] flex items-center gap-1.5 cursor-pointer transition-colors"
                @click="handleRecentLobbyClick(r.id)"
              >
                <span class="font-medium truncate max-w-[120px]">{{ r.title }}</span>
                <span class="font-mono text-[10px] text-[#74b9ff]">#{{ r.id }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- How It Works (3-Step Micro Guide for Real Product Experience) -->
        <div
          class="w-full max-w-2xl mx-auto mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-[#25314a]/60"
        >
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3.5">
            <div
              class="p-3 sm:p-3.5 rounded-2xl bg-[#121a2b]/70 border border-[#25314a] text-left flex items-start gap-2.5 group hover:border-[#74b9ff]/40 transition-colors"
            >
              <div
                class="w-7 h-7 rounded-xl bg-sky-gradient text-[#0b1220] flex items-center justify-center font-black text-xs shrink-0 shadow-sm"
              >
                1
              </div>
              <div class="min-w-0">
                <h4 class="text-xs font-bold text-[#eaf2ff] truncate">Invite in 1-Click</h4>
                <p class="text-[11px] text-[#8fa3c4] mt-0.5 leading-relaxed">
                  Share the 4-digit code or direct Telegram link with friends.
                </p>
              </div>
            </div>

            <div
              class="p-3 sm:p-3.5 rounded-2xl bg-[#121a2b]/70 border border-[#25314a] text-left flex items-start gap-2.5 group hover:border-[#74b9ff]/40 transition-colors"
            >
              <div
                class="w-7 h-7 rounded-xl bg-sky-gradient text-[#0b1220] flex items-center justify-center font-black text-xs shrink-0 shadow-sm"
              >
                2
              </div>
              <div class="min-w-0">
                <h4 class="text-xs font-bold text-[#eaf2ff] truncate">Pitch Card Ideas</h4>
                <p class="text-[11px] text-[#8fa3c4] mt-0.5 leading-relaxed">
                  Everyone adds food spots, movies, or activities to the board.
                </p>
              </div>
            </div>

            <div
              class="p-3 sm:p-3.5 rounded-2xl bg-[#121a2b]/70 border border-[#25314a] text-left flex items-start gap-2.5 group hover:border-[#74b9ff]/40 transition-colors"
            >
              <div
                class="w-7 h-7 rounded-xl bg-sky-gradient text-[#0b1220] flex items-center justify-center font-black text-xs shrink-0 shadow-sm"
              >
                3
              </div>
              <div class="min-w-0">
                <h4 class="text-xs font-bold text-[#eaf2ff] truncate">Drop Coins & Decide</h4>
                <p class="text-[11px] text-[#8fa3c4] mt-0.5 leading-relaxed">
                  Vote in real-time with gold and red coins. Watch the winner emerge!
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- Real Product Clean Footer -->
      <footer
        class="w-full border-t border-[#25314a]/60 py-5 sm:py-6 px-4 mt-auto relative z-10 text-center"
      >
        <div
          class="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-[#8fa3c4]"
        >
          <div class="flex items-center gap-2">
            <span class="text-sm">🪙</span>
            <span class="font-bold text-[#eaf2ff]">CoinDrop</span>
            <span class="text-[#25314a]">•</span>
            <span>Zero-signup multiplayer decision lounge</span>
          </div>
          <div class="flex items-center gap-3 text-[11px]">
            <span class="flex items-center gap-1 text-[#3fb950]">
              <span class="w-1.5 h-1.5 rounded-full bg-[#3fb950] animate-pulse" />
              <span>Realtime</span>
            </span>
            <span class="text-[#25314a]">•</span>
            <span>Ephemeral • Auto-clears on close</span>
          </div>
        </div>
      </footer>
    </template>

    <!-- Modals with Clean Spring Transitions -->
    <!-- 1. Persona Customizer Modal -->
    <Transition name="modal">
      <IdentityModal
        v-if="showIdentityModal"
        :is-mandatory="isIdentityMandatory"
        :title="identityModalTitle"
        :description="identityModalDescription"
        @save="handleIdentitySaved"
        @close="showIdentityModal = false"
      />
    </Transition>

    <!-- 2. Propose or Edit Card Idea Modal -->
    <Transition name="modal">
      <CreateIdeaModal
        v-if="showIdeaModal"
        :existing-idea="editingIdea"
        :is-host="isHost"
        @submit="handleSaveIdea"
        @delete="handleDeleteIdea"
        @close="showIdeaModal = false"
      />
    </Transition>
  </div>
</template>
