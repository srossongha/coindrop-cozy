<script setup lang="ts">
import { X, CheckCircle2 } from 'lucide-vue-next'
import type { DebtTransfer } from '~/types'

const props = defineProps<{
  transfer: DebtTransfer
}>()

const emit = defineEmits<{
  markPaid: [key: string]
  close: []
}>()

function handlePaid() {
  emit('markPaid', props.transfer.key)
  emit('close')
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 bg-canvas/85 backdrop-blur-sm flex items-center justify-center p-4"
  >
    <div
      class="bg-card border border-line rounded-[16px] max-w-sm w-full p-6 text-center shadow-2xl animate-in fade-in"
    >
      <div class="flex items-center justify-between mb-3">
        <span
          class="px-2.5 py-0.5 rounded-md bg-sky-soft/15 text-sky-soft border border-line text-[11px] font-bold tracking-wider uppercase font-mono"
        >
          KHQR / Instant Scan
        </span>
        <button
          class="text-text-muted hover:text-text-primary transition-colors cursor-pointer"
          @click="emit('close')"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <h4 class="text-base font-bold text-text-primary mb-1">
        Pay {{ transfer.to.name }} {{ transfer.to.emoji }}
      </h4>
      <p class="text-xs text-text-muted mb-4">
        Settling share from {{ transfer.from.name }} {{ transfer.from.emoji }}
      </p>

      <!-- Styled Bank QR Card -->
      <div class="bg-white rounded-2xl p-4 mx-auto w-56 shadow-inner mb-4">
        <div
          class="bg-canvas text-sky-end text-xs font-black py-1.5 rounded-t-lg mb-3 tracking-widest font-mono"
        >
          KHQR • ABA / BAKONG
        </div>
        <div class="text-canvas font-black text-2xl mb-2 font-mono">
          ${{ transfer.amount.toFixed(2) }}
        </div>
        <!-- SVG QR Code Representation -->
        <svg viewBox="0 0 100 100" class="w-40 h-40 mx-auto border border-slate-200 p-1 rounded">
          <rect width="100" height="100" fill="#ffffff" />
          <rect x="8" y="8" width="26" height="26" fill="none" stroke="#0b1220" stroke-width="6" />
          <rect x="16" y="16" width="10" height="10" fill="#0b1220" />
          <rect x="66" y="8" width="26" height="26" fill="none" stroke="#0b1220" stroke-width="6" />
          <rect x="74" y="16" width="10" height="10" fill="#0b1220" />
          <rect x="8" y="66" width="26" height="26" fill="none" stroke="#0b1220" stroke-width="6" />
          <rect x="16" y="74" width="10" height="10" fill="#0b1220" />
          <!-- Center Modules -->
          <rect x="42" y="12" width="6" height="18" fill="#0b1220" />
          <rect x="52" y="20" width="6" height="14" fill="#0b1220" />
          <rect x="12" y="42" width="18" height="6" fill="#0b1220" />
          <rect x="38" y="38" width="24" height="24" rx="4" fill="#74b9ff" />
          <text x="50" y="54" text-anchor="middle" fill="#0b1220" font-size="11" font-weight="bold">
            $
          </text>
          <rect x="68" y="44" width="18" height="6" fill="#0b1220" />
          <rect x="44" y="68" width="12" height="6" fill="#0b1220" />
          <rect x="64" y="64" width="10" height="10" fill="#0b1220" />
          <rect x="78" y="74" width="14" height="14" fill="#0b1220" />
          <rect x="44" y="82" width="18" height="8" fill="#0b1220" />
        </svg>
        <div class="text-[10px] font-mono text-slate-500 mt-2 truncate">
          REC: {{ transfer.to.name.toUpperCase() }}
        </div>
      </div>

      <button
        type="button"
        class="w-full py-2.5 rounded-xl bg-emerald hover:bg-emerald/90 text-canvas font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        @click="handlePaid"
      >
        <CheckCircle2 class="w-4 h-4" />
        <span>Mark as Paid (${{ transfer.amount.toFixed(2) }})</span>
      </button>
    </div>
  </div>
</template>
