<script setup lang="ts">
import { useLoop } from '@tresjs/core'

const { updatePhysics } = useCoinDrop()
const { onBeforeRender } = useLoop()

onBeforeRender(({ delta }) => {
  updatePhysics(delta)
})
</script>

<template>
  <TresGroup />
</template>
