<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { X, Sparkles, Check, Shuffle } from 'lucide-vue-next'
import { useIdentity, DEFAULT_PERSONAS, EMOJI_OPTIONS } from '~/composables/useIdentity'

const props = withDefaults(
  defineProps<{
    isMandatory?: boolean
    title?: string
    description?: string
  }>(),
  {
    isMandatory: false,
    title: 'Choose Your Persona',
    description:
      'Zero signup needed! Pick your nickname and cute emoji to join the decision lobby.',
  },
)

const emit = defineEmits<{
  (e: 'save' | 'close'): void
}>()

const { identity, updateIdentity } = useIdentity()

const currentEmoji = ref(identity.value?.emoji || '🦫')
const currentName = ref(identity.value?.name || 'Chill Capybara')

onMounted(() => {
  if (identity.value) {
    currentEmoji.value = identity.value.emoji
    currentName.value = identity.value.name
  }
})

watch(
  () => identity.value,
  newId => {
    if (newId) {
      currentEmoji.value = newId.emoji
      currentName.value = newId.name
    }
  },
)

function pickRandomPersona() {
  const p = DEFAULT_PERSONAS[Math.floor(Math.random() * DEFAULT_PERSONAS.length)]
  if (p) {
    currentEmoji.value = p.emoji
    currentName.value = p.name
  }
}

function handleSave() {
  if (!currentName.value.trim()) return
  updateIdentity(currentName.value.trim(), currentEmoji.value)
  emit('save')
  emit('close')
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 bg-canvas/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
  >
    <div
      class="modal-dialog w-full max-w-md max-h-[92vh] overflow-y-auto bg-card border border-line rounded-[20px] p-4 sm:p-6 shadow-2xl relative my-auto"
    >
      <!-- Close button (only if not mandatory first-join) -->
      <button
        v-if="!isMandatory"
        type="button"
        class="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
        @click="emit('close')"
      >
        <X class="w-5 h-5" />
      </button>

      <!-- Header -->
      <div class="flex items-center gap-3 mb-2 pr-6">
        <div
          class="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-canvas border-2 border-sky-end/40 flex items-center justify-center text-xl sm:text-2xl shadow-inner shrink-0"
        >
          {{ currentEmoji }}
        </div>
        <div>
          <h2 class="text-sm sm:text-base font-bold text-text-primary flex items-center gap-2">
            <span>{{ title }}</span>
            <Sparkles class="w-4 h-4 text-sky-end" />
          </h2>
          <p class="text-[11px] sm:text-xs text-text-muted">
            {{ description }}
          </p>
        </div>
      </div>

      <!-- Quick Randomize -->
      <div class="flex items-center justify-between mb-4 mt-3 pt-3 border-t border-line">
        <span class="text-xs font-semibold text-text-muted">Need inspiration?</span>
        <button
          type="button"
          class="text-xs text-sky-end hover:text-sky-soft flex items-center gap-1 font-semibold cursor-pointer active:scale-95"
          @click="pickRandomPersona"
        >
          <Shuffle class="w-3.5 h-3.5" />
          <span>Roll random</span>
        </button>
      </div>

      <!-- Emoji Picker Grid -->
      <div class="mb-4">
        <label
          class="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2"
        >
          Select Mascot Emoji
        </label>
        <div class="grid grid-cols-5 gap-1.5 sm:gap-2">
          <button
            v-for="em in EMOJI_OPTIONS"
            :key="em"
            type="button"
            :class="[
              'p-2 rounded-xl text-xl flex items-center justify-center transition-all cursor-pointer active:scale-95',
              currentEmoji === em
                ? 'bg-canvas border-2 border-sky-end scale-105 shadow-md shadow-sky-end/20'
                : 'bg-canvas border border-line hover:border-text-muted/50 opacity-80 hover:opacity-100',
            ]"
            @click="currentEmoji = em"
          >
            {{ em }}
          </button>
        </div>
      </div>

      <!-- Name Input -->
      <div class="mb-5">
        <label
          class="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1.5"
        >
          Display Name
        </label>
        <input
          v-model="currentName"
          type="text"
          maxlength="24"
          placeholder="e.g. Chill Capybara"
          class="w-full bg-canvas border border-line rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-text-primary placeholder-text-muted/50 focus:outline-none focus:ring-2 focus:ring-sky-end"
          @keydown.enter="handleSave"
        />
      </div>

      <!-- Submit Button -->
      <button
        type="button"
        class="w-full py-3 rounded-xl bg-sky-gradient text-canvas font-bold text-sm shadow-lg transition-all duration-200 hover:opacity-95 active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
        @click="handleSave"
      >
        <Check class="w-4 h-4" />
        <span>{{ props.isMandatory ? 'Ready to Join Lobby 🚀' : 'Save Persona ✨' }}</span>
      </button>
    </div>
  </div>
</template>
