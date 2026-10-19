<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { X, Sparkles, MapPin, DollarSign, Tag, Check, Trash2 } from 'lucide-vue-next'
import type { CardIdea } from '~/types'

const props = defineProps<{
  existingIdea?: CardIdea | null
  isHost?: boolean
}>()

const emit = defineEmits<{
  (
    e: 'submit',
    data: {
      title: string
      category: string
      priceNote?: string
      link?: string
      description?: string
    },
  ): void
  (e: 'delete', ideaId: string): void
  (e: 'close'): void
}>()

const title = ref('')
const category = ref('Food & Dining')
const priceNote = ref('')
const link = ref('')
const description = ref('')

const CATEGORIES = [
  'Food & Dining 🍲',
  'Activities & Fun 🎯',
  'Night Out & Drinks 🍹',
  'Travel & Trip 🏖️',
  'Movie & Show 🍿',
  'Other 💡',
]

onMounted(() => {
  if (props.existingIdea) {
    title.value = props.existingIdea.title
    category.value = props.existingIdea.category || 'Food & Dining'
    priceNote.value = props.existingIdea.priceNote || ''
    link.value = props.existingIdea.link || ''
    description.value = props.existingIdea.description || ''
  }
})

function normalizeUrl(url: string): string {
  const trimmed = url.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return 'https://' + trimmed
}

function handleSubmit() {
  if (!title.value.trim()) return

  emit('submit', {
    title: title.value.trim(),
    category: category.value,
    priceNote: priceNote.value.trim(),
    link: normalizeUrl(link.value),
    description: description.value.trim(),
  })
  emit('close')
}

function handleDelete() {
  if (props.existingIdea) {
    emit('delete', props.existingIdea.id)
    emit('close')
  }
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 bg-[#0b1220]/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
  >
    <div
      class="modal-dialog w-full max-w-lg max-h-[92vh] overflow-y-auto bg-[#121a2b] border border-[#25314a] rounded-[20px] p-4 sm:p-6 shadow-2xl relative"
    >
      <!-- Close button -->
      <button
        type="button"
        class="absolute top-4 right-4 text-[#8fa3c4] hover:text-[#eaf2ff] transition-colors cursor-pointer"
        @click="emit('close')"
      >
        <X class="w-5 h-5" />
      </button>

      <!-- Header -->
      <div class="flex items-center gap-2.5 mb-2 pr-6">
        <div
          class="w-9 h-9 rounded-xl bg-[#74b9ff]/15 border border-[#74b9ff]/30 flex items-center justify-center text-[#74b9ff] shrink-0"
        >
          <Sparkles class="w-4 h-4" />
        </div>
        <div>
          <h2 class="text-sm sm:text-base font-bold text-[#eaf2ff]">
            {{ existingIdea ? 'Edit Card Option' : 'Propose a Card Idea' }}
          </h2>
          <p class="text-[11px] sm:text-xs text-[#8fa3c4]">
            {{
              existingIdea
                ? 'Update details before voting locks in.'
                : 'Suggest an option for the group to vote with their coins!'
            }}
          </p>
        </div>
      </div>

      <form class="space-y-3.5 sm:space-y-4 mt-4" @submit.prevent="handleSubmit">
        <!-- Title -->
        <div>
          <label
            class="block text-[11px] font-semibold text-[#8fa3c4] uppercase tracking-wider mb-1"
          >
            Idea Title *
          </label>
          <input
            v-model="title"
            type="text"
            required
            placeholder="e.g. Suki Soup & Sichuan Mala Hotpot 🍲"
            class="w-full bg-[#0b1220] border border-[#25314a] rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-[#eaf2ff] placeholder-[#8fa3c4]/50 focus:outline-none focus:ring-2 focus:ring-[#74b9ff]"
          />
        </div>

        <!-- Category -->
        <div>
          <label
            class="block text-[11px] font-semibold text-[#8fa3c4] uppercase tracking-wider mb-1 flex items-center gap-1"
          >
            <Tag class="w-3.5 h-3.5" />
            <span>Category</span>
          </label>
          <select
            v-model="category"
            class="w-full bg-[#0b1220] border border-[#25314a] rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-[#eaf2ff] focus:outline-none focus:ring-2 focus:ring-[#74b9ff]"
          >
            <option v-for="cat in CATEGORIES" :key="cat" :value="cat">
              {{ cat }}
            </option>
          </select>
        </div>

        <!-- Price / Budget Note & Link -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label
              class="block text-[11px] font-semibold text-[#8fa3c4] uppercase tracking-wider mb-1 flex items-center gap-1"
            >
              <DollarSign class="w-3.5 h-3.5 text-[#f5c242]" />
              <span>Est. Cost / Note</span>
            </label>
            <input
              v-model="priceNote"
              type="text"
              placeholder="e.g. ~$12–$15 / person"
              class="w-full bg-[#0b1220] border border-[#25314a] rounded-xl px-3 py-2 text-base sm:text-xs text-[#eaf2ff] placeholder-[#8fa3c4]/50 focus:outline-none focus:ring-2 focus:ring-[#74b9ff]"
            />
          </div>

          <div>
            <label
              class="block text-[11px] font-semibold text-[#8fa3c4] uppercase tracking-wider mb-1 flex items-center gap-1"
            >
              <MapPin class="w-3.5 h-3.5 text-[#74b9ff]" />
              <span>Google Maps / Link</span>
            </label>
            <input
              v-model="link"
              type="url"
              placeholder="https://maps.google.com/..."
              class="w-full bg-[#0b1220] border border-[#25314a] rounded-xl px-3 py-2 text-base sm:text-xs text-[#eaf2ff] placeholder-[#8fa3c4]/50 focus:outline-none focus:ring-2 focus:ring-[#74b9ff]"
            />
          </div>
        </div>

        <!-- Optional Description -->
        <div>
          <label
            class="block text-[11px] font-semibold text-[#8fa3c4] uppercase tracking-wider mb-1"
          >
            Short Description (Optional)
          </label>
          <textarea
            v-model="description"
            rows="2"
            placeholder="e.g. Air-conditioned, opens until 2am, good reviews on vegetarian options."
            class="w-full bg-[#0b1220] border border-[#25314a] rounded-xl px-3 py-2 text-base sm:text-xs text-[#eaf2ff] placeholder-[#8fa3c4]/50 focus:outline-none focus:ring-2 focus:ring-[#74b9ff]"
          />
        </div>

        <!-- Action Buttons -->
        <div class="pt-2 flex items-center gap-3">
          <button
            v-if="existingIdea"
            type="button"
            class="py-2.5 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            @click="handleDelete"
          >
            <Trash2 class="w-4 h-4" />
            <span>Delete</span>
          </button>

          <button
            type="submit"
            class="flex-1 py-3 rounded-xl bg-sky-gradient text-[#0b1220] font-bold text-xs shadow-lg transition-all duration-200 hover:opacity-95 active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Check class="w-4 h-4" />
            <span>{{ existingIdea ? 'Save Changes' : 'Add to Decision Board' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
