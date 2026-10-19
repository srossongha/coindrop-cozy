<script setup lang="ts">
const emit = defineEmits<{
  'open-poll-modal': []
  'open-lobby-modal': []
  'open-sandbox': []
}>()

const joinCode = ref('')
const joinError = ref('')

function handleJoin() {
  const code = joinCode.value.trim().toUpperCase()
  if (!code) {
    joinError.value = 'Please enter a 6-character room code'
    return
  }
  joinError.value = `Room "${code}" not found. Create a new poll or lobby to begin!`
}
</script>

<template>
  <div class="fixed inset-0 pointer-events-none z-10 flex flex-col justify-between p-6 sm:p-10">
    <!-- Top Spacer for Header -->
    <div class="h-16" />

    <!-- Center Hero Section -->
    <div class="max-w-4xl mx-auto w-full my-auto pointer-events-auto">
      <!-- Title & Headline -->
      <div class="text-center mb-8 sm:mb-10">
        <div
          class="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#121a2b] border border-[#25314a] shadow-sm mb-4"
        >
          <span class="w-2 h-2 rounded-full bg-[#3fb950]" />
          <span class="text-xs font-mono font-medium text-[#8fa3c4]">
            Multiplayer 3D Decision Engine
          </span>
        </div>

        <h1 class="text-4xl sm:text-5xl font-black tracking-tight text-[#eaf2ff]">
          Drop. Decide. <span class="text-[#d0ebff]">Play.</span>
        </h1>
        <p class="mt-3 text-[#8fa3c4] text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Create an interactive 3D coin poll for group decisions, or spin up a multiplayer drop
          lobby in seconds.
        </p>
      </div>

      <!-- The Two Main Choices -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        <!-- Card 1: Create a Poll -->
        <div
          class="group relative rounded-[16px] p-6 sm:p-7 bg-[#121a2b] border border-[#25314a] hover:border-[#d0ebff]/40 hover:shadow-sky-glow hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between cursor-pointer"
          @click="emit('open-poll-modal')"
        >
          <div>
            <div class="flex items-center justify-between mb-5">
              <div
                class="w-12 h-12 rounded-xl bg-[#0b1220] border border-[#25314a] flex items-center justify-center text-xl text-[#d0ebff]"
              >
                📊
              </div>
              <span
                class="px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-[#0b1220] text-[#d0ebff] border border-[#25314a]"
              >
                Decision Poll
              </span>
            </div>

            <h2 class="text-xl font-bold text-[#eaf2ff]">Create a Poll</h2>
            <p class="text-[#8fa3c4] text-sm mt-2 leading-relaxed">
              Pose any question, add voting options, and let participants drop physical 3D coins to
              vote in real-time.
            </p>

            <ul class="mt-5 space-y-2 text-xs text-[#8fa3c4]">
              <li class="flex items-center space-x-2">
                <span class="text-[#d0ebff] font-bold">✓</span>
                <span class="text-[#eaf2ff]">Real-time 3D coin drop physics</span>
              </li>
              <li class="flex items-center space-x-2">
                <span class="text-[#d0ebff] font-bold">✓</span>
                <span class="text-[#eaf2ff]">Custom options & weighted coins</span>
              </li>
              <li class="flex items-center space-x-2">
                <span class="text-[#d0ebff] font-bold">✓</span>
                <span class="text-[#eaf2ff]">Instant shareable room link</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            class="mt-7 w-full py-3.5 px-5 rounded-xl bg-sky-gradient text-[#0b1220] font-bold text-sm flex items-center justify-center space-x-2 transition-all hover:opacity-95 active:scale-98 shadow-sm cursor-pointer"
          >
            <span>Create a Poll</span>
            <span class="text-base">→</span>
          </button>
        </div>

        <!-- Card 2: Create a Lobby -->
        <div
          class="group relative rounded-[16px] p-6 sm:p-7 bg-[#121a2b] border border-[#25314a] hover:border-[#d0ebff]/40 hover:shadow-sky-glow hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between cursor-pointer"
          @click="emit('open-lobby-modal')"
        >
          <div>
            <div class="flex items-center justify-between mb-5">
              <div
                class="w-12 h-12 rounded-xl bg-[#0b1220] border border-[#25314a] flex items-center justify-center text-xl text-[#d0ebff]"
              >
                🎮
              </div>
              <span
                class="px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-[#0b1220] text-[#d0ebff] border border-[#25314a]"
              >
                Multiplayer Room
              </span>
            </div>

            <h2 class="text-xl font-bold text-[#eaf2ff]">Create a Lobby</h2>
            <p class="text-[#8fa3c4] text-sm mt-2 leading-relaxed">
              Launch a live multiplayer room with target rings, high-score leaderboards, and custom
              room codes.
            </p>

            <ul class="mt-5 space-y-2 text-xs text-[#8fa3c4]">
              <li class="flex items-center space-x-2">
                <span class="text-[#d0ebff] font-bold">✓</span>
                <span class="text-[#eaf2ff]">Target bullseye & scoring zones</span>
              </li>
              <li class="flex items-center space-x-2">
                <span class="text-[#d0ebff] font-bold">✓</span>
                <span class="text-[#eaf2ff]">Host controls & up to 32 players</span>
              </li>
              <li class="flex items-center space-x-2">
                <span class="text-[#d0ebff] font-bold">✓</span>
                <span class="text-[#eaf2ff]">Public or private with room code</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            class="mt-7 w-full py-3.5 px-5 rounded-xl bg-sky-gradient text-[#0b1220] font-bold text-sm flex items-center justify-center space-x-2 transition-all hover:opacity-95 active:scale-98 shadow-sm cursor-pointer"
          >
            <span>Create a Lobby</span>
            <span class="text-base">→</span>
          </button>
        </div>
      </div>

      <!-- Join with Code Bar -->
      <div
        class="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-[16px] bg-[#121a2b] border border-[#25314a]"
      >
        <div class="text-center sm:text-left">
          <p class="text-xs font-bold text-[#eaf2ff]">Have an existing room code?</p>
          <p class="text-[11px] text-[#8fa3c4]">Enter code to join a live poll or lobby directly</p>
        </div>

        <form class="flex items-center space-x-2 w-full sm:w-auto" @submit.prevent="handleJoin">
          <input
            v-model="joinCode"
            type="text"
            placeholder="e.g. POLL-A7F2"
            class="px-3 py-2 rounded-xl bg-[#0b1220] border border-[#25314a] text-[#eaf2ff] placeholder-[#8fa3c4]/50 text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#74b9ff] focus:border-transparent w-full sm:w-44 transition-all"
          />
          <button
            type="submit"
            class="px-4 py-2 rounded-xl bg-[#25314a]/80 hover:bg-[#25314a] text-[#eaf2ff] text-xs font-bold transition-all shrink-0 cursor-pointer"
          >
            Join
          </button>
        </form>
      </div>

      <p v-if="joinError" class="text-center text-xs text-rose-400 mt-2 font-mono">
        {{ joinError }}
      </p>
    </div>

    <!-- Bottom Sandbox Shortcut -->
    <div class="flex justify-center pointer-events-auto">
      <button
        type="button"
        class="text-xs text-[#8fa3c4] hover:text-[#eaf2ff] font-mono flex items-center space-x-1.5 transition-colors cursor-pointer bg-[#121a2b] px-4 py-2 rounded-full border border-[#25314a] hover:border-[#d0ebff]/40 hover:shadow-sky-glow"
        @click="emit('open-sandbox')"
      >
        <span>Looking for Free Sandbox Mode?</span>
        <span class="text-[#d0ebff] font-bold">Try 3D Arena →</span>
      </button>
    </div>
  </div>
</template>
