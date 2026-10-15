export interface CoinItem {
  id: string
  position: [number, number, number]
  rotation: [number, number, number]
  velocity: [number, number, number]
  rotationSpeed: [number, number, number]
  value: number
  color: string
  settled: boolean
}

export interface SceneConfig {
  cameraPosition: [number, number, number]
  cameraFov: number
  ambientIntensity: number
  directionalPosition: [number, number, number]
  directionalIntensity: number
  enableControls: boolean
}

export interface GameStats {
  coinsDropped: number
  totalScore: number
}
