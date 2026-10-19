<script setup lang="ts">
import { X } from 'lucide-vue-next'

const emit = defineEmits<{
  create: [title: string]
  close: []
}>()

const newRoomTitle = ref('')

function handleSubmit() {
  if (newRoomTitle.value.trim()) {
    emit('create', newRoomTitle.value.trim())
    newRoomTitle.value = ''
    emit('close')
  }
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 bg-[#0b1220]/80 backdrop-blur-sm flex items-center justify-center p-4"
  >
    <form
      class="bg-[#121a2b] border border-[#25314a] rounded-[16px] max-w-md w-full p-6 shadow-2xl animate-in fade-in"
      @submit.prevent="handleSubmit"
    >
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-lg font-bold text-[#eaf2ff]">Create Instant Decision Room</h3>
        <button
          type="button"
          class="text-[#8fa3c4] hover:text-[#eaf2ff] transition-colors cursor-pointer"
          @click="emit('close')"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <p class="text-xs text-[#8fa3c4] mb-4 leading-relaxed">
        Zero sign-up required. Creates a unique URL you can drop into Telegram, Messenger, or
        Discord.
      </p>

      <div class="mb-5">
        <label class="block text-xs font-semibold text-[#8fa3c4] uppercase tracking-wider mb-1.5">
          What is your group deciding on?
        </label>
        <input
          v-model="newRoomTitle"
          type="text"
          required
          placeholder="e.g. Kampot Weekend Trip Ideas 🏖️"
          class="w-full bg-[#0b1220] border border-[#25314a] rounded-xl px-3.5 py-2.5 text-sm text-[#eaf2ff] placeholder-[#8fa3c4]/50 focus:outline-none focus:ring-2 focus:ring-[#74b9ff]"
          autofocus
        />
      </div>

      <div class="flex justify-end gap-2.5">
        <button
          type="button"
          class="px-4 py-2 rounded-xl text-xs font-semibold text-[#8fa3c4] hover:text-[#eaf2ff] border border-[#25314a] bg-[#0b1220] cursor-pointer"
          @click="emit('close')"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="px-5 py-2.5 rounded-xl bg-sky-gradient text-[#0b1220] font-bold text-xs shadow-md hover:opacity-95 active:scale-98 cursor-pointer"
        >
          Launch Room ⚡
        </button>
      </div>
    </form>
  </div>
</template>
