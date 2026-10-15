<script setup lang="ts">
import { shallowRef } from 'vue'
import { useLoop } from '@tresjs/core'
import type { Mesh } from 'three'
import type { CoinItem } from '~/types'

const props = defineProps<{
  coin: CoinItem
}>()

const meshRef = shallowRef<Mesh | null>(null)
const { onBeforeRender } = useLoop()

const pos = [...props.coin.position] as [number, number, number]
const vel = [...props.coin.velocity] as [number, number, number]
const rot = [...props.coin.rotation] as [number, number, number]
const rotSpeed = [...props.coin.rotationSpeed] as [number, number, number]
let settled = props.coin.settled

const GRAVITY = -14
const FLOOR_Y = 0.24
const BOUNCE_DAMPING = 0.55
const FRICTION = 0.95

onBeforeRender(({ delta }) => {
  if (settled || !meshRef.value) return

  const dt = Math.min(delta, 0.05)

  vel[1] += GRAVITY * dt
  pos[0] += vel[0] * dt
  pos[1] += vel[1] * dt
  pos[2] += vel[2] * dt

  rot[0] += rotSpeed[0] * dt
  rot[1] += rotSpeed[1] * dt
  rot[2] += rotSpeed[2] * dt

  if (pos[1] <= FLOOR_Y) {
    pos[1] = FLOOR_Y
    vel[1] = -vel[1] * BOUNCE_DAMPING
    vel[0] *= FRICTION
    vel[2] *= FRICTION
    rotSpeed[0] *= 0.8
    rotSpeed[1] *= 0.8
    rotSpeed[2] *= 0.8

    if (Math.abs(vel[1]) < 0.25 && Math.abs(vel[0]) < 0.1 && Math.abs(vel[2]) < 0.1) {
      vel[0] = 0
      vel[1] = 0
      vel[2] = 0
      rotSpeed[0] = 0
      rotSpeed[1] = 0
      rotSpeed[2] = 0
      rot[0] = 0
      settled = true
    }
  }

  meshRef.value.position.set(pos[0], pos[1], pos[2])
  meshRef.value.rotation.set(rot[0], rot[1], rot[2])
})
</script>

<template>
  <TresMesh ref="meshRef" :position="coin.position" :rotation="coin.rotation" cast-shadow>
    <TresCylinderGeometry :args="[0.45, 0.45, 0.08, 32]" />
    <TresMeshStandardMaterial :color="coin.color" :metalness="0.85" :roughness="0.2" />
  </TresMesh>
</template>
