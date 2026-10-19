<script setup lang="ts">
import CoinExperience from '~/components/three/CoinExperience.client.vue'
import HomeHub from '~/components/ui/HomeHub.vue'
import CreatePollModal from '~/components/ui/CreatePollModal.vue'
import CreateLobbyModal from '~/components/ui/CreateLobbyModal.vue'
import ActivePollOverlay from '~/components/ui/ActivePollOverlay.vue'
import ActiveLobbyOverlay from '~/components/ui/ActiveLobbyOverlay.vue'
import GameOverlay from '~/components/ui/GameOverlay.vue'

useHead({
  title: 'CoinDrop 3D — Create a Poll or Lobby',
  meta: [
    {
      name: 'description',
      content:
        'Create real-time 3D coin drop polls or host multiplayer game lobbies with Nuxt 4 and Tres.js',
    },
  ],
})

const { currentMode, enterSandbox } = useRoom()

const showPollModal = ref(false)
const showLobbyModal = ref(false)
</script>

<template>
  <div class="w-full h-full relative">
    <!-- 3D Canvas Background -->
    <ClientOnly>
      <CoinExperience />
      <template #fallback>
        <div
          class="flex items-center justify-center h-full bg-slate-950 text-slate-400 font-mono text-sm"
        >
          Loading 3D Scene...
        </div>
      </template>
    </ClientOnly>

    <!-- First Seen: Home Hub for Creating Poll / Lobby -->
    <HomeHub
      v-if="currentMode === 'home'"
      @open-poll-modal="showPollModal = true"
      @open-lobby-modal="showLobbyModal = true"
      @open-sandbox="enterSandbox"
    />

    <!-- Active Poll Overlay -->
    <ActivePollOverlay v-else-if="currentMode === 'poll'" />

    <!-- Active Lobby Overlay -->
    <ActiveLobbyOverlay v-else-if="currentMode === 'lobby'" />

    <!-- Sandbox Mode Overlay -->
    <GameOverlay v-else-if="currentMode === 'sandbox'" />

    <!-- Creation Modals -->
    <CreatePollModal
      v-if="showPollModal"
      @close="showPollModal = false"
      @created="showPollModal = false"
    />

    <CreateLobbyModal
      v-if="showLobbyModal"
      @close="showLobbyModal = false"
      @created="showLobbyModal = false"
    />
  </div>
</template>
