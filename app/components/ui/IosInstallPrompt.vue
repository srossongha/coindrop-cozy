<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { X } from 'lucide-vue-next'

const showPrompt = ref(false)
const STORAGE_KEY = 'coindrop_pwa_install_dismissed'

onMounted(() => {
  if (!import.meta.client || typeof window === 'undefined') return

  try {
    // 1. Check if user previously dismissed
    if (localStorage.getItem(STORAGE_KEY) === 'true') {
      return
    }

    // 2. Check if already installed / running in standalone mode
    const isStandalone =
      ('standalone' in window.navigator &&
        (window.navigator as { standalone?: boolean }).standalone === true) ||
      window.matchMedia('(display-mode: standalone)').matches

    if (isStandalone) {
      return
    }

    // 3. Detect iOS Safari
    const ua = window.navigator.userAgent.toLowerCase()
    const isIos =
      /iphone|ipad|ipod/.test(ua) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

    // Ensure it's Safari and not Chrome (CriOS) or Firefox (FxiOS)
    const isSafari =
      isIos &&
      /safari/.test(ua) &&
      !/crios|fxios|edgios|opt|opr/.test(ua) &&
      !(window as unknown as { chrome?: unknown }).chrome

    if (isSafari) {
      // Small timeout so it doesn't jarringly pop up on first frame
      setTimeout(() => {
        showPrompt.value = true
      }, 1200)
    }
  } catch {
    // Graceful fallback for sandboxed localStorage
  }
})

function dismiss() {
  showPrompt.value = false
  if (import.meta.client && typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, 'true')
    } catch {
      // ignore
    }
  }
}
</script>

<template>
  <Transition name="dropdown-slide">
    <aside
      v-if="showPrompt"
      aria-label="Install App"
      class="fixed bottom-[max(1rem,env(safe-area-inset-bottom,0px))] left-3 right-3 sm:left-auto sm:right-4 sm:max-w-md z-50 p-3 sm:p-3.5 rounded-2xl bg-card/95 border border-line backdrop-blur-xl shadow-2xl flex items-center gap-3 animate-toast-pop select-none"
    >
      <!-- App Icon -->
      <div
        class="w-10 h-10 rounded-xl bg-canvas border border-line flex items-center justify-center p-1 shrink-0 shadow-sm"
      >
        <img src="/logo-mark.png" alt="CoinDrop" class="w-full h-full object-contain" />
      </div>

      <!-- Banner Text -->
      <div class="flex-1 min-w-0 pr-1">
        <div class="flex items-center gap-1.5">
          <span class="text-xs font-bold text-text-primary">Install CoinDrop</span>
          <span
            class="text-[9px] px-1.5 py-0.2 rounded-full bg-sky-end/15 text-sky-end font-semibold border border-sky-end/30"
          >
            PWA
          </span>
        </div>
        <p class="text-[11px] text-text-muted leading-tight mt-0.5">
          Tap
          <span
            class="inline-flex items-center px-1 py-0.2 rounded bg-line/60 text-sky-soft font-semibold mx-0.5 align-baseline"
          >
            <svg
              class="w-3 h-3 inline-block mr-0.5 text-sky-end"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
            Share
          </span>
          then <strong class="text-text-primary font-medium">Add to Home Screen</strong>
        </p>
      </div>

      <!-- Dismiss Button -->
      <button
        type="button"
        class="p-1.5 rounded-xl bg-canvas hover:bg-line text-text-muted hover:text-text-primary transition-colors cursor-pointer shrink-0 border border-line"
        title="Dismiss"
        @click="dismiss"
      >
        <X class="w-3.5 h-3.5" />
      </button>
    </aside>
  </Transition>
</template>
