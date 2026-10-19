<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    value: number
    slowMo?: boolean
  }>(),
  {
    slowMo: false,
  },
)

const prevValue = ref(props.value)
const direction = ref<'up' | 'down'>('up')
const animating = ref(false)
let timer: ReturnType<typeof setTimeout> | null = null

watch(
  () => props.value,
  (next, prev) => {
    if (next !== prev) {
      direction.value = next > prev ? 'up' : 'down'
      animating.value = true
      const duration = props.slowMo ? 900 : 280
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        prevValue.value = next
        animating.value = false
      }, duration)
    }
  },
)

onUnmounted(() => {
  if (timer) clearTimeout(timer)
})
</script>

<template>
  <span
    class="inline-flex items-center justify-center relative overflow-hidden tabular-nums font-black"
    :style="{ height: '1.35em', minWidth: `${String(value).length}ch` }"
  >
    <template v-if="animating">
      <span
        class="inline-block transition-all ease-out"
        :style="{
          transitionDuration: slowMo ? '900ms' : '280ms',
          transform: direction === 'up' ? 'translateY(-110%)' : 'translateY(110%)',
          opacity: 0,
        }"
      >
        {{ prevValue }}
      </span>
      <span
        class="inline-block absolute inset-0 flex items-center justify-center animate-in fade-in"
        :style="{
          animationDuration: slowMo ? '900ms' : '280ms',
        }"
      >
        {{ value }}
      </span>
    </template>
    <span v-else>{{ value }}</span>
  </span>
</template>
