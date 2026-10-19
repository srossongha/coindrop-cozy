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
            📊
          </div>
          <div>
            <h3 class="text-xl font-black text-[#eaf2ff]">Create a 3D Poll</h3>
            <p class="text-xs text-[#8fa3c4]">Participants drop coins to cast live votes</p>
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
        <!-- Question Field -->
        <div>
          <label class="block text-xs font-semibold text-[#8fa3c4] uppercase tracking-wider mb-1.5">
            Poll Question / Topic
          </label>
          <input
            v-model="title"
            type="text"
            placeholder="e.g. Which project should we tackle next?"
            class="w-full px-4 py-3 rounded-xl bg-[#0b1220] border border-[#25314a] text-[#eaf2ff] placeholder-[#8fa3c4]/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#74b9ff] focus:border-transparent transition-all"
            autofocus
          />
        </div>

        <!-- Options Fields -->
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label class="block text-xs font-semibold text-[#8fa3c4] uppercase tracking-wider">
              Voting Buckets ({{ options.length }}/6)
            </label>
            <button
              v-if="options.length < 6"
              type="button"
              class="text-xs font-medium text-[#d0ebff] hover:underline transition-colors cursor-pointer flex items-center space-x-1"
              @click="addOption"
            >
              <span>+ Add Option</span>
            </button>
          </div>

          <div class="space-y-2">
            <div v-for="(_, idx) in options" :key="idx" class="flex items-center space-x-2">
              <div
                class="w-6 h-6 rounded-lg bg-[#25314a] flex items-center justify-center text-xs font-mono font-bold text-[#8fa3c4] shrink-0"
              >
                {{ String.fromCharCode(65 + idx) }}
              </div>
              <input
                v-model="options[idx]"
                type="text"
                :placeholder="`Option ${String.fromCharCode(65 + idx)}`"
                class="flex-1 px-3 py-2 rounded-lg bg-[#0b1220] border border-[#25314a] text-[#eaf2ff] text-sm focus:outline-none focus:ring-1 focus:ring-[#74b9ff] transition-all"
              />
              <button
                v-if="options.length > 2"
                type="button"
                class="w-8 h-8 rounded-lg text-[#8fa3c4] hover:text-rose-400 hover:bg-rose-500/10 flex items-center justify-center transition-colors cursor-pointer"
                @click="removeOption(idx)"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        <!-- Coins per user -->
        <div>
          <label class="block text-xs font-semibold text-[#8fa3c4] uppercase tracking-wider mb-1.5">
            Coins per Participant:
            <span class="text-[#f5c242] font-bold font-mono">{{ coinsPerUser }}</span>
          </label>
          <div class="flex items-center space-x-3">
            <button
              v-for="count in [1, 3, 5, 10]"
              :key="count"
              type="button"
              :class="[
                'flex-1 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer border',
                coinsPerUser === count
                  ? 'bg-[#0b1220] text-[#d0ebff] border-2 border-[#74b9ff] shadow-sm'
                  : 'bg-[#0b1220] text-[#8fa3c4] border border-[#25314a] hover:border-[#8fa3c4]/50',
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
            class="flex-1 py-3 rounded-xl bg-[#0b1220] hover:bg-[#25314a]/50 text-[#8fa3c4] hover:text-[#eaf2ff] border border-[#25314a] font-medium text-sm transition-colors cursor-pointer"
            @click="emit('close')"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="flex-1 py-3 rounded-xl bg-sky-gradient text-[#0b1220] font-bold text-sm shadow-md transition-all hover:opacity-95 active:scale-98 cursor-pointer"
          >
            Launch Poll
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
