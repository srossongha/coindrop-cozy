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
    class="fixed inset-0 z-50 bg-canvas/80 backdrop-blur-sm flex items-center justify-center p-4"
  >
    <form
      class="bg-card border border-line rounded-[16px] max-w-md w-full p-6 shadow-2xl animate-in fade-in"
      @submit.prevent="handleSubmit"
    >
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-lg font-bold text-text-primary">Create Instant Decision Room</h3>
        <button
          type="button"
          class="text-text-muted hover:text-text-primary transition-colors cursor-pointer"
          @click="emit('close')"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <p class="text-xs text-text-muted mb-4 leading-relaxed">
        Zero sign-up required. Creates a unique URL you can drop into Telegram, Messenger, or
        Discord.
      </p>

      <div class="mb-5">
        <label class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">
          What is your group deciding on?
        </label>
        <input
          v-model="newRoomTitle"
          type="text"
          required
          placeholder="e.g. Kampot Weekend Trip Ideas 🏖️"
          class="w-full bg-canvas border border-line rounded-xl px-3.5 py-2.5 text-sm text-text-primary placeholder-text-muted/50 focus:outline-none focus:ring-2 focus:ring-sky-end"
          autofocus
        />
      </div>

      <div class="flex justify-end gap-2.5">
        <button
          type="button"
          class="px-4 py-2 rounded-xl text-xs font-semibold text-text-muted hover:text-text-primary border border-line bg-canvas cursor-pointer"
          @click="emit('close')"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="px-5 py-2.5 rounded-xl bg-sky-gradient text-canvas font-bold text-xs shadow-md hover:opacity-95 active:scale-98 cursor-pointer"
        >
          Launch Room ⚡
        </button>
      </div>
    </form>
  </div>
</template>
