<script setup lang="ts">
import { OrbitControls } from '@tresjs/cientos'
import SceneEnvironment from '~/components/three/SceneEnvironment.vue'
import CoinDropZone from '~/components/three/CoinDropZone.vue'
import CoinModel from '~/components/three/CoinModel.vue'

const { coins } = useCoinDrop()
</script>

<template>
  <div class="w-full h-full absolute inset-0">
    <TresCanvas clear-color="#0a0a16" shadows window-size>
      <TresPerspectiveCamera :position="[0, 5, 8]" :look-at="[0, 1, 0]" />
      <OrbitControls
        :enable-damping="true"
        :target="[0, 1, 0]"
        :max-polar-angle="Math.PI / 2 - 0.05"
        :min-distance="3"
        :max-distance="15"
      />

      <SceneEnvironment />
      <CoinDropZone />

      <CoinModel v-for="coin in coins" :key="coin.id" :coin="coin" />
    </TresCanvas>
  </div>
</template>
