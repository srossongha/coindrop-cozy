<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { EMOJI_AVATARS } from '~/utils/constants'

const props = defineProps<{
  name: string
  emoji: string
}>()

const emit = defineEmits<{
  save: [name: string, emoji: string]
  close: []
}>()

const tempName = ref(props.name)
const tempEmoji = ref(props.emoji)

function handleSave() {
  if (tempName.value.trim()) {
    emit('save', tempName.value.trim(), tempEmoji.value)
    emit('close')
  }
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 bg-canvas/80 backdrop-blur-sm flex items-center justify-center p-4"
  >
    <form
      class="w-full max-w-sm bg-card border border-line rounded-[16px] p-5 shadow-2xl animate-in fade-in"
      @submit.prevent="handleSave"
    >
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs font-bold uppercase tracking-wider text-sky-soft">
          Instant Session Identity
        </span>
        <button
          type="button"
          class="text-text-muted hover:text-text-primary transition-colors cursor-pointer"
          @click="emit('close')"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <p class="text-[11px] text-text-muted mb-3 leading-relaxed">
        No account needed. Your browser session keeps your coins synced automatically.
      </p>

      <div class="mb-3">
        <label
          class="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1.5"
        >
          Pick Avatar
        </label>
        <div class="grid grid-cols-6 gap-1.5">
          <button
            v-for="em in EMOJI_AVATARS"
            :key="em"
            type="button"
            class="p-1.5 rounded-xl text-base flex items-center justify-center transition-all cursor-pointer"
            :class="[
              tempEmoji === em
                ? 'bg-canvas border-2 border-sky-end scale-110'
                : 'bg-canvas border border-line hover:border-text-muted/50',
            ]"
            @click="tempEmoji = em"
          >
            {{ em }}
          </button>
        </div>
      </div>

      <div class="mb-4">
        <label
          class="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1.5"
        >
          Display Nickname
        </label>
        <input
          v-model="tempName"
          type="text"
          class="w-full bg-canvas border border-line rounded-xl px-3 py-2 text-sm text-text-primary placeholder-text-muted/50 focus:outline-none focus:ring-2 focus:ring-sky-end"
          placeholder="e.g. Spicy Frog"
          required
        />
      </div>

      <button
        type="submit"
        class="w-full bg-sky-gradient text-canvas font-bold text-xs py-2.5 rounded-xl shadow-md transition-all hover:opacity-95 active:scale-98 cursor-pointer"
      >
        Save Identity
      </button>
    </form>
  </div>
</template>
