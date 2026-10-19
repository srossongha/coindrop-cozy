<script setup lang="ts">
import { Coins, Plus, Code2, Edit3 } from 'lucide-vue-next'
import type { DecisionRoom, UserProfile } from '~/types'
import SmartAvatarOverflow from './SmartAvatarOverflow.vue'

defineProps<{
  rooms: DecisionRoom[]
  activeRoomId: string
  userProfile: UserProfile
  participants: UserProfile[]
  simulateFriends: boolean
}>()

const emit = defineEmits<{
  selectRoom: [id: string]
  toggleSimulation: []
  openProfile: []
  openVault: []
  openNewRoom: []
}>()
</script>

<template>
  <header class="sticky top-0 z-40 bg-[#0b1220]/90 backdrop-blur-xl border-b border-[#25314a]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
      <!-- Brand Logo & Room Switcher -->
      <div class="flex items-center gap-3 min-w-0">
        <div
          class="w-10 h-10 rounded-2xl bg-[#121a2b] border border-[#25314a] flex items-center justify-center shadow-sm shrink-0"
        >
          <Coins class="w-5 h-5 text-[#f5c242] stroke-[2.5]" />
        </div>
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <span class="font-black tracking-tight text-lg text-[#eaf2ff]"> CoinDrop </span>
            <span
              class="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#0b1220] text-[#d0ebff] border border-[#25314a] font-mono"
            >
              No-Account Rooms
            </span>
          </div>
          <div class="flex items-center gap-2 text-xs text-[#8fa3c4] truncate">
            <select
              :value="activeRoomId"
              class="bg-transparent font-medium text-[#8fa3c4] hover:text-[#d0ebff] focus:outline-none cursor-pointer truncate max-w-[180px] sm:max-w-xs font-mono"
              @change="emit('selectRoom', ($event.target as HTMLSelectElement).value)"
            >
              <option
                v-for="r in rooms"
                :key="r.id"
                :value="r.id"
                class="bg-[#121a2b] text-[#eaf2ff]"
              >
                #{{ r.id }} — {{ r.title }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Right Header Controls: Multiplayer Sim, Avatars, Vault, Share -->
      <div class="flex items-center gap-2 sm:gap-3">
        <!-- Simulate Live Friends Toggle -->
        <button
          type="button"
          class="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer font-mono"
          :class="[
            simulateFriends
              ? 'bg-[#121a2b] border-[#3fb950]/50 text-[#3fb950] shadow-sm'
              : 'bg-[#121a2b] border-[#25314a] text-[#8fa3c4] hover:text-[#eaf2ff]',
          ]"
          title="Toggle simulated real-time friends voting"
          @click="emit('toggleSimulation')"
        >
          <span
            class="w-2 h-2 rounded-full"
            :class="simulateFriends ? 'bg-[#3fb950] animate-ping' : 'bg-[#8fa3c4]'"
          />
          <span>Sim Friends: {{ simulateFriends ? 'ON' : 'OFF' }}</span>
        </button>

        <!-- Smart Avatar Stack -->
        <SmartAvatarOverflow :participants="participants" :max-visible="4" />

        <!-- User Identity Badge (Click to Edit) -->
        <button
          type="button"
          class="flex items-center gap-1.5 bg-[#121a2b] hover:bg-[#25314a]/70 border border-[#25314a] rounded-xl px-2.5 py-1.5 text-xs font-medium text-[#eaf2ff] transition-colors cursor-pointer"
          title="Click to customize your anonymous nickname"
          @click="emit('openProfile')"
        >
          <span class="text-base">{{ userProfile.emoji }}</span>
          <span class="hidden lg:inline max-w-[90px] truncate text-[#eaf2ff]">
            {{ userProfile.name }}
          </span>
          <Edit3 class="w-3 h-3 text-[#8fa3c4]" />
        </button>

        <!-- UI Vault Button -->
        <button
          type="button"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#121a2b] hover:border-[#d0ebff]/50 text-[#d0ebff] border border-[#25314a] transition-all shadow-sm cursor-pointer"
          @click="emit('openVault')"
        >
          <Code2 class="w-3.5 h-3.5 text-[#74b9ff]" />
          <span class="hidden sm:inline">UI Vault</span>
          <span
            class="px-1.5 py-0.2 bg-[#0b1220] rounded text-[10px] text-[#74b9ff] border border-[#25314a]"
          >
            3
          </span>
        </button>

        <!-- + New Room Button -->
        <button
          type="button"
          class="p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold bg-[#121a2b] hover:bg-[#25314a] text-[#eaf2ff] border border-[#25314a] flex items-center gap-1 transition-colors cursor-pointer"
          title="Create a new ephemeral decision room"
          @click="emit('openNewRoom')"
        >
          <Plus class="w-4 h-4 text-[#74b9ff]" />
          <span class="hidden md:inline">New Room</span>
        </button>
      </div>
    </div>
  </header>
</template>
