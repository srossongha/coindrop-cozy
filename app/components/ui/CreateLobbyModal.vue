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
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1220]/80 backdrop-blur-md"
  >
    <div
      class="w-full max-w-lg bg-[#121a2b] border border-[#25314a] rounded-[16px] p-6 shadow-2xl relative"
    >
      <div class="flex items-center justify-between mb-6 relative">
        <div class="flex items-center space-x-3">
          <div
            class="w-10 h-10 rounded-xl bg-[#0b1220] text-[#d0ebff] flex items-center justify-center text-xl font-bold border border-[#25314a]"
          >
            🎮
          </div>
          <div>
            <h3 class="text-xl font-black text-[#eaf2ff]">Create a Lobby</h3>
            <p class="text-xs text-[#8fa3c4]">Host an interactive multiplayer drop room</p>
          </div>
        </div>

        <button
          type="button"
          class="w-8 h-8 rounded-full bg-[#0b1220] text-[#8fa3c4] hover:text-[#eaf2ff] border border-[#25314a] flex items-center justify-center transition-colors cursor-pointer"
          @click="emit('close')"
        >
          ✕
        </button>
      </div>

      <form class="space-y-5 relative" @submit.prevent="handleSubmit">
        <!-- Lobby Name -->
        <div>
          <label class="block text-xs font-semibold text-[#8fa3c4] uppercase tracking-wider mb-1.5">
            Lobby Name
          </label>
          <input
            v-model="name"
            type="text"
            placeholder="e.g. Friday Coin Championship"
            class="w-full px-4 py-3 rounded-xl bg-[#0b1220] border border-[#25314a] text-[#eaf2ff] placeholder-[#8fa3c4]/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#74b9ff] focus:border-transparent transition-all"
            autofocus
          />
        </div>

        <!-- Mode Selection -->
        <div>
          <label class="block text-xs font-semibold text-[#8fa3c4] uppercase tracking-wider mb-1.5">
            Game Mode
          </label>
          <div class="grid grid-cols-3 gap-2.5">
            <button
              v-for="m in gameModes"
              :key="m.id"
              type="button"
              :class="[
                'p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer',
                mode === m.id
                  ? 'bg-[#0b1220] border-2 border-[#74b9ff] text-[#eaf2ff] shadow-sm'
                  : 'bg-[#0b1220] border border-[#25314a] text-[#8fa3c4] hover:border-[#8fa3c4]/50 hover:text-[#eaf2ff]',
              ]"
              @click="mode = m.id"
            >
              <div class="text-xl mb-1">{{ m.icon }}</div>
              <p class="text-xs font-bold text-[#eaf2ff]">{{ m.title }}</p>
              <p class="text-[10px] text-[#8fa3c4] leading-tight mt-0.5">{{ m.desc }}</p>
            </button>
          </div>
        </div>

        <!-- Max Players & Privacy -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label
              class="block text-xs font-semibold text-[#8fa3c4] uppercase tracking-wider mb-1.5"
            >
              Capacity: <span class="text-[#d0ebff] font-bold">{{ maxPlayers }} Players</span>
            </label>
            <div class="flex items-center space-x-1.5">
              <button
                v-for="cap in [4, 8, 16, 32]"
                :key="cap"
                type="button"
                :class="[
                  'flex-1 py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer',
                  maxPlayers === cap
                    ? 'bg-[#0b1220] text-[#d0ebff] border-2 border-[#74b9ff]'
                    : 'bg-[#0b1220] text-[#8fa3c4] border border-[#25314a] hover:border-[#8fa3c4]/50',
                ]"
                @click="maxPlayers = cap"
              >
                {{ cap }}
              </button>
            </div>
          </div>

          <div>
            <label
              class="block text-xs font-semibold text-[#8fa3c4] uppercase tracking-wider mb-1.5"
            >
              Access
            </label>
            <button
              type="button"
              class="w-full py-2.5 px-3 rounded-xl bg-[#0b1220] border border-[#25314a] text-xs font-medium text-[#eaf2ff] flex items-center justify-between cursor-pointer hover:border-[#8fa3c4]/50 transition-colors"
              @click="isPrivate = !isPrivate"
            >
              <span>{{ isPrivate ? '🔒 Private (Code)' : '🌐 Public' }}</span>
              <span
                :class="['w-2 h-2 rounded-full', isPrivate ? 'bg-[#8fa3c4]' : 'bg-[#3fb950]']"
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
            class="flex-1 py-3 rounded-xl bg-[#0b1220] hover:bg-[#25314a]/50 text-[#8fa3c4] hover:text-[#eaf2ff] border border-[#25314a] font-medium text-sm transition-colors cursor-pointer"
            @click="emit('close')"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="flex-1 py-3 rounded-xl bg-sky-gradient text-[#0b1220] font-bold text-sm shadow-md transition-all hover:opacity-95 active:scale-98 cursor-pointer"
          >
            Launch Lobby
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
