<script setup lang="ts">
import { Code2, X, Sliders, Copy, Check } from 'lucide-vue-next'
import RollingCounter from './RollingCounter.vue'
import SmartAvatarOverflow from './SmartAvatarOverflow.vue'
import HoldToConfirmButton from './HoldToConfirmButton.vue'
import { SIMULATED_FRIENDS } from '~/utils/constants'

const emit = defineEmits<{
  close: []
}>()

const selectedId = ref<'rolling-counter' | 'smart-overflow' | 'hold-confirm'>('rolling-counter')
const framework = ref<'vue' | 'react'>('vue')
const copied = ref(false)

// Interactive Sandbox Controls
const demoCount = ref(128)
const slowMo = ref(false)
const maxAvatars = ref(3)

const VAULT_ITEMS = [
  {
    id: 'rolling-counter' as const,
    title: '1. Rolling Odometer Number Counter',
    because:
      'Because swapping numbers abruptly from 9 to 10 in live multiplayer apps feels jarring and is easy for the human eye to miss.',
    cliCommand: 'npx shadcn@latest add https://coindrop.app/r/rolling-counter.json',
    vueCode: `<!-- RollingCounter.vue (Vue 3 <script setup> + Tailwind) -->
<script setup lang="ts">
const props = withDefaults(defineProps<{ value: number; slowMo?: boolean }>(), { slowMo: false })
const prev = ref(props.value)
const dir = ref<'up' | 'down'>('up')
const animating = ref(false)

watch(() => props.value, (next, before) => {
  if (next !== before) {
    dir.value = next > before ? 'up' : 'down'
    animating.value = true
    setTimeout(() => { prev.value = next; animating.value = false }, props.slowMo ? 900 : 280)
  }
})
${'<'}/script>

<template>
  <span class="inline-flex relative overflow-hidden tabular-nums font-black h-[1.35em]">
    <span v-if="animating" class="transition-all" :class="dir === 'up' ? '-translate-y-full opacity-0' : 'translate-y-full opacity-0'">
      {{ prev }}
    </span>
    <span v-else>{{ value }}</span>
  </span>
</template>`,
    reactCode: `// RollingCounter.tsx (React + Tailwind)
import { useState, useEffect } from 'react';

export function RollingCounter({ value, duration = 280 }) {
  const [prev, setPrev] = useState(value);
  const [dir, setDir] = useState<'up' | 'down'>('up');
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (value !== prev) {
      setDir(value > prev ? 'up' : 'down');
      setAnimating(true);
      const t = setTimeout(() => { setPrev(value); setAnimating(false); }, duration);
      return () => clearTimeout(t);
    }
  }, [value, prev, duration]);

  return (
    <span className="inline-flex relative overflow-hidden tabular-nums font-black h-[1.35em]">
      {animating ? (
        <>
          <span className={\`transition-all \${dir === 'up' ? '-translate-y-full' : 'translate-y-full'} opacity-0\`}>
            {prev}
          </span>
          <span className="absolute inset-0 flex items-center justify-center animate-in fade-in">
            {value}
          </span>
        </>
      ) : <span>{value}</span>}
    </span>
  );
}`,
  },
  {
    id: 'smart-overflow' as const,
    title: '2. Smart Avatar / Badge Overflow Stack',
    because:
      'Because dynamic lists of online users or tags break header layouts on mobile if they wrap to a second line.',
    cliCommand: 'npx shadcn@latest add https://coindrop.app/r/smart-avatar-overflow.json',
    vueCode: `<!-- SmartAvatarOverflow.vue (Vue 3 + Tailwind) -->
<script setup lang="ts">
import { computed } from 'vue'
const props = withDefaults(defineProps<{ items: any[]; maxVisible?: number }>(), { maxVisible: 4 })
const visible = computed(() => props.items.slice(0, props.maxVisible))
const hiddenCount = computed(() => Math.max(0, props.items.length - props.maxVisible))
${'<'}/script>

<template>
  <div class="flex items-center -space-x-2.5">
    <div v-for="(u, i) in visible" :key="u.id" :style="{ zIndex: visible.length - i }"
      class="w-8 h-8 rounded-full bg-[#121a2b] border border-[#25314a] flex items-center justify-center hover:-translate-y-1 transition-transform">
      {{ u.emoji }}
    </div>
    <div v-if="hiddenCount > 0" class="w-8 h-8 rounded-full bg-[#121a2b] text-xs font-bold text-[#d0ebff] flex items-center justify-center">
      +{{ hiddenCount }}
    </div>
  </div>
</template>`,
    reactCode: `// SmartAvatarOverflow.tsx (React + Tailwind)
export function SmartAvatarOverflow({ items, maxVisible = 4 }) {
  const visible = items.slice(0, maxVisible);
  const hiddenCount = Math.max(0, items.length - maxVisible);

  return (
    <div className="flex items-center -space-x-2.5">
      {visible.map((user, i) => (
        <div key={user.id} style={{ zIndex: visible.length - i }}
          className="w-8 h-8 rounded-full bg-slate-900 border-2 border-amber-400 flex items-center justify-center hover:-translate-y-1 transition-transform">
          {user.emoji}
        </div>
      ))}
      {hiddenCount > 0 && (
        <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-700 text-xs font-bold text-amber-300 flex items-center justify-center">
          +{hiddenCount}
        </div>
      )}
    </div>
  );
}`,
  },
  {
    id: 'hold-confirm' as const,
    title: '3. Hold-to-Confirm Destructive Button',
    because:
      'Because confirmation popup modals ("Are you sure? Yes/No") interrupt user flow, whereas a 1.2s physical hold prevents accidental resets in place.',
    cliCommand: 'npx shadcn@latest add https://coindrop.app/r/hold-to-confirm.json',
    vueCode: `<!-- HoldToConfirmButton.vue (Vue 3 + Tailwind) -->
<script setup lang="ts">
import { ref } from 'vue'
const emit = defineEmits(['confirm'])
const progress = ref(0)
let timer: any = null

function start() {
  const t0 = Date.now()
  timer = setInterval(() => {
    progress.value = Math.min(100, ((Date.now() - t0) / 1200) * 100)
    if (progress.value >= 100) { clearInterval(timer); emit('confirm'); progress.value = 0 }
  }, 16)
}
function stop() { clearInterval(timer); progress.value = 0 }
${'<'}/script>

<template>
  <button @mousedown="start" @mouseup="stop" @mouseleave="stop"
    class="relative overflow-hidden rounded-xl px-4 py-2 bg-[#121a2b] border border-rose-500/40 text-rose-300 text-xs font-bold">
    <span class="absolute inset-y-0 left-0 bg-rose-500/30" :style="{ width: progress + '%' }" />
    <span class="relative z-10">{{ progress > 0 ? \`Holding \${Math.round(progress)}%\` : 'Hold to Reset' }}</span>
  </button>
</template>`,
    reactCode: `// HoldToConfirmButton.tsx (React + Tailwind)
import { useState, useRef } from 'react';

export function HoldToConfirmButton({ onConfirm, holdMs = 1200, label = 'Hold to Reset' }) {
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<any>(null);

  const start = () => {
    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      const pct = Math.min(100, ((Date.now() - startTime) / holdMs) * 100);
      setProgress(pct);
      if (pct >= 100) { clearInterval(timerRef.current); onConfirm(); setProgress(0); }
    }, 16);
  };
  const stop = () => { clearInterval(timerRef.current); setProgress(0); };

  return (
    <button onMouseDown={start} onMouseUp={stop} onMouseLeave={stop}
      className="relative overflow-hidden rounded-xl px-4 py-2 bg-rose-950/50 border border-rose-500/40 text-rose-200 text-xs font-bold">
      <span className="absolute inset-y-0 left-0 bg-rose-500/40" style={{ width: \`\${progress}%\` }} />
      <span className="relative z-10">{progress > 0 ? \`Holding \${Math.round(progress)}%\` : label}</span>
    </button>
  );
}`,
  },
]

