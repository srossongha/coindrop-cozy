<script setup lang="ts">
import { OrbitControls } from '@tresjs/cientos'
import SceneEnvironment from '~/components/three/SceneEnvironment.vue'
import CoinDropZone from '~/components/three/CoinDropZone.vue'
import CoinModel from '~/components/three/CoinModel.vue'
import CoinPhysicsController from '~/components/three/CoinPhysicsController.vue'

const { coins } = useCoinDrop()
</script>

<template>
  <div class="w-full h-full absolute inset-0">
    <TresCanvas clear-color="#0a0a16" shadows window-size>
      <TresPerspectiveCamera :position="[0, 5, 8]" :look-at="[0, 1, 0]" />
      <OrbitControls
        :enable-damping="true"
        :max-polar-angle="Math.PI / 2 - 0.05"
        :min-distance="3"
        :max-distance="15"
      />

      <SceneEnvironment />
      <CoinDropZone />
      <CoinPhysicsController />

      <CoinModel
        v-for="coin in coins"
        :key="coin.id"
        :position="coin.position"
        :rotation="coin.rotation"
        :color="coin.color"
      />
    </TresCanvas>
  </div>
</template>
