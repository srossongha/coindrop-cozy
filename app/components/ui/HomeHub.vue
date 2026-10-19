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
          class="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/80 backdrop-blur-md shadow-lg mb-4"
        >
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span class="text-xs font-mono font-medium text-slate-300">
            Interactive 3D Decision Engine
          </span>
        </div>

        <h1 class="text-4xl sm:text-6xl font-black tracking-tight text-white drop-shadow-xl">
          Drop. Decide.
          <span
            class="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent"
            >Play.</span
          >
        </h1>
        <p class="mt-3 text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Create an interactive 3D coin poll for group votes, or spin up a multiplayer drop lobby in
          seconds.
        </p>
      </div>

      <!-- The Two Main Choices -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        <!-- Card 1: Create a Poll -->
        <div
          class="group relative rounded-3xl p-6 sm:p-8 bg-slate-900/85 hover:bg-slate-900/95 border border-purple-500/30 hover:border-purple-500/70 shadow-2xl backdrop-blur-xl transition-all duration-300 flex flex-col justify-between cursor-pointer"
          @click="emit('open-poll-modal')"
        >
          <!-- Subtle corner gradient glow -->
          <div
            class="absolute -top-12 -right-12 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl group-hover:bg-purple-500/30 transition-all pointer-events-none"
          />

          <div>
            <div class="flex items-center justify-between mb-5">
              <div
                class="w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center text-2xl font-black shadow-inner"
              >
                📊
              </div>
              <span
                class="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20"
              >
                Decision Poll
              </span>
            </div>

            <h2
              class="text-2xl font-black text-white group-hover:text-purple-200 transition-colors"
            >
              Create a Poll
            </h2>
            <p class="text-slate-400 text-sm mt-2 leading-relaxed">
              Pose any question, add colored voting slots, and let participants drop physical 3D
              coins to vote in real-time.
            </p>

            <ul class="mt-5 space-y-2 text-xs text-slate-300 font-medium">
              <li class="flex items-center space-x-2">
                <span class="text-purple-400 font-bold">✓</span>
                <span>Real-time 3D coin drop physics</span>
              </li>
              <li class="flex items-center space-x-2">
                <span class="text-purple-400 font-bold">✓</span>
                <span>Custom options & weighted coins</span>
              </li>
              <li class="flex items-center space-x-2">
                <span class="text-purple-400 font-bold">✓</span>
                <span>Instant shareable room link</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            class="mt-8 w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-purple-500/25 flex items-center justify-center space-x-2 transition-all group-hover:shadow-purple-500/40 cursor-pointer"
          >
            <span>Create a Poll</span>
            <span class="text-lg">→</span>
          </button>
        </div>

        <!-- Card 2: Create a Lobby -->
        <div
          class="group relative rounded-3xl p-6 sm:p-8 bg-slate-900/85 hover:bg-slate-900/95 border border-amber-500/30 hover:border-amber-500/70 shadow-2xl backdrop-blur-xl transition-all duration-300 flex flex-col justify-between cursor-pointer"
          @click="emit('open-lobby-modal')"
        >
          <!-- Subtle corner gradient glow -->
          <div
            class="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl group-hover:bg-amber-500/30 transition-all pointer-events-none"
          />

          <div>
            <div class="flex items-center justify-between mb-5">
              <div
                class="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center text-2xl font-black shadow-inner"
              >
                🎮
              </div>
              <span
                class="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20"
              >
                Multiplayer Room
              </span>
            </div>

            <h2 class="text-2xl font-black text-white group-hover:text-amber-200 transition-colors">
              Create a Lobby
            </h2>
            <p class="text-slate-400 text-sm mt-2 leading-relaxed">
              Launch a live multiplayer room with target rings, high-score leaderboards, and custom
              room codes.
            </p>

            <ul class="mt-5 space-y-2 text-xs text-slate-300 font-medium">
              <li class="flex items-center space-x-2">
                <span class="text-amber-400 font-bold">✓</span>
                <span>Target bullseye & scoring zones</span>
              </li>
              <li class="flex items-center space-x-2">
                <span class="text-amber-400 font-bold">✓</span>
                <span>Host controls & up to 32 players</span>
              </li>
              <li class="flex items-center space-x-2">
                <span class="text-amber-400 font-bold">✓</span>
                <span>Public or private with room code</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            class="mt-8 w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/25 flex items-center justify-center space-x-2 transition-all group-hover:shadow-amber-500/40 cursor-pointer"
          >
            <span>Create a Lobby</span>
            <span class="text-lg">→</span>
          </button>
        </div>
      </div>

      <!-- Join with Code Bar -->
      <div
        class="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md"
      >
        <div class="text-center sm:text-left">
          <p class="text-xs font-bold text-slate-300">Have an existing room code?</p>
          <p class="text-[11px] text-slate-500">Enter code to join a live poll or lobby directly</p>
        </div>

        <form class="flex items-center space-x-2 w-full sm:w-auto" @submit.prevent="handleJoin">
          <input
            v-model="joinCode"
            type="text"
            placeholder="e.g. POLL-A7F2"
            class="px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-white placeholder-slate-500 text-xs font-mono uppercase focus:outline-none focus:border-amber-400 w-full sm:w-44 transition-all"
          />
          <button
            type="submit"
            class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs font-bold transition-all shrink-0 cursor-pointer"
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
        class="text-xs text-slate-400 hover:text-white font-mono flex items-center space-x-1.5 transition-colors cursor-pointer backdrop-blur-sm bg-slate-950/40 px-4 py-2 rounded-full border border-slate-800/60 hover:border-slate-700"
        @click="emit('open-sandbox')"
      >
        <span>Looking for Free Sandbox Mode?</span>
        <span class="text-amber-400 font-bold">Try 3D Demo Arena →</span>
      </button>
    </div>
  </div>
</template>
