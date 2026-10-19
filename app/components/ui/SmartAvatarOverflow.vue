<script setup lang="ts">
import type { UserProfile } from '~/types'

const props = withDefaults(
  defineProps<{
    participants: UserProfile[]
    maxVisible?: number
  }>(),
  {
    maxVisible: 4,
  },
)

const showTooltip = ref(false)

const visible = computed(() => props.participants.slice(0, props.maxVisible))
const hidden = computed(() => props.participants.slice(props.maxVisible))
</script>

<template>
  <div
    class="relative flex items-center"
    @mouseenter="showTooltip = true"
    @mouseleave="showTooltip = false"
  >
    <div class="flex items-center -space-x-2.5">
      <div
        v-for="(p, idx) in visible"
        :key="p.id"
        :style="{ zIndex: visible.length - idx }"
        class="w-8 h-8 rounded-full bg-[#121a2b] border border-[#25314a] p-0.5 shadow-md transition-transform duration-200 hover:-translate-y-1 hover:z-30 cursor-pointer"
        :title="`${p.name} (${p.coinsSpent || 0}/5 🪙)`"
      >
        <div
          class="w-full h-full bg-[#0b1220] rounded-full flex items-center justify-center text-sm select-none relative"
        >
          {{ p.emoji }}
          <span
            v-if="p.isOnline"
            class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#3fb950] border-2 border-[#0b1220] rounded-full"
          />
        </div>
      </div>

      <div
        v-if="hidden.length > 0"
        :style="{ zIndex: 0 }"
        class="w-8 h-8 rounded-full bg-[#121a2b] border border-[#25314a] text-xs font-bold text-[#d0ebff] flex items-center justify-center shadow-md hover:border-[#d0ebff]/50 transition-colors cursor-pointer"
      >
        +{{ hidden.length }}
      </div>
    </div>

    <!-- Hover Tooltip with Live Room Status -->
    <div
      v-if="showTooltip"
      class="absolute top-full right-0 mt-2 w-64 bg-[#121a2b] backdrop-blur-xl border border-[#25314a] rounded-[16px] p-3 shadow-2xl z-50 animate-in fade-in"
    >
      <div
        class="flex items-center justify-between text-xs font-semibold text-[#8fa3c4] pb-2 mb-2 border-b border-[#25314a]"
      >
        <span class="flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-[#3fb950] animate-pulse" />
          Active in Room ({{ participants.length }})
        </span>
        <span class="text-[11px] text-[#d0ebff] font-mono">No-Login IDs</span>
      </div>

      <div class="space-y-1.5 max-h-48 overflow-y-auto pr-1">
        <div
          v-for="p in participants"
          :key="p.id"
          class="flex items-center justify-between text-xs py-1 px-1.5 rounded-lg hover:bg-[#0b1220]/60 transition-colors"
        >
          <div class="flex items-center gap-2">
            <span class="text-base">{{ p.emoji }}</span>
            <span class="font-medium text-[#eaf2ff]">
              {{ p.name }}
              <span
                v-if="p.isMe"
                class="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-[#d0ebff]/15 text-[#d0ebff] font-bold"
              >
                You
              </span>
            </span>
          </div>
          <span class="text-[11px] font-mono font-bold text-[#f5c242]">
            {{ p.coinsSpent || 0 }}/5 🪙
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
