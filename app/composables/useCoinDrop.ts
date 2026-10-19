import type { CoinItem } from '~/types'
import { randomRange, COIN_COLORS } from '~/utils/math'

export function useCoinDrop() {
  const coins = useState<CoinItem[]>('coindrop-coins', () => [])
  const coinsDroppedCount = useState<number>('coindrop-count', () => 0)
  const totalScore = useState<number>('coindrop-score', () => 0)

  function dropCoin() {
    const randomColor = COIN_COLORS[Math.floor(Math.random() * COIN_COLORS.length)] || '#f5c242'
    const pointValue = randomColor === '#d0ebff' ? 50 : randomColor === '#74b9ff' ? 25 : 10

    const newCoin: CoinItem = {
      id: `coin-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      position: [randomRange(-0.8, 0.8), randomRange(5.5, 6.5), randomRange(-0.8, 0.8)],
      rotation: [randomRange(0, Math.PI), randomRange(0, Math.PI), randomRange(0, Math.PI)],
      velocity: [randomRange(-0.5, 0.5), randomRange(-0.2, 0.5), randomRange(-0.5, 0.5)],
      rotationSpeed: [randomRange(2, 6), randomRange(3, 8), randomRange(1, 4)],
      value: pointValue,
      color: randomColor,
      settled: false,
    }

    coins.value.push(newCoin)
    coinsDroppedCount.value++
    totalScore.value += pointValue

    // Limit maximum active coins in scene for smooth rendering performance
    if (coins.value.length > 50) {
      coins.value.shift()
    }
  }

  function resetCoins() {
    coins.value = []
    coinsDroppedCount.value = 0
    totalScore.value = 0
  }

  return {
    coins,
    coinsDroppedCount,
    totalScore,
    dropCoin,
    resetCoins,
  }
}
