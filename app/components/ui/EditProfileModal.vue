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
    class="fixed inset-0 z-50 bg-[#0b1220]/80 backdrop-blur-sm flex items-center justify-center p-4"
  >
    <form
      class="w-full max-w-sm bg-[#121a2b] border border-[#25314a] rounded-[16px] p-5 shadow-2xl animate-in fade-in"
      @submit.prevent="handleSave"
    >
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs font-bold uppercase tracking-wider text-[#d0ebff]">
          Instant Session Identity
        </span>
        <button
          type="button"
          class="text-[#8fa3c4] hover:text-[#eaf2ff] transition-colors cursor-pointer"
          @click="emit('close')"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <p class="text-[11px] text-[#8fa3c4] mb-3 leading-relaxed">
        No account needed. Your browser session keeps your coins synced automatically.
      </p>

      <div class="mb-3">
        <label
          class="block text-[11px] font-semibold text-[#8fa3c4] uppercase tracking-wider mb-1.5"
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
                ? 'bg-[#0b1220] border-2 border-[#74b9ff] scale-110'
                : 'bg-[#0b1220] border border-[#25314a] hover:border-[#8fa3c4]/50',
            ]"
            @click="tempEmoji = em"
          >
            {{ em }}
          </button>
        </div>
      </div>

      <div class="mb-4">
        <label
          class="block text-[11px] font-semibold text-[#8fa3c4] uppercase tracking-wider mb-1.5"
        >
          Display Nickname
        </label>
        <input
          v-model="tempName"
          type="text"
          class="w-full bg-[#0b1220] border border-[#25314a] rounded-xl px-3 py-2 text-sm text-[#eaf2ff] placeholder-[#8fa3c4]/50 focus:outline-none focus:ring-2 focus:ring-[#74b9ff]"
          placeholder="e.g. Spicy Frog"
          required
        />
      </div>

      <button
        type="submit"
        class="w-full bg-sky-gradient text-[#0b1220] font-bold text-xs py-2.5 rounded-xl shadow-md transition-all hover:opacity-95 active:scale-98 cursor-pointer"
      >
        Save Identity
      </button>
    </form>
  </div>
</template>