const activeItem = computed(() => {
  return VAULT_ITEMS.find(i => i.id === selectedId.value) || VAULT_ITEMS[0]!
})

const codeToDisplay = computed(() => {
  return framework.value === 'vue' ? activeItem.value.vueCode : activeItem.value.reactCode
})

function copyText(text: string) {
  navigator.clipboard.writeText(text)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}
</script>

<template>
  <div class="fixed inset-0 z-50 bg-[#0b1220]/80 backdrop-blur-sm flex justify-end">
    <div
      class="bg-[#121a2b] border-l border-[#25314a] w-full max-w-2xl h-full flex flex-col justify-between overflow-y-auto p-6 shadow-2xl animate-in slide-in-from-right duration-200"
    >
      <div>
        <!-- Top Header -->
        <div class="flex items-center justify-between pb-4 mb-5 border-b border-[#25314a]">
          <div class="flex items-center gap-2.5">
            <div
              class="w-9 h-9 rounded-xl bg-[#0b1220] border border-[#25314a] flex items-center justify-center text-[#d0ebff]"
            >
              <Code2 class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-base font-extrabold text-[#eaf2ff]">UI Micro-Interaction Vault</h3>
              <p class="text-xs text-[#8fa3c4]">
                Inspect, stress-test, and copy the exact components powering CoinDrop.
              </p>
            </div>
          </div>
          <button
            type="button"
            class="p-2 rounded-xl bg-[#0b1220] text-[#8fa3c4] hover:text-[#eaf2ff] border border-[#25314a] cursor-pointer"
            @click="emit('close')"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Component Selector Pills -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-5">
          <button
            v-for="item in VAULT_ITEMS"
            :key="item.id"
            type="button"
            class="p-3 rounded-[14px] text-left border text-xs font-bold transition-all cursor-pointer"
            :class="[
              selectedId === item.id
                ? 'bg-[#0b1220] border-[#74b9ff] text-[#eaf2ff] shadow-md ring-1 ring-[#74b9ff]'
                : 'bg-[#0b1220] border-[#25314a] text-[#8fa3c4] hover:border-[#8fa3c4]/50 hover:text-[#eaf2ff]',
            ]"
            @click="selectedId = item.id"
          >
            {{ item.title }}
          </button>
        </div>

        <!-- The "Because" UX Explanation Box -->
        <div class="p-4 rounded-[14px] bg-[#0b1220] border border-[#25314a] mb-5">
          <div
            class="text-[11px] font-extrabold uppercase tracking-wider text-[#d0ebff] mb-1 font-mono"
          >
            The “Because” (Why this Micro-Interaction Exists)
          </div>
          <p class="text-xs text-[#eaf2ff] leading-relaxed">
            {{ activeItem.because }}
          </p>
        </div>

        <!-- Interactive Live Stress-Tester Sandbox -->
        <div class="bg-[#0b1220] border border-[#25314a] rounded-[16px] p-5 mb-5">
          <div class="flex items-center justify-between mb-4">
            <span
              class="text-xs font-bold uppercase tracking-wider text-[#8fa3c4] flex items-center gap-1.5 font-mono"
            >
              <Sliders class="w-3.5 h-3.5 text-[#d0ebff]" />
              Live Edge-Case Stress Tester
            </span>
            <button
              v-if="selectedId === 'rolling-counter'"
              type="button"
              class="px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer"
              :class="[
                slowMo
                  ? 'bg-[#121a2b] border-[#74b9ff] text-[#d0ebff]'
                  : 'bg-[#121a2b] border-[#25314a] text-[#8fa3c4]',
              ]"
              @click="slowMo = !slowMo"
            >
              Slow-Mo (0.2x Speed): {{ slowMo ? 'ON' : 'OFF' }}
            </button>
          </div>

          <!-- Sandbox Preview Area -->
          <div
            class="py-6 flex flex-col items-center justify-center bg-[#121a2b] rounded-xl border border-[#25314a] mb-3"
          >
            <div v-if="selectedId === 'rolling-counter'" class="flex items-center gap-4">
              <button
                type="button"
                class="px-3 py-1.5 rounded-xl bg-[#0b1220] border border-[#25314a] text-[#8fa3c4] hover:text-[#eaf2ff] text-xs font-bold cursor-pointer"
                @click="demoCount -= 15"
              >
                -15
              </button>
              <div
                class="px-5 py-2.5 rounded-2xl bg-[#0b1220] border border-[#25314a] flex items-center gap-2"
              >
                <span class="text-xl">🪙</span>
                <RollingCounter
                  :value="demoCount"
                  :slow-mo="slowMo"
                  class="text-2xl text-[#f5c242]"
                />
              </div>
              <button
                type="button"
                class="px-3 py-1.5 rounded-xl bg-sky-gradient text-[#0b1220] text-xs font-bold cursor-pointer"
                @click="demoCount += 25"
              >
                +25
              </button>
            </div>

            <div
              v-else-if="selectedId === 'smart-overflow'"
              class="flex flex-col items-center gap-3 w-full px-6"
            >
              <SmartAvatarOverflow
                :participants="SIMULATED_FRIENDS.map(f => ({ ...f, isOnline: true }))"
                :max-visible="maxAvatars"
              />
              <div class="flex items-center gap-3 text-xs text-[#8fa3c4] mt-2">
                <span>Max Visible Avatars: {{ maxAvatars }}</span>
                <input
                  v-model.number="maxAvatars"
                  type="range"
                  min="1"
                  max="5"
                  class="accent-[#74b9ff] cursor-pointer"
                />
              </div>
            </div>

            <div v-else-if="selectedId === 'hold-confirm'">
              <HoldToConfirmButton
                label="Hold 1.2s to Test Destructive Action"
                @confirm="() => {}"
              />
            </div>
          </div>
        </div>

        <!-- 1-Line CLI Install Command -->
        <div class="mb-4">
          <div class="text-xs font-semibold text-[#8fa3c4] mb-1.5">
            1-Line CLI Install (MIT Licensed)
          </div>
          <div
            class="flex items-center justify-between bg-[#0b1220] border border-[#25314a] rounded-xl px-3.5 py-2 font-mono text-xs text-[#d0ebff]"
          >
            <span class="truncate">{{ activeItem.cliCommand }}</span>
            <button
              type="button"
              class="text-[#8fa3c4] hover:text-[#eaf2ff] ml-2 shrink-0 cursor-pointer"
              @click="copyText(activeItem.cliCommand)"
            >
              <Copy class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <!-- Vue 3 vs React Code Tabs -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <div
              class="flex items-center gap-1 bg-[#0b1220] p-1 rounded-xl border border-[#25314a]"
            >
              <button
                type="button"
                class="px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                :class="[
                  framework === 'vue'
                    ? 'bg-[#121a2b] text-[#d0ebff] border border-[#25314a]'
                    : 'text-[#8fa3c4] hover:text-[#eaf2ff]',
                ]"
                @click="framework = 'vue'"
              >
                Vue 3 (.vue)
              </button>
              <button
                type="button"
                class="px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                :class="[
                  framework === 'react'
                    ? 'bg-[#121a2b] text-[#d0ebff] border border-[#25314a]'
                    : 'text-[#8fa3c4] hover:text-[#eaf2ff]',
                ]"
                @click="framework = 'react'"
              >
                React (.tsx)
              </button>
            </div>

            <button
              type="button"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0b1220] hover:bg-[#25314a] border border-[#25314a] text-xs font-bold text-[#eaf2ff] cursor-pointer transition-colors"
              @click="copyText(codeToDisplay)"
            >
              <template v-if="copied">
                <Check class="w-3.5 h-3.5 text-[#3fb950]" />
                <span class="text-[#3fb950]">Copied!</span>
              </template>
              <template v-else>
                <Copy class="w-3.5 h-3.5 text-[#d0ebff]" />
                <span>Copy Code</span>
              </template>
            </button>
          </div>

          <pre
            class="bg-[#0b1220] border border-[#25314a] rounded-2xl p-4 text-xs font-mono text-[#eaf2ff] overflow-x-auto leading-relaxed"
          ><code>{{ codeToDisplay }}</code></pre>
        </div>
      </div>
    </div>
  </div>
</template>
