<script setup lang="ts">
const emit = defineEmits<{
  close: []
  created: []
}>()

const { createPoll } = useRoom()

const title = ref('')
const options = ref<string[]>(['Option A', 'Option B'])
const coinsPerUser = ref(3)
const errorMessage = ref('')

function addOption() {
  if (options.value.length < 6) {
    options.value.push(`Option ${String.fromCharCode(65 + options.value.length)}`)
  }
}

function removeOption(index: number) {
  if (options.value.length > 2) {
    options.value.splice(index, 1)
  }
}

function handleSubmit() {
  if (!title.value.trim()) {
    errorMessage.value = 'Please enter a poll question'
    return
  }
  const validOptions = options.value.map(o => o.trim()).filter(Boolean)
  if (validOptions.length < 2) {
    errorMessage.value = 'Please provide at least 2 options'
    return
  }

  createPoll({
    title: title.value,
    options: validOptions,
    coinsPerUser: coinsPerUser.value,
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
        class="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"
      />
      <div
        class="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"
      />

      <div class="flex items-center justify-between mb-6 relative">
        <div class="flex items-center space-x-3">
          <div
            class="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-xl font-bold border border-purple-500/30"
          >
            📊
          </div>
          <div>
            <h3 class="text-xl font-black text-white">Create a 3D Poll</h3>
            <p class="text-xs text-slate-400">Participants drop coins to cast live votes</p>
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
        <!-- Question Field -->
        <div>
          <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Poll Question / Topic
          </label>
          <input
            v-model="title"
            type="text"
            placeholder="e.g. Which project should we tackle next?"
            class="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
            autofocus
          />
        </div>

        <!-- Options Fields -->
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Voting Buckets ({{ options.length }}/6)
            </label>
            <button
              v-if="options.length < 6"
              type="button"
              class="text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors cursor-pointer flex items-center space-x-1"
              @click="addOption"
            >
              <span>+ Add Option</span>
            </button>
          </div>

          <div class="space-y-2">
            <div v-for="(_, idx) in options" :key="idx" class="flex items-center space-x-2">
              <div
                class="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-mono font-bold text-slate-400 shrink-0"
              >
                {{ String.fromCharCode(65 + idx) }}
              </div>
              <input
                v-model="options[idx]"
                type="text"
                :placeholder="`Option ${String.fromCharCode(65 + idx)}`"
                class="flex-1 px-3 py-2 rounded-lg bg-slate-950/50 border border-slate-800 text-white text-sm focus:outline-none focus:border-purple-500 transition-all"
              />
              <button
                v-if="options.length > 2"
                type="button"
                class="w-8 h-8 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 flex items-center justify-center transition-colors cursor-pointer"
                @click="removeOption(idx)"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        <!-- Coins per user -->
        <div>
          <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Coins per Participant: <span class="text-purple-400 font-bold">{{ coinsPerUser }}</span>
          </label>
          <div class="flex items-center space-x-3">
            <button
              v-for="count in [1, 3, 5, 10]"
              :key="count"
              type="button"
              :class="[
                'flex-1 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer border',
                coinsPerUser === count
                  ? 'bg-purple-600/30 text-purple-300 border-purple-500 shadow-md shadow-purple-500/20'
                  : 'bg-slate-950/40 text-slate-400 border-slate-800 hover:border-slate-700',
              ]"
              @click="coinsPerUser = count"
            >
              {{ count }} {{ count === 1 ? 'Coin' : 'Coins' }}
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
            class="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-purple-500/25 transition-all cursor-pointer"
          >
            Launch Poll
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
