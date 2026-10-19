<script setup lang="ts">
import { Sparkles } from 'lucide-vue-next'
import CoinExperience from '~/components/three/CoinExperience.client.vue'
import HeaderNav from '~/components/ui/HeaderNav.vue'
import RoomHeroBanner from '~/components/ui/RoomHeroBanner.vue'
import CoinBoard from '~/components/ui/CoinBoard.vue'
import TieBreakerWheel from '~/components/ui/TieBreakerWheel.vue'
import FairSplitCalculator from '~/components/ui/FairSplitCalculator.vue'
import CoinPouchBar from '~/components/ui/CoinPouchBar.vue'
import FloatingReactions from '~/components/ui/FloatingReactions.vue'
import EditProfileModal from '~/components/ui/EditProfileModal.vue'
import NewRoomModal from '~/components/ui/NewRoomModal.vue'
import AddOptionModal from '~/components/ui/AddOptionModal.vue'
import QrPaymentModal from '~/components/ui/QrPaymentModal.vue'
import MicroInteractionVault from '~/components/ui/MicroInteractionVault.vue'
import type { DebtTransfer } from '~/types'

useHead({
  title: 'CoinDrop — Cozy Decision & Fair Split Game for Friend Groups',
  meta: [
    {
      name: 'description',
      content:
        'Zero-account multiplayer decision board, tie-breaker wheel, and expense splitting with interactive 3D coin drop physics.',
    },
  ],
})

const {
  userProfile,
  rooms,
  activeRoomId,
  activeTab,
  sortBy,
  simulateFriends,
  liveFeed,
  floatingReactions,
  toastMessage,
  shakePouch,
  settledDebtKeys,
  currentRoom,
  myCoinsRemaining,
  participants,
  enrichedOptions,
  handleVote,
  handleAddOption,
  handleCreateNewRoom,
  handleResetRoomVotes,
  handleLockWinner,
  handleAddExpense,
  saveProfile,
  toggleSettledDebt,
  showToast,
  triggerReaction,
  startSimulation,
  stopSimulation,
} = useCoinDropRoom()

// Modal states
const isEditingProfile = ref(false)
const isNewRoomOpen = ref(false)
const isAddOptionOpen = ref(false)
const isVaultOpen = ref(false)
const qrModalTransfer = ref<DebtTransfer | null>(null)
const show3DScene = ref(true)

onMounted(() => {
  startSimulation()
})

onUnmounted(() => {
  stopSimulation()
})

function copyInviteLink() {
  const url = `${window.location.origin}/#${currentRoom.value.id}`
  navigator.clipboard.writeText(url)
  showToast(`Copied room invite link: #${currentRoom.value.id}`)
}

function handleToggleSimulation() {
  simulateFriends.value = !simulateFriends.value
  showToast(
    simulateFriends.value
      ? 'Live Simulated Friends enabled! Watch coins move in real time.'
      : 'Live Simulation paused.',
  )
}
</script>

<template>
  <div
    class="min-h-screen bg-canvas-glow text-[#eaf2ff] flex flex-col font-sans selection:bg-[#74b9ff]/30 selection:text-[#d0ebff] pb-28 relative"
  >
    <!-- Background 3D Tres.js Scene Canvas -->
    <div
      v-if="show3DScene"
      class="fixed inset-0 pointer-events-none z-0 opacity-35 transition-opacity duration-500 overflow-hidden"
    >
      <ClientOnly>
        <CoinExperience />
      </ClientOnly>
    </div>

    <!-- Floating Reactions Animation -->
    <FloatingReactions :reactions="floatingReactions" />

    <!-- Animated Toast Notification -->
    <div
      v-if="toastMessage"
      class="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#121a2b] border border-[#74b9ff]/50 text-[#d0ebff] px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2.5 text-sm font-medium animate-in fade-in"
    >
      <Sparkles class="w-4 h-4 text-[#74b9ff] shrink-0" />
      <span>{{ toastMessage }}</span>
    </div>

    <!-- Top Header Navigation -->
    <HeaderNav
      :rooms="rooms"
      :active-room-id="activeRoomId"
      :user-profile="userProfile"
      :participants="participants"
      :simulate-friends="simulateFriends"
      @select-room="id => (activeRoomId = id)"
      @toggle-simulation="handleToggleSimulation"
      @open-profile="isEditingProfile = true"
      @open-vault="isVaultOpen = true"
      @open-new-room="isNewRoomOpen = true"
    />

    <!-- Room Hero Banner with Ephemeral Timer & Mode Tabs -->
    <RoomHeroBanner
      :room="currentRoom"
      :active-tab="activeTab"
      :live-feed="liveFeed"
      @select-tab="tab => (activeTab = tab)"
      @trigger-reaction="emo => triggerReaction(emo, `${userProfile.name} ${userProfile.emoji}`)"
      @copy-link="copyInviteLink"
    />

    <!-- Main Content Area -->
    <main class="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex-1 relative z-10">
      <!-- 1. Coin Board -->
      <CoinBoard
        v-if="activeTab === 'board'"
        :options="enrichedOptions"
        :user-profile="userProfile"
        :participants="participants"
        :locked-winner-id="currentRoom.lockedWinnerId"
        :my-coins-remaining="myCoinsRemaining"
        :sort-by="sortBy"
        @vote="(id, delta) => handleVote(id, delta)"
        @open-add-modal="isAddOptionOpen = true"
        @reset-votes="handleResetRoomVotes"
        @set-sort-by="sort => (sortBy = sort)"
      />

      <!-- 2. Tie-Breaker Wheel -->
      <TieBreakerWheel
        v-else-if="activeTab === 'wheel'"
        :options="enrichedOptions"
        :locked-winner-id="currentRoom.lockedWinnerId"
        @lock-winner="id => handleLockWinner(id)"
      />

      <!-- 3. Fair Split & QR Settler -->
      <FairSplitCalculator
        v-else-if="activeTab === 'split'"
        :room="currentRoom"
        :participants="participants"
        :settled-keys="settledDebtKeys"
        @add-expense="handleAddExpense"
        @open-qr="transfer => (qrModalTransfer = transfer)"
        @toggle-settled="key => toggleSettledDebt(key)"
      />
    </main>

    <!-- Sticky Bottom User Coin Pouch Bar -->
    <CoinPouchBar
      :user-profile="userProfile"
      :my-coins-remaining="myCoinsRemaining"
      :shake-pouch="shakePouch"
    />

    <!-- Modals & Drawers -->
    <EditProfileModal
      v-if="isEditingProfile"
      :name="userProfile.name"
      :emoji="userProfile.emoji"
      @save="(name, emoji) => saveProfile(name, emoji)"
      @close="isEditingProfile = false"
    />

    <NewRoomModal
      v-if="isNewRoomOpen"
      @create="title => handleCreateNewRoom(title)"
      @close="isNewRoomOpen = false"
    />

    <AddOptionModal
      v-if="isAddOptionOpen"
      @add="data => handleAddOption(data)"
      @close="isAddOptionOpen = false"
    />

    <QrPaymentModal
      v-if="qrModalTransfer"
      :transfer="qrModalTransfer"
      @mark-paid="
        key => {
          toggleSettledDebt(key)
          showToast('Marked transfer as paid! ✓')
        }
      "
      @close="qrModalTransfer = null"
    />

    <MicroInteractionVault v-if="isVaultOpen" @close="isVaultOpen = false" />
  </div>
</template>
