import type { CoinItem } from '~/types'
import { randomRange, COIN_COLORS } from '~/utils/math'

export function useCoinDrop() {
  const coins = useState<CoinItem[]>('coindrop-coins', () => [])
  const coinsDroppedCount = useState<number>('coindrop-count', () => 0)
  const totalScore = useState<number>('coindrop-score', () => 0)

  const GRAVITY = -14
  const FLOOR_Y = 0.2
  const BOUNCE_DAMPING = 0.55
  const FRICTION = 0.96

  function dropCoin() {
    const randomColor = COIN_COLORS[Math.floor(Math.random() * COIN_COLORS.length)] || '#f59e0b'
    const pointValue = randomColor === '#38bdf8' ? 50 : randomColor === '#f97316' ? 25 : 10

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

  function updatePhysics(delta: number) {
    const dt = Math.min(delta, 0.05) // Cap delta time to prevent large steps

    for (const coin of coins.value) {
      if (coin.settled) continue

      // Apply gravity
      coin.velocity[1] += GRAVITY * dt

      // Apply velocity to position
      coin.position[0] += coin.velocity[0] * dt
      coin.position[1] += coin.velocity[1] * dt
      coin.position[2] += coin.velocity[2] * dt

      // Apply rotation
      coin.rotation[0] += coin.rotationSpeed[0] * dt
      coin.rotation[1] += coin.rotationSpeed[1] * dt
      coin.rotation[2] += coin.rotationSpeed[2] * dt

      // Floor collision check
      if (coin.position[1] <= FLOOR_Y) {
        coin.position[1] = FLOOR_Y
        coin.velocity[1] = -coin.velocity[1] * BOUNCE_DAMPING
        coin.velocity[0] *= FRICTION
        coin.velocity[2] *= FRICTION
        coin.rotationSpeed[0] *= 0.8
        coin.rotationSpeed[1] *= 0.8
        coin.rotationSpeed[2] *= 0.8

        // Check if stopped bouncing
        if (Math.abs(coin.velocity[1]) < 0.2 && Math.abs(coin.velocity[0]) < 0.1) {
          coin.velocity = [0, 0, 0]
          coin.rotationSpeed = [0, 0, 0]
          // Settle flat on the ground
          coin.rotation[0] = Math.PI / 2
          coin.settled = true
        }
      }
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
    updatePhysics,
    resetCoins,
  }
}
