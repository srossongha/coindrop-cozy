<script setup lang="ts">
import { X } from 'lucide-vue-next'

const emit = defineEmits<{
  add: [data: { title: string; category: string; priceNote: string; link?: string }]
  close: []
}>()

const newOptTitle = ref('')
const newOptCategory = ref('Hotpot & Grill')
const newOptPrice = ref('')
const newOptLink = ref('')

function handleSubmit() {
  if (!newOptTitle.value.trim()) return
  emit('add', {
    title: newOptTitle.value.trim(),
    category: newOptCategory.value,
    priceNote: newOptPrice.value.trim(),
    link: newOptLink.value.trim() || undefined,
  })
  emit('close')
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
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold text-[#eaf2ff]">Drop a New Option Card</h3>
        <button
          type="button"
          class="text-[#8fa3c4] hover:text-[#eaf2ff] transition-colors cursor-pointer"
          @click="emit('close')"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-[#8fa3c4] uppercase tracking-wider mb-1">
            Option Title *
          </label>
          <input
            v-model="newOptTitle"
            type="text"
            required
            placeholder="e.g. Malatang Hotpot on Street 310"
            class="w-full bg-[#0b1220] border border-[#25314a] rounded-xl px-3.5 py-2.5 text-sm text-[#eaf2ff] placeholder-[#8fa3c4]/50 focus:outline-none focus:ring-2 focus:ring-[#74b9ff]"
            autofocus
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-[#8fa3c4] uppercase tracking-wider mb-1">
              Category Tag
            </label>
            <select
              v-model="newOptCategory"
              class="w-full bg-[#0b1220] border border-[#25314a] rounded-xl px-3 py-2.5 text-sm text-[#eaf2ff] focus:outline-none focus:ring-2 focus:ring-[#74b9ff]"
            >
              <option>Hotpot & Grill</option>
              <option>BBQ & Skewers</option>
              <option>Street Food</option>
              <option>Japanese</option>
              <option>Cafe & Study</option>
              <option>Weekend Trip</option>
              <option>Project Topic</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-[#8fa3c4] uppercase tracking-wider mb-1">
              Est. Price / Note
            </label>
            <input
              v-model="newOptPrice"
              type="text"
              placeholder="e.g. ~$10 / person"
              class="w-full bg-[#0b1220] border border-[#25314a] rounded-xl px-3 py-2.5 text-sm text-[#eaf2ff] placeholder-[#8fa3c4]/50 focus:outline-none focus:ring-2 focus:ring-[#74b9ff]"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-[#8fa3c4] uppercase tracking-wider mb-1">
            Google Maps or Website Link (Optional)
          </label>
          <input
            v-model="newOptLink"
            type="url"
            placeholder="https://maps.google.com/..."
            class="w-full bg-[#0b1220] border border-[#25314a] rounded-xl px-3.5 py-2 text-sm text-[#eaf2ff] placeholder-[#8fa3c4]/50 focus:outline-none focus:ring-2 focus:ring-[#74b9ff]"
          />
        </div>
      </div>

      <div class="flex items-center justify-end gap-2.5 mt-6">
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
          Add Card (+1 🪙 Auto-Vote)
        </button>
      </div>
    </form>
  </div>
</template>
