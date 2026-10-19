<script setup lang="ts">
const emit = defineEmits<{
  close: []
  created: []
}>()

const { createLobby } = useRoom()

const name = ref('')
const mode = ref<'target-drop' | 'poll' | 'free-play'>('target-drop')
const maxPlayers = ref(8)
const isPrivate = ref(false)
const errorMessage = ref('')

const gameModes = [
  {
    id: 'target-drop' as const,
    title: 'Target Drop',
    desc: 'Aim for inner rings & bullseye for high score',
    icon: '🎯',
  },
  {
    id: 'poll' as const,
    title: 'Coin Voting',
    desc: 'Drop coins into colored voting zones',
    icon: '📊',
  },
  {
    id: 'free-play' as const,
    title: 'Free Sandbox',
    desc: 'Casual drop with friends & custom physics',
    icon: '🪙',
  },
]

function handleSubmit() {
  if (!name.value.trim()) {
    errorMessage.value = 'Please enter a lobby name'
    return
  }

  createLobby({
    name: name.value,
    mode: mode.value,
    maxPlayers: maxPlayers.value,
    isPrivate: isPrivate.value,
  })

  emit('created')
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
  >
    <div
      class="w-full max-w-lg bg-slate-900 border border-slate-700/70 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
    >
      <!-- Glow ambient background -->
      <div
        class="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"
      />
      <div
        class="absolute -bottom-24 -left-24 w-48 h-48 bg-yellow-500/20 rounded-full blur-3xl pointer-events-none"
      />

      <div class="flex items-center justify-between mb-6 relative">
        <div class="flex items-center space-x-3">
          <div
            class="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl font-bold border border-amber-500/30"
          >
            🎮
          </div>
          <div>
            <h3 class="text-xl font-black text-white">Create a Lobby</h3>
            <p class="text-xs text-slate-400">Host an interactive multiplayer drop room</p>
          </div>
        </div>

        <button
          type="button"
          class="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          @click="emit('close')"
        >
          ✕
        </button>
      </div>

      <form class="space-y-5 relative" @submit.prevent="handleSubmit">
        <!-- Lobby Name -->
        <div>
          <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Lobby Name
          </label>
          <input
            v-model="name"
            type="text"
            placeholder="e.g. Friday Coin Championship"
            class="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
            autofocus
          />
        </div>

        <!-- Mode Selection -->
        <div>
          <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Game Mode
          </label>
          <div class="grid grid-cols-3 gap-2.5">
            <button
              v-for="m in gameModes"
              :key="m.id"
              type="button"
              :class="[
                'p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer',
                mode === m.id
                  ? 'bg-amber-500/15 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                  : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300',
              ]"
              @click="mode = m.id"
            >
              <div class="text-xl mb-1">{{ m.icon }}</div>
              <p class="text-xs font-bold">{{ m.title }}</p>
              <p class="text-[10px] text-slate-500 leading-tight mt-0.5">{{ m.desc }}</p>
            </button>
          </div>
        </div>

        <!-- Max Players & Privacy -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label
              class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
            >
              Capacity: <span class="text-amber-400 font-bold">{{ maxPlayers }} Players</span>
            </label>
            <div class="flex items-center space-x-1.5">
              <button
                v-for="cap in [4, 8, 16, 32]"
                :key="cap"
                type="button"
                :class="[
                  'flex-1 py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer',
                  maxPlayers === cap
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                    : 'bg-slate-950/40 text-slate-500 border-slate-800 hover:border-slate-700',
                ]"
                @click="maxPlayers = cap"
              >
                {{ cap }}
              </button>
            </div>
          </div>

          <div>
            <label
              class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
            >
              Access
            </label>
            <button
              type="button"
              class="w-full py-2.5 px-3 rounded-xl bg-slate-950/60 border border-slate-700 text-xs font-medium text-slate-300 flex items-center justify-between cursor-pointer hover:border-slate-600 transition-colors"
              @click="isPrivate = !isPrivate"
            >
              <span>{{ isPrivate ? '🔒 Private (Code)' : '🌐 Public' }}</span>
              <span
                :class="['w-2 h-2 rounded-full', isPrivate ? 'bg-amber-400' : 'bg-emerald-400']"
              />
            </button>
          </div>
        </div>

        <p v-if="errorMessage" class="text-xs text-rose-400">
          {{ errorMessage }}
        </p>

        <!-- Actions -->
        <div class="flex items-center space-x-3 pt-2">
          <button
            type="button"
            class="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm transition-colors cursor-pointer"
            @click="emit('close')"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
          >
            Launch Lobby
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
